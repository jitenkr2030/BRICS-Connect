import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const adminStatsSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today'

    // Check if user is admin (in production, this would use proper auth)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get admin stats
    const [
      totalUsers,
      activeUsers,
      totalListings,
      activeListings,
      totalCourses,
      activeCourses,
      pendingReports
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.marketplaceListing.count(),
      db.marketplaceListing.count({ where: { status: 'ACTIVE' } }),
      db.course.count(),
      db.course.count({ where: { status: 'ACTIVE' } }),
      db.contentReport.count({ where: { status: 'PENDING' } }),
    ])

    // Get revenue data
    const revenueRecords = await db.revenueRecord.findMany({
      where: {
        date: {
          gte: period === 'today' ? new Date(new Date().setHours(0,0,0,0)) :
                 period === 'week' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) :
                 period === 'month' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) :
                 new Date(new Date().getFullYear(), 0, 1)
        }
      }
    })

    const totalRevenue = revenueRecords.reduce((sum, record) => sum + Number(record.amount), 0)
    const monthlyRevenue = revenueRecords
      .filter(record => record.date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, record) => sum + Number(record.amount), 0)

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalListings,
        activeListings,
        totalCourses,
        activeCourses,
        totalRevenue,
        monthlyRevenue,
        pendingReports,
        systemHealth: 'healthy'
      }
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}