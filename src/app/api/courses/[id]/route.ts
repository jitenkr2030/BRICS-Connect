import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Schema for course update
const courseUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  instructor: z.string().min(1, 'Instructor is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  subcategory: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  courseLevel: z.enum(['LEVEL_1_FREE', 'LEVEL_2_FOUNDATION', 'LEVEL_3_PRACTICAL', 'LEVEL_4_ADVANCED', 'COMMUNITY', 'CERTIFICATION']).optional(),
  language: z.string().optional(),
  languages: z.array(z.string()).optional(),
  duration: z.number().min(1, 'Duration is required').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  currency: z.string().optional(),
  originalPrice: z.number().optional(),
  priceTier: z.enum(['FREE', 'TIER_1', 'TIER_2', 'TIER_3', 'TIER_4']).optional(),
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
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  isFeatured: z.boolean().optional(),
  isCertificate: z.boolean().optional(),
  certificateType: z.enum(['COMPLETION', 'ACHIEVEMENT', 'PROFESSIONAL']).optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  estimatedHours: z.number().optional(),
  accessType: z.enum(['LIFETIME', 'SUBSCRIPTION', 'RENTAL']).optional(),
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
  reviewsEnabled: z.boolean().optional(),
  discussionsEnabled: z.boolean().optional(),
  certificateEnabled: z.boolean().optional(),
  autoApprove: z.boolean().optional()
});

// GET /api/courses/[id] - Get course details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get course with detailed information
    const course = await db.course.findUnique({
      where: { id },
      include: {
        chapters: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
            chapters: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get course reviews
    const reviews = await db.review.findMany({
      where: {
        targetType: 'COURSE',
        targetId: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Format course for response
    const formattedCourse = {
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
      materials: course.materials ? JSON.parse(course.materials) : [],
      prerequisites: course.prerequisites ? JSON.parse(course.prerequisites) : [],
      learningObjectives: course.learningObjectives ? JSON.parse(course.learningObjectives) : [],
      targetAudience: course.targetAudience ? JSON.parse(course.targetAudience) : [],
      keyTopics: course.keyTopics ? JSON.parse(course.keyTopics) : [],
      modules: course.modules ? JSON.parse(course.modules) : [],
      outcomes: course.outcomes ? JSON.parse(course.outcomes) : [],
      status: course.status,
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
      faq: course.faq ? JSON.parse(course.faq) : [],
      reviewsEnabled: course.reviewsEnabled,
      discussionsEnabled: course.discussionsEnabled,
      certificateEnabled: course.certificateEnabled,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      publishedAt: course.publishedAt,
      // Include chapters
      chapters: course.chapters.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        contentType: chapter.contentType,
        contentUrl: chapter.contentUrl,
        duration: chapter.duration,
        order: chapter.order,
        isPreview: chapter.isPreview,
        isRequired: chapter.isRequired,
        materials: chapter.materials ? JSON.parse(chapter.materials) : []
      })),
      // Include counts
      _count: {
        enrollments: course._count.enrollments,
        reviews: course._count.reviews,
        chapters: course._count.chapters
      },
      // Include reviews
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        isVerified: review.isVerified,
        helpfulCount: review.helpfulCount,
        createdAt: review.createdAt,
        user: review.user
      }))
    };

    return NextResponse.json({
      course: formattedCourse
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course details' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validatedData = courseUpdateSchema.parse(body);

    // Check if course exists
    const existingCourse = await db.course.findUnique({
      where: { id }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Update course
    const updatedCourse = await db.course.update({
      where: { id },
      data: {
        ...validatedData,
        languages: validatedData.languages ? JSON.stringify(validatedData.languages) : undefined,
        materials: validatedData.materials ? JSON.stringify(validatedData.materials) : undefined,
        prerequisites: validatedData.prerequisites ? JSON.stringify(validatedData.prerequisites) : undefined,
        learningObjectives: validatedData.learningObjectives ? JSON.stringify(validatedData.learningObjectives) : undefined,
        targetAudience: validatedData.targetAudience ? JSON.stringify(validatedData.targetAudience) : undefined,
        keyTopics: validatedData.keyTopics ? JSON.stringify(validatedData.keyTopics) : undefined,
        modules: validatedData.modules ? JSON.stringify(validatedData.modules) : undefined,
        outcomes: validatedData.outcomes ? JSON.stringify(validatedData.outcomes) : undefined,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : undefined,
        prerequisitesCourses: validatedData.prerequisitesCourses ? JSON.stringify(validatedData.prerequisitesCourses) : undefined,
        relatedCourses: validatedData.relatedCourses ? JSON.stringify(validatedData.relatedCourses) : undefined,
        faq: validatedData.faq ? JSON.stringify(validatedData.faq) : undefined,
        publishedAt: validatedData.status === 'ACTIVE' && !existingCourse.publishedAt ? new Date() : undefined
      }
    });

    return NextResponse.json({
      message: 'Course updated successfully',
      course: {
        id: updatedCourse.id,
        title: updatedCourse.title,
        description: updatedCourse.description,
        instructor: updatedCourse.instructor,
        category: updatedCourse.category,
        level: updatedCourse.level,
        courseLevel: updatedCourse.courseLevel,
        price: parseFloat(updatedCourse.price.toString()),
        currency: updatedCourse.currency,
        status: updatedCourse.status,
        updatedAt: updatedCourse.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating course:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if course exists
    const existingCourse = await db.course.findUnique({
      where: { id }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if course has enrollments
    const enrollmentCount = await db.courseEnrollment.count({
      where: { courseId: id }
    });

    if (enrollmentCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active enrollments' },
        { status: 400 }
      );
    }

    // Delete course (cascade will handle related records)
    await db.course.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}