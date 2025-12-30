import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  instructor: z.string().min(1),
  category: z.string(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  language: z.string(),
  duration: z.number().positive(),
  price: z.number().positive(),
  currency: z.string(),
  thumbnail: z.string().optional(),
  videoUrl: z.string().optional(),
  materials: z.string().optional(),
  prerequisites: z.string().optional(),
  learningObjectives: z.string().optional(),
})

const enrollmentSchema = z.object({
  userId: z.string(),
  courseId: z.string(),
  amountPaid: z.number().positive(),
  currency: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = {
      status: 'ACTIVE',
      ...(category && { category }),
      ...(level && { level }),
    }

    const courses = await db.course.findMany({
      where,
      include: {
        _count: {
          select: { 
            enrollments: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return NextResponse.json({
      success: true,
      courses: courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        category: course.category,
        level: course.level,
        language: course.language.split(','),
        duration: course.duration,
        price: course.price,
        currency: course.currency,
        thumbnail: course.thumbnail,
        videoUrl: course.videoUrl,
        materials: course.materials ? JSON.parse(course.materials) : [],
        prerequisites: course.prerequisites ? JSON.parse(course.prerequisites) : [],
        learningObjectives: course.learningObjectives ? JSON.parse(course.learningObjectives) : [],
        rating: course.rating,
        reviewCount: course.reviewCount,
        enrollmentCount: course._count.enrollments,
        createdAt: course.createdAt,
      }))
    })

  } catch (error) {
    console.error('Courses fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'enroll') {
      const validatedData = enrollmentSchema.parse(data)

      // Check if user exists
      const user = await db.user.findUnique({
        where: { id: validatedData.userId }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Check if course exists
      const course = await db.course.findUnique({
        where: { id: validatedData.courseId }
      })

      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        )
      }

      // Check if already enrolled
      const existingEnrollment = await db.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: validatedData.userId,
            courseId: validatedData.courseId,
          }
        }
      })

      if (existingEnrollment) {
        return NextResponse.json(
          { error: 'Already enrolled in this course' },
          { status: 400 }
        )
      }

      // Create enrollment
      const enrollment = await db.courseEnrollment.create({
        data: {
          userId: validatedData.userId,
          courseId: validatedData.courseId,
          progress: 0,
          status: 'ACTIVE',
          startedAt: new Date(),
          lastAccessedAt: new Date(),
          paymentStatus: 'PAID',
          amountPaid: validatedData.amountPaid,
          currency: validatedData.currency,
        }
      })

      // Update course enrollment count
      await db.course.update({
        where: { id: validatedData.courseId },
        data: {
          enrollmentCount: {
            increment: 1
          }
        }
      })

      return NextResponse.json({
        success: true,
        enrollment: {
          id: enrollment.id,
          courseId: enrollment.courseId,
          progress: enrollment.progress,
          status: enrollment.status,
          startedAt: enrollment.startedAt,
        }
      })

    } else {
      // Create new course
      const validatedData = courseSchema.parse(data)

      const course = await db.course.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          instructor: validatedData.instructor,
          category: validatedData.category,
          level: validatedData.level,
          language: validatedData.language,
          duration: validatedData.duration,
          price: validatedData.price,
          currency: validatedData.currency,
          thumbnail: validatedData.thumbnail,
          videoUrl: validatedData.videoUrl,
          materials: validatedData.materials,
          prerequisites: validatedData.prerequisites,
          learningObjectives: validatedData.learningObjectives,
          status: 'ACTIVE',
          rating: 0.00,
          reviewCount: 0,
          enrollmentCount: 0,
        }
      })

      return NextResponse.json({
        success: true,
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          category: course.category,
          level: course.level,
          duration: course.duration,
          price: course.price,
          currency: course.currency,
          createdAt: course.createdAt,
        }
      })
    }

  } catch (error) {
    console.error('Course operation error:', error)
    return NextResponse.json(
      { error: 'Course operation failed' },
      { status: 500 }
    )
  }
}