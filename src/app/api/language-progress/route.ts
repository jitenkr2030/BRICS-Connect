import { db } from '@/lib/db';
import { z } from 'zod';

const updateProgressSchema = z.object({
  userId: z.string(),
  lessonId: z.string(),
  completed: z.boolean().optional(),
  completionTime: z.number().optional(),
  score: z.number().optional(),
  vocabularyMastered: z.array(z.string()).optional(),
  phrasesMastered: z.array(z.string()).optional(),
  skillProgress: z.any().optional(),
});

// GET /api/language-progress - Get user progress
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    const courseId = searchParams.get('courseId') || '';
    const lessonId = searchParams.get('lessonId') || '';

    const where: any = {};
    if (userId) where.userId = userId;
    if (courseId) where.courseId = courseId;
    if (lessonId) where.lessonId = lessonId;

    const progress = await db.languageProgress.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
            duration: true,
            order: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return Response.json(progress);
  } catch (error) {
    console.error('Error fetching language progress:', error);
    return Response.json({ error: 'Failed to fetch language progress' }, { status: 500 });
  }
}

// POST /api/language-progress - Update or create progress
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = updateProgressSchema.parse(body);

    const { userId, lessonId, ...updateData } = validatedData;

    // Get course ID from lesson
    const lesson = await db.languageLesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true }
    });

    if (!lesson) {
      return Response.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const progress = await db.languageProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        ...updateData,
        courseId: lesson.courseId,
        completedAt: updateData.completed ? new Date() : undefined,
        vocabularyMastered: updateData.vocabularyMastered ? JSON.stringify(updateData.vocabularyMastered) : undefined,
        phrasesMastered: updateData.phrasesMastered ? JSON.stringify(updateData.phrasesMastered) : undefined,
        skillProgress: updateData.skillProgress ? JSON.stringify(updateData.skillProgress) : undefined,
      },
      create: {
        userId,
        lessonId,
        courseId: lesson.courseId,
        ...updateData,
        vocabularyMastered: updateData.vocabularyMastered ? JSON.stringify(updateData.vocabularyMastered) : null,
        phrasesMastered: updateData.phrasesMastered ? JSON.stringify(updateData.phrasesMastered) : null,
        skillProgress: updateData.skillProgress ? JSON.stringify(updateData.skillProgress) : null,
      }
    });

    // Update overall enrollment progress
    const totalLessons = await db.languageLesson.count({
      where: { courseId: lesson.courseId, isPublished: true }
    });

    const completedLessons = await db.languageProgress.count({
      where: {
        userId,
        courseId: lesson.courseId,
        completed: true
      }
    });

    const progressPercentage = (completedLessons / totalLessons) * 100;

    await db.languageEnrollment.updateMany({
      where: {
        userId,
        courseId: lesson.courseId
      },
      data: {
        progress: progressPercentage,
        lastAccessed: new Date()
      }
    });

    return Response.json(progress);
  } catch (error) {
    console.error('Error updating language progress:', error);
    return Response.json({ error: 'Failed to update language progress' }, { status: 500 });
  }
}