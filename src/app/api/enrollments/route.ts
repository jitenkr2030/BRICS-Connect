import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Schema for course enrollment
const enrollmentCreateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  paymentStatus: z.enum(['PAID', 'PENDING', 'REFUNDED']).default('PAID'),
  amountPaid: z.number().min(0, 'Amount paid must be non-negative'),
  currency: z.string().default('INR')
});

// Schema for enrollment update
const enrollmentUpdateSchema = z.object({
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'DROPPED']).optional(),
  paymentStatus: z.enum(['PAID', 'PENDING', 'REFUNDED']).optional(),
  amountPaid: z.number().min(0).optional(),
  currency: z.string().optional()
});

// GET /api/enrollments - Get user enrollments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (status) {
      where.status = status;
    }

    // Get enrollments with pagination
    const [enrollments, total] = await Promise.all([
      db.courseEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              instructor: true,
              category: true,
              level: true,
              courseLevel: true,
              price: true,
              currency: true,
              thumbnail: true,
              certificateEnabled: true,
              certificateType: true
            }
          },
          certificate: {
            select: {
              id: true,
              certificateUrl: true,
              issuedAt: true,
              expiresAt: true,
              verificationCode: true
            }
          }
        }
      }),
      db.courseEnrollment.count({ where })
    ]);

    // Format enrollments for response
    const formattedEnrollments = enrollments.map(enrollment => ({
      id: enrollment.id,
      user: enrollment.user,
      course: {
        ...enrollment.course,
        price: parseFloat(enrollment.course.price.toString())
      },
      progress: enrollment.progress,
      status: enrollment.status,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      lastAccessedAt: enrollment.lastAccessedAt,
      paymentStatus: enrollment.paymentStatus,
      amountPaid: parseFloat(enrollment.amountPaid.toString()),
      currency: enrollment.currency,
      certificate: enrollment.certificate,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt
    }));

    return NextResponse.json({
      enrollments: formattedEnrollments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

// POST /api/enrollments - Create new enrollment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = enrollmentCreateSchema.parse(body);

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: validatedData.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: validatedData.courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await db.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: validatedData.userId,
          courseId: validatedData.courseId
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'User is already enrolled in this course' },
        { status: 400 }
      );
    }

    // Check course enrollment limit
    if (course.maxEnrollments && course.currentEnrollments >= course.maxEnrollments) {
      return NextResponse.json(
        { error: 'Course has reached maximum enrollment limit' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await db.courseEnrollment.create({
      data: {
        ...validatedData,
        amountPaid: validatedData.amountPaid.toString(),
        currency: validatedData.currency
      }
    });

    // Update course enrollment count
    await db.course.update({
      where: { id: validatedData.courseId },
      data: {
        currentEnrollments: {
          increment: 1
        },
        enrollmentCount: {
          increment: 1
        }
      }
    });

    // Create notification for user
    await db.notification.create({
      data: {
        userId: validatedData.userId,
        type: 'COURSE',
        title: 'Enrollment Successful',
        message: `You have been successfully enrolled in ${course.title}`,
        data: JSON.stringify({
          courseId: course.id,
          enrollmentId: enrollment.id
        }),
        actionUrl: `/courses/${course.id}`
      }
    });

    return NextResponse.json({
      message: 'Enrollment created successfully',
      enrollment: {
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        progress: enrollment.progress,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        amountPaid: parseFloat(enrollment.amountPaid.toString()),
        currency: enrollment.currency,
        startedAt: enrollment.startedAt,
        createdAt: enrollment.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}