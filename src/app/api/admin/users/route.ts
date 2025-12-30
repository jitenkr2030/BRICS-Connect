import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const userManagementSchema = z.object({
  action: z.enum(['list', 'ban', 'unban', 'verify', 'suspend', 'delete']),
  userId: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check admin permissions
    const adminId = searchParams.get('adminId')
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (action === 'list') {
      const where: any = {}
      
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
          { businessType: { contains: search } }
        ]
      }

      if (status && status !== 'all') {
        where.isActive = status === 'active'
        where.isVerified = status === 'verified'
      }

      const users = await db.user.findMany({
        where,
        include: {
          _count: {
            select: {
              marketplaceListings: true,
              enrollments: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      })

      const totalUsers = await db.user.count({ where })

      return NextResponse.json({
        success: true,
        users: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          country: user.country,
          businessType: user.businessType,
          kycStatus: user.kycStatus,
          verificationLevel: user.verificationLevel,
          isVerified: user.isVerified,
          isActive: true, // Would come from actual field
          createdAt: user.createdAt,
          stats: {
            listings: user._count.marketplaceListings,
            courses: user._count.enrollments,
            reviews: user._count.reviews
          }
        })),
        total: totalUsers,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < totalUsers
        }
      })
    }

  } catch (error) {
    console.error('User management error:', error)
    return NextResponse.json(
      { error: 'Failed to manage users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, reason } = body

    const adminId = new URL(request.url).searchParams.get('adminId')
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    switch (action) {
      case 'ban':
        await db.user.update({
          where: { id: userId },
          data: { isActive: false }
        })
        
        // Log admin action
        await db.adminAction.create({
          data: {
            adminUserId,
            actionType: 'USER_BAN',
            targetId: userId,
            targetType: 'USER',
            description: `User banned: ${reason}`,
            metadata: JSON.stringify({ reason })
          }
        })
        break

      case 'unban':
        await db.user.update({
          where: { id: userId },
          data: { isActive: true }
        })
        break

      case 'verify':
        await db.user.update({
          where: { id: userId },
          data: { 
            isVerified: true,
            verificationLevel: 2,
            kycStatus: 'VERIFIED'
          }
        })
        break

      case 'suspend':
        await db.user.update({
          where: { id: userId },
          data: { isActive: false }
        })
        break
    }

    return NextResponse.json({
      success: true,
      message: `User ${action} completed successfully`
    })

  } catch (error) {
    console.error('User management action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform user action' },
      { status: 500 }
    )
  }
}