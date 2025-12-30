import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['DISCUSSION', 'QUESTION', 'RESOURCE', 'ANNOUNCEMENT']).default('DISCUSSION'),
  courseId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createPostSchema.parse(body);

    // For demo purposes, we'll use a hardcoded user ID
    // In production, this would come from authentication
    const userId = 'demo-user-id';

    const post = await db.communityPost.create({
      data: {
        userId,
        title: validatedData.title,
        content: validatedData.content,
        type: validatedData.type,
        courseId: validatedData.courseId,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        attachments: validatedData.attachments ? JSON.stringify(validatedData.attachments) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = { status: 'ACTIVE' };
    if (courseId) where.courseId = courseId;
    if (type) where.type = type;

    const posts = await db.communityPost.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    });

    const total = await db.communityPost.count({ where });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}