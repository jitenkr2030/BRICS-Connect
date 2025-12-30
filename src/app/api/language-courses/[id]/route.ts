import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// GET /api/language-courses/[id] - Get specific language course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await db.languageCourse.findUnique({
      where: { id: params.id },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' }
        },
        assessments: {
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            enrollments: true,
            certificates: true,
          }
        }
      }
    });

    if (!course) {
      return Response.json({ error: 'Language course not found' }, { status: 404 });
    }

    return Response.json(course);
  } catch (error) {
    console.error('Error fetching language course:', error);
    return Response.json({ error: 'Failed to fetch language course' }, { status: 500 });
  }
}

// PUT /api/language-courses/[id] - Update language course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const course = await db.languageCourse.update({
      where: { id: params.id },
      data: {
        ...body,
        focusAreas: body.focusAreas ? JSON.stringify(body.focusAreas) : undefined,
        businessContext: body.businessContext ? JSON.stringify(body.businessContext) : undefined,
        tags: body.tags ? JSON.stringify(body.tags) : undefined,
        requirements: body.requirements ? JSON.stringify(body.requirements) : undefined,
        outcomes: body.outcomes ? JSON.stringify(body.outcomes) : undefined,
        keyTopics: body.keyTopics ? JSON.stringify(body.keyTopics) : undefined,
      }
    });

    return Response.json(course);
  } catch (error) {
    console.error('Error updating language course:', error);
    return Response.json({ error: 'Failed to update language course' }, { status: 500 });
  }
}

// DELETE /api/language-courses/[id] - Delete language course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.languageCourse.delete({
      where: { id: params.id }
    });

    return Response.json({ message: 'Language course deleted successfully' });
  } catch (error) {
    console.error('Error deleting language course:', error);
    return Response.json({ error: 'Failed to delete language course' }, { status: 500 });
  }
}