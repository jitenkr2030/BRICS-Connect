import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// GET /api/monetization/course-fees - Get course fee settings and calculate fees
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const amount = searchParams.get('amount');
    const userType = searchParams.get('userType');

    if (amount) {
      // Calculate platform fee for specific amount
      return await calculateCourseFee(parseFloat(amount), userType, courseId);
    }

    // Get course fee configuration
    const feeConfig = await db.feeConfiguration.findFirst({
      where: {
        type: 'COURSE_PLATFORM_FEE',
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: feeConfig
    });
  } catch (error) {
    console.error('Error fetching course fees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course fees' },
      { status: 500 }
    );
  }
}

// POST /api/monetization/course-fees - Create course fee record
const createCourseFeeSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  instructorId: z.string().min(1, 'Instructor ID is required'),
  coursePrice: z.number().min(0, 'Course price must be positive'),
  platformFee: z.number().min(0, 'Platform fee must be positive'),
  instructorRevenue: z.number().min(0, 'Instructor revenue must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  metadata: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCourseFeeSchema.parse(body);

    // Create transaction fee record for course platform fee
    const courseFeeRecord = await db.transactionFee.create({
      data: {
        transactionId: `ENROLLMENT_${validatedData.enrollmentId}`,
        userId: validatedData.userId,
        feeType: 'COURSE_FEE',
        baseAmount: validatedData.coursePrice,
        feeAmount: validatedData.platformFee,
        feeRate: (validatedData.platformFee / validatedData.coursePrice) * 100,
        currency: validatedData.currency,
        description: `Platform fee for course enrollment ${validatedData.enrollmentId}`,
        metadata: JSON.stringify({
          enrollmentId: validatedData.enrollmentId,
          courseId: validatedData.courseId,
          instructorId: validatedData.instructorId,
          instructorRevenue: validatedData.instructorRevenue
        })
      }
    });

    // Create revenue record for platform
    await db.revenueRecord.create({
      data: {
        source: 'COURSE_SALE',
        amount: validatedData.platformFee,
        currency: validatedData.currency,
        description: `Platform fee from course sale ${validatedData.courseId}`,
        metadata: JSON.stringify({
          enrollmentId: validatedData.enrollmentId,
          courseId: validatedData.courseId,
          instructorId: validatedData.instructorId,
          platformFee: validatedData.platformFee,
          instructorRevenue: validatedData.instructorRevenue
        })
      }
    });

    // Update enrollment with fee info
    await db.courseEnrollment.update({
      where: { id: validatedData.enrollmentId },
      data: {
        metadata: JSON.stringify({
          platformFee: {
            amount: validatedData.platformFee,
            instructorRevenue: validatedData.instructorRevenue,
            recordedAt: new Date().toISOString()
          }
        })
      }
    });

    return NextResponse.json({
      success: true,
      data: courseFeeRecord
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating course fee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create course fee' },
      { status: 500 }
    );
  }
}

async function calculateCourseFee(amount: number, userType?: string | null, courseId?: string | null) {
  try {
    // Get course fee configuration
    const feeConfig = await db.feeConfiguration.findFirst({
      where: {
        type: 'COURSE_PLATFORM_FEE',
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!feeConfig) {
      return NextResponse.json(
        { success: false, error: 'No course fee configuration found' },
        { status: 404 }
      );
    }

    let platformFee = 0;
    let feeRate = feeConfig.feeValue.toNumber();
    let instructorRevenue = amount;

    // Calculate platform fee based on fee type
    if (feeConfig.feeType === 'PERCENTAGE') {
      platformFee = amount * (feeRate / 100);
      instructorRevenue = amount - platformFee;
    } else if (feeConfig.feeType === 'FIXED') {
      platformFee = feeRate;
      instructorRevenue = amount - platformFee;
    } else if (feeConfig.feeType === 'TIERED') {
      // Tiered platform fee based on course price
      if (amount < 50) {
        platformFee = amount * 0.30; // 30%
      } else if (amount < 200) {
        platformFee = amount * 0.25; // 25%
      } else if (amount < 500) {
        platformFee = amount * 0.20; // 20%
      } else {
        platformFee = amount * 0.15; // 15%
      }
      instructorRevenue = amount - platformFee;
    }

    // Apply min/max fee constraints
    if (feeConfig.minFee && platformFee < feeConfig.minFee.toNumber()) {
      platformFee = feeConfig.minFee.toNumber();
      instructorRevenue = amount - platformFee;
    }
    if (feeConfig.maxFee && platformFee > feeConfig.maxFee.toNumber()) {
      platformFee = feeConfig.maxFee.toNumber();
      instructorRevenue = amount - platformFee;
    }

    // User type adjustments for platform fee
    if (userType) {
      const userTypeAdjustments: { [key: string]: number } = {
        'PREMIUM': 0.8, // 20% discount on platform fee for premium users
        'ENTERPRISE': 0.7, // 30% discount for enterprise users
        'STANDARD': 1.0,
        'BASIC': 1.1 // 10% higher platform fee for basic users
      };

      const adjustment = userTypeAdjustments[userType.toUpperCase()];
      if (adjustment) {
        platformFee *= adjustment;
        instructorRevenue = amount - platformFee;
      }
    }

    // Course-specific adjustments
    if (courseId) {
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { category: true, level: true }
      });

      if (course) {
        // Category-based adjustments
        const categoryAdjustments: { [key: string]: number } = {
          'TECHNOLOGY': 0.9, // 10% lower platform fee for tech courses
          'BUSINESS': 1.0,
          'ARTS': 1.1, // 10% higher platform fee for arts
          'LANGUAGE': 0.8, // 20% lower platform fee for language courses
          'SCIENCE': 0.95
        };

        const categoryAdjustment = categoryAdjustments[course.category.toUpperCase()];
        if (categoryAdjustment) {
          platformFee *= categoryAdjustment;
          instructorRevenue = amount - platformFee;
        }

        // Level-based adjustments
        const levelAdjustments: { [key: string]: number } = {
          'BEGINNER': 1.0,
          'INTERMEDIATE': 0.95, // 5% discount for intermediate
          'ADVANCED': 0.9 // 10% discount for advanced courses
        };

        const levelAdjustment = levelAdjustments[course.level];
        if (levelAdjustment) {
          platformFee *= levelAdjustment;
          instructorRevenue = amount - platformFee;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        coursePrice: amount,
        platformFee: Math.round(platformFee * 100) / 100, // Round to 2 decimal places
        instructorRevenue: Math.round(instructorRevenue * 100) / 100,
        feeRate: feeRate,
        currency: 'USD',
        breakdown: {
          platformPercentage: (platformFee / amount) * 100,
          instructorPercentage: (instructorRevenue / amount) * 100,
          userTypeAdjustment: userType ? userType.toUpperCase() : null,
          courseId
        }
      }
    });
  } catch (error) {
    console.error('Error calculating course fee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate course fee' },
      { status: 500 }
    );
  }
}