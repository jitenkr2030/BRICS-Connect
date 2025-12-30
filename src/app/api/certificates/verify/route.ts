import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const verificationCode = searchParams.get('code');
    const certificateNumber = searchParams.get('number');

    if (!verificationCode && !certificateNumber) {
      return NextResponse.json(
        { error: 'Verification code or certificate number is required' },
        { status: 400 }
      );
    }

    const where: any = {};
    if (verificationCode) where.verificationCode = verificationCode;
    if (certificateNumber) where.certificateNumber = certificateNumber;

    const certificate = await db.certificate.findFirst({
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
            keyTopics: true,
            description: true,
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
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Calculate completion details
    const totalChapters = await db.courseChapter.count({
      where: { courseId: certificate.courseId },
    });

    const completedChapters = await db.courseProgress.count({
      where: {
        enrollmentId: certificate.enrollmentId,
        isCompleted: true,
      },
    });

    const completionPercentage = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

    return NextResponse.json({
      valid: true,
      certificate: {
        ...certificate,
        verificationDetails: {
          completionPercentage,
          totalChapters,
          completedChapters,
          verificationTimestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Certificate verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify certificate' },
      { status: 500 }
    );
  }
}