import { db } from '@/lib/db';
import { z } from 'zod';

// Schema definitions
const createLanguageCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  targetLanguage: z.string(),
  sourceLanguage: z.string(),
  level: z.string().default("BEGINNER"),
  category: z.string(),
  instructor: z.string(),
  duration: z.number(),
  price: z.number(),
  originalPrice: z.number().optional(),
  thumbnail: z.string().optional(),
  videoUrl: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
  businessContext: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  outcomes: z.array(z.string()).optional(),
  keyTopics: z.array(z.string()).optional(),
});

// GET /api/language-courses - List all language courses
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const targetLanguage = searchParams.get('targetLanguage') || '';
    const sourceLanguage = searchParams.get('sourceLanguage') || '';
    const level = searchParams.get('level') || '';
    const category = searchParams.get('category') || '';
    const isFeatured = searchParams.get('isFeatured') === 'true';

    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { instructor: { contains: search } },
      ];
    }

    if (targetLanguage) {
      where.targetLanguage = targetLanguage;
    }

    if (sourceLanguage) {
      where.sourceLanguage = sourceLanguage;
    }

    if (level) {
      where.level = level;
    }

    if (category) {
      where.category = category;
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    const [courses, total] = await Promise.all([
      db.languageCourse.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          _count: {
            select: {
              enrollments: true,
              lessons: true,
            }
          }
        }
      }),
      db.languageCourse.count({ where })
    ]);

    return Response.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching language courses:', error);
    return Response.json({ error: 'Failed to fetch language courses' }, { status: 500 });
  }
}

// POST /api/language-courses - Create new language course
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createLanguageCourseSchema.parse(body);

    const course = await db.languageCourse.create({
      data: {
        ...validatedData,
        focusAreas: validatedData.focusAreas ? JSON.stringify(validatedData.focusAreas) : null,
        businessContext: validatedData.businessContext ? JSON.stringify(validatedData.businessContext) : null,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        requirements: validatedData.requirements ? JSON.stringify(validatedData.requirements) : null,
        outcomes: validatedData.outcomes ? JSON.stringify(validatedData.outcomes) : null,
        keyTopics: validatedData.keyTopics ? JSON.stringify(validatedData.keyTopics) : null,
      }
    });

    return Response.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating language course:', error);
    return Response.json({ error: 'Failed to create language course' }, { status: 500 });
  }
}