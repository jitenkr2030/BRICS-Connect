import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const issueCertificateSchema = z.object({
  enrollmentId: z.string(),
  certificateType: z.enum(['COMPLETION', 'ACHIEVEMENT', 'PROFESSIONAL']),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  metadata: z.object({
    score: z.number().optional(),
    grade: z.string().optional(),
    specializations: z.array(z.string()).optional(),
    issuerNotes: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = issueCertificateSchema.parse(body);

    // Check if enrollment exists and is completed
    const enrollment = await db.courseEnrollment.findUnique({
      where: { id: validatedData.enrollmentId },
      include: {
        user: true,
        course: true,
        progress: {
          where: { isCompleted: true },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Check if user has completed all required chapters
    const totalChapters = await db.courseChapter.count({
      where: { courseId: enrollment.courseId },
    });

    const completedChapters = await db.courseProgress.count({
      where: {
        enrollmentId: validatedData.enrollmentId,
        isCompleted: true,
      },
    });

    const completionPercentage = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

    // Only issue certificate if course is sufficiently completed
    if (completionPercentage < 80) {
      return NextResponse.json(
        { error: 'Course not sufficiently completed for certification' },
        { status: 400 }
      );
    }

    // Generate certificate number
    const certificateNumber = `BRICS-${enrollment.course.level}-${Date.now()}-${enrollment.userId.substring(0, 8)}`;

    // Create certificate
    const certificate = await db.certificate.create({
      data: {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        enrollmentId: validatedData.enrollmentId,
        certificateType: validatedData.certificateType,
        certificateNumber,
        issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : new Date(),
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
        metadata: validatedData.metadata || {},
        issuedBy: 'BRICS Connect Platform',
        verificationCode: `VERIFY-${certificateNumber}`,
        isVerified: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            level: true,
            duration: true,
            keyTopics: true,
          },
        },
      },
    });

    // Update enrollment with certificate
    await db.courseEnrollment.update({
      where: { id: validatedData.enrollmentId },
      data: { certificateId: certificate.id },
    });

    return NextResponse.json({
      success: true,
      certificate,
      completionPercentage,
    });
  } catch (error) {
    console.error('Certificate issuance error:', error);
    return NextResponse.json(
      { error: 'Failed to issue certificate' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const certificateType = searchParams.get('certificateType');

    const where: any = {};
    
    if (userId) where.userId = userId;
    if (courseId) where.courseId = courseId;
    if (certificateType) where.certificateType = certificateType;

    const certificates = await db.certificate.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            level: true,
            duration: true,
          },
        },
        enrollment: {
          select: {
            enrollmentDate: true,
            completionDate: true,
            progress: {
              where: { isCompleted: true },
            },
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('Certificate fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}