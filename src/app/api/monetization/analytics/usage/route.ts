import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/monetization/analytics/usage - Get analytics usage metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const enterpriseId = searchParams.get('enterpriseId');
    const metricType = searchParams.get('metricType');
    const period = searchParams.get('period') || 'MONTHLY';

    const where: any = {};
    if (userId) where.userId = userId;
    if (enterpriseId) where.enterpriseId = enterpriseId;
    if (metricType) where.metricType = metricType;
    where.period = period;

    // Get usage metrics for the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    where.date = {
      gte: ninetyDaysAgo
    };

    const usageMetrics = await db.usageMetric.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    // Aggregate metrics by type
    const aggregatedMetrics = usageMetrics.reduce((acc: any, metric) => {
      const type = metric.metricType;
      if (!acc[type]) {
        acc[type] = {
          totalValue: 0,
          count: 0,
          unit: metric.metricUnit,
          recentData: []
        };
      }
      acc[type].totalValue += metric.metricValue;
      acc[type].count++;
      acc[type].recentData.push({
        date: metric.date.toISOString().split('T')[0],
        value: metric.metricValue
      });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        aggregatedMetrics,
        totalMetrics: usageMetrics.length,
        period,
        dateRange: {
          start: ninetyDaysAgo.toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics usage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics usage' },
      { status: 500 }
    );
  }
}