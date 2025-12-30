import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Schema for course creation
const courseCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  instructor: z.string().min(1, 'Instructor is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  courseLevel: z.enum(['LEVEL_1_FREE', 'LEVEL_2_FOUNDATION', 'LEVEL_3_PRACTICAL', 'LEVEL_4_ADVANCED', 'COMMUNITY', 'CERTIFICATION']),
  language: z.string().default('en'),
  languages: z.array(z.string()).optional(),
  duration: z.number().min(1, 'Duration is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().default('INR'),
  originalPrice: z.number().optional(),
  priceTier: z.enum(['FREE', 'TIER_1', 'TIER_2', 'TIER_3', 'TIER_4']),
  thumbnail: z.string().optional(),
  videoUrl: z.string().optional(),
  previewUrl: z.string().optional(),
  materials: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  learningObjectives: z.array(z.string()).optional(),
  targetAudience: z.array(z.string()).optional(),
  keyTopics: z.array(z.string()).optional(),
  modules: z.array(z.object({
    title: z.string(),
    description: z.string(),
    duration: z.number(),
    order: z.number()
  })).optional(),
  outcomes: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  isCertificate: z.boolean().default(false),
  certificateType: z.enum(['COMPLETION', 'ACHIEVEMENT', 'PROFESSIONAL']).optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  estimatedHours: z.number().optional(),
  accessType: z.enum(['LIFETIME', 'SUBSCRIPTION', 'RENTAL']).default('LIFETIME'),
  maxEnrollments: z.number().optional(),
  prerequisitesCourses: z.array(z.string()).optional(),
  relatedCourses: z.array(z.string()).optional(),
  instructorBio: z.string().optional(),
  instructorAvatar: z.string().optional(),
  instructorTitle: z.string().optional(),
  faq: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).optional(),
  reviewsEnabled: z.boolean().default(true),
  discussionsEnabled: z.boolean().default(true),
  certificateEnabled: z.boolean().default(false),
  autoApprove: z.boolean().default(true)
});

// Schema for course update
const courseUpdateSchema = courseCreateSchema.partial();

// GET /api/courses - List all courses with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const courseLevel = searchParams.get('courseLevel');
    const language = searchParams.get('language');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const certificate = searchParams.get('certificate');

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {
      status: 'ACTIVE'
    };

    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level;
    }

    if (courseLevel) {
      where.courseLevel = courseLevel;
    }

    if (language) {
      where.language = language;
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin);
      if (priceMax) where.price.lte = parseFloat(priceMax);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { instructor: { contains: search, mode: 'insensitive' } },
        { keyTopics: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (certificate === 'true') {
      where.isCertificate = true;
    }

    // Get courses with pagination
    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isFeatured: 'desc' },
          { enrollmentCount: 'desc' },
          { rating: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          _count: {
            select: {
              enrollments: true,
              reviews: true,
              chapters: true
            }
          }
        }
      }),
      db.course.count({ where })
    ]);

    // Format courses for response
    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      instructorBio: course.instructorBio,
      instructorAvatar: course.instructorAvatar,
      instructorTitle: course.instructorTitle,
      category: course.category,
      subcategory: course.subcategory,
      level: course.level,
      courseLevel: course.courseLevel,
      language: course.language,
      languages: course.languages ? JSON.parse(course.languages) : [],
      duration: course.duration,
      estimatedHours: course.estimatedHours,
      price: parseFloat(course.price.toString()),
      currency: course.currency,
      originalPrice: course.originalPrice ? parseFloat(course.originalPrice.toString()) : null,
      priceTier: course.priceTier,
      thumbnail: course.thumbnail,
      videoUrl: course.videoUrl,
      previewUrl: course.previewUrl,
      targetAudience: course.targetAudience ? JSON.parse(course.targetAudience) : [],
      keyTopics: course.keyTopics ? JSON.parse(course.keyTopics) : [],
      outcomes: course.outcomes ? JSON.parse(course.outcomes) : [],
      isFeatured: course.isFeatured,
      isCertificate: course.isCertificate,
      certificateType: course.certificateType,
      tags: course.tags ? JSON.parse(course.tags) : [],
      difficulty: course.difficulty,
      accessType: course.accessType,
      rating: parseFloat(course.rating.toString()),
      reviewCount: course.reviewCount,
      enrollmentCount: course.enrollmentCount,
      completionRate: parseFloat(course.completionRate.toString()),
      viewCount: course.viewCount,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      publishedAt: course.publishedAt,
      // Include counts
      _count: {
        enrollments: course._count.enrollments,
        reviews: course._count.reviews,
        chapters: course._count.chapters
      }
    }));

    return NextResponse.json({
      courses: formattedCourses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = courseCreateSchema.parse(body);

    // Create course
    const course = await db.course.create({
      data: {
        ...validatedData,
        languages: validatedData.languages ? JSON.stringify(validatedData.languages) : null,
        materials: validatedData.materials ? JSON.stringify(validatedData.materials) : null,
        prerequisites: validatedData.prerequisites ? JSON.stringify(validatedData.prerequisites) : null,
        learningObjectives: validatedData.learningObjectives ? JSON.stringify(validatedData.learningObjectives) : null,
        targetAudience: validatedData.targetAudience ? JSON.stringify(validatedData.targetAudience) : null,
        keyTopics: validatedData.keyTopics ? JSON.stringify(validatedData.keyTopics) : null,
        modules: validatedData.modules ? JSON.stringify(validatedData.modules) : null,
        outcomes: validatedData.outcomes ? JSON.stringify(validatedData.outcomes) : null,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        prerequisitesCourses: validatedData.prerequisitesCourses ? JSON.stringify(validatedData.prerequisitesCourses) : null,
        relatedCourses: validatedData.relatedCourses ? JSON.stringify(validatedData.relatedCourses) : null,
        faq: validatedData.faq ? JSON.stringify(validatedData.faq) : null,
        publishedAt: validatedData.status === 'ACTIVE' ? new Date() : null
      }
    });

    return NextResponse.json({
      message: 'Course created successfully',
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        category: course.category,
        level: course.level,
        courseLevel: course.courseLevel,
        price: parseFloat(course.price.toString()),
        currency: course.currency,
        status: course.status,
        createdAt: course.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating course:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}