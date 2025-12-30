import { db } from '@/lib/db';
import { z } from 'zod';

const createEnrollmentSchema = z.object({
  userId: z.string(),
  courseId: z.string(),
});

// GET /api/language-enrollments - Get user enrollments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    const courseId = searchParams.get('courseId') || '';

    const where: any = {};
    if (userId) where.userId = userId;
    if (courseId) where.courseId = courseId;

    const enrollments = await db.languageEnrollment.findMany({
      where,
      include: {
        course: {
          include: {
            _count: {
              select: {
                lessons: true,
                enrollments: true,
              }
            }
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
      orderBy: { enrollmentDate: 'desc' }
    });

    return Response.json(enrollments);
  } catch (error) {
    console.error('Error fetching language enrollments:', error);
    return Response.json({ error: 'Failed to fetch language enrollments' }, { status: 500 });
  }
}

// POST /api/language-enrollments - Create new enrollment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, courseId } = createEnrollmentSchema.parse(body);

    // Check if already enrolled
    const existingEnrollment = await db.languageEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return Response.json({ error: 'Already enrolled in this course' }, { status: 400 });
    }

    const enrollment = await db.languageEnrollment.create({
      data: {
        userId,
        courseId,
      },
      include: {
        course: true
      }
    });

    return Response.json(enrollment, { status: 201 });
  } catch (error) {
    console.error('Error creating language enrollment:', error);
    return Response.json({ error: 'Failed to create language enrollment' }, { status: 500 });
  }
}