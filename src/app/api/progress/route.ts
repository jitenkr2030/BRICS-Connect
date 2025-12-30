import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Schema for progress update
const progressUpdateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  chapterId: z.string().optional(),
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  progress: z.number().min(0).max(100).optional(),
  timeSpent: z.number().min(0).optional(),
  lastPosition: z.number().optional(),
  notes: z.string().optional()
});

// GET /api/progress - Get course progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const chapterId = searchParams.get('chapterId');
    const enrollmentId = searchParams.get('enrollmentId');

    // Build filter conditions
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (chapterId) {
      where.chapterId = chapterId;
    }

    if (enrollmentId) {
      where.enrollmentId = enrollmentId;
    }

    // Get progress records
    const progressRecords = await db.courseProgress.findMany({
      where,
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
            courseLevel: true
          }
        },
        chapter: {
          select: {
            id: true,
            title: true,
            description: true,
            contentType: true,
            duration: true,
            order: true
          }
        },
        enrollment: {
          select: {
            id: true,
            progress: true,
            status: true,
            completedAt: true
          }
        }
      },
      orderBy: [
        { courseId: 'asc' },
        { chapterId: 'asc' },
        { updatedAt: 'desc' }
      ]
    });

    // Format progress records for response
    const formattedProgress = progressRecords.map(record => ({
      id: record.id,
      user: record.user,
      course: record.course,
      chapter: record.chapter,
      enrollment: record.enrollment,
      status: record.status,
      progress: record.progress,
      timeSpent: record.timeSpent,
      lastPosition: record.lastPosition,
      notes: record.notes,
      completedAt: record.completedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }));

    return NextResponse.json({
      progress: formattedProgress
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// POST /api/progress - Update or create progress record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = progressUpdateSchema.parse(body);

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

    // Check if enrollment exists
    const enrollment = await db.courseEnrollment.findUnique({
      where: { id: validatedData.enrollmentId }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Check if chapter exists (if provided)
    if (validatedData.chapterId) {
      const chapter = await db.courseChapter.findUnique({
        where: { id: validatedData.chapterId }
      });

      if (!chapter) {
        return NextResponse.json(
          { error: 'Chapter not found' },
          { status: 404 }
        );
      }
    }

    // Create or update progress record
    const progress = await db.courseProgress.upsert({
      where: {
        userId_courseId_chapterId: {
          userId: validatedData.userId,
          courseId: validatedData.courseId,
          chapterId: validatedData.chapterId || ''
        }
      },
      update: {
        status: validatedData.status,
        progress: validatedData.progress,
        timeSpent: validatedData.timeSpent,
        lastPosition: validatedData.lastPosition,
        notes: validatedData.notes,
        completedAt: validatedData.status === 'COMPLETED' ? new Date() : undefined
      },
      create: {
        ...validatedData,
        completedAt: validatedData.status === 'COMPLETED' ? new Date() : undefined
      }
    });

    // Update enrollment progress if this is course-level progress
    if (!validatedData.chapterId && validatedData.progress !== undefined) {
      await db.courseEnrollment.update({
        where: { id: validatedData.enrollmentId },
        data: {
          progress: validatedData.progress,
          lastAccessedAt: new Date(),
          completedAt: validatedData.progress === 100 ? new Date() : undefined,
          status: validatedData.progress === 100 ? 'COMPLETED' : 'ACTIVE'
        }
      });

      // Update course completion rate
      const totalEnrollments = await db.courseEnrollment.count({
        where: { courseId: validatedData.courseId }
      });

      const completedEnrollments = await db.courseEnrollment.count({
        where: {
          courseId: validatedData.courseId,
          status: 'COMPLETED'
        }
      });

      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

      await db.course.update({
        where: { id: validatedData.courseId },
        data: { completionRate }
      });
    }

    // If chapter is completed, update course-level progress
    if (validatedData.chapterId && validatedData.status === 'COMPLETED') {
      const totalChapters = await db.courseChapter.count({
        where: {
          courseId: validatedData.courseId,
          isActive: true,
          isRequired: true
        }
      });

      const completedChapters = await db.courseProgress.count({
        where: {
          userId: validatedData.userId,
          courseId: validatedData.courseId,
          status: 'COMPLETED',
          chapterId: { not: '' }
        }
      });

      const courseProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

      await db.courseEnrollment.update({
        where: { id: validatedData.enrollmentId },
        data: {
          progress: courseProgress,
          lastAccessedAt: new Date(),
          completedAt: courseProgress === 100 ? new Date() : undefined,
          status: courseProgress === 100 ? 'COMPLETED' : 'ACTIVE'
        }
      });
    }

    return NextResponse.json({
      message: 'Progress updated successfully',
      progress: {
        id: progress.id,
        userId: progress.userId,
        courseId: progress.courseId,
        chapterId: progress.chapterId,
        enrollmentId: progress.enrollmentId,
        status: progress.status,
        progress: progress.progress,
        timeSpent: progress.timeSpent,
        lastPosition: progress.lastPosition,
        notes: progress.notes,
        completedAt: progress.completedAt,
        updatedAt: progress.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}