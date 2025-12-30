import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// GET /api/monetization/analytics - Get analytics products and purchases
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const enterpriseId = searchParams.get('enterpriseId');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    if (userId || enterpriseId) {
      // Get analytics purchases for user or enterprise
      const where: any = {};
      if (userId) where.userId = userId;
      if (enterpriseId) where.enterpriseId = enterpriseId;

      const purchases = await db.analyticsPurchase.findMany({
        where,
        include: {
          product: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        data: purchases
      });
    }

    // Get analytics products
    const where: any = {};
    if (type) where.type = type;
    if (isActive !== null) where.isActive = isActive === 'true';

    const products = await db.analyticsProduct.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching analytics products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics products' },
      { status: 500 }
    );
  }
}

// POST /api/monetization/analytics - Purchase analytics product
const purchaseAnalyticsSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  userId: z.string().optional(),
  enterpriseId: z.string().optional(),
  purchaseType: z.enum(['INDIVIDUAL', 'ENTERPRISE']),
  accessLevel: z.enum(['BASIC', 'STANDARD', 'PREMIUM']).default('STANDARD')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = purchaseAnalyticsSchema.parse(body);

    // Get product details
    const product = await db.analyticsProduct.findUnique({
      where: { id: validatedData.productId }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Analytics product not found' },
        { status: 404 }
      );
    }

    // Calculate end date based on billing cycle
    const startDate = new Date();
    const endDate = new Date();

    if (product.billingCycle === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (product.billingCycle === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    // ONE_TIME purchases don't expire

    // Create analytics purchase
    const purchase = await db.analyticsPurchase.create({
      data: {
        productId: validatedData.productId,
        userId: validatedData.userId,
        enterpriseId: validatedData.enterpriseId,
        purchaseType: validatedData.purchaseType,
        amount: product.price,
        currency: product.currency,
        status: 'ACTIVE',
        startDate,
        endDate: product.billingCycle === 'ONE_TIME' ? null : endDate,
        accessLevel: validatedData.accessLevel,
        metadata: JSON.stringify({
          purchaseSource: 'WEB',
          features: JSON.parse(product.features),
          dataSources: JSON.parse(product.dataSources),
          updateFrequency: product.updateFrequency
        })
      },
      include: {
        product: true
      }
    });

    // Create revenue record
    await db.revenueRecord.create({
      data: {
        source: 'ANALYTICS_SALE',
        amount: product.price,
        currency: product.currency,
        description: `Analytics product purchase: ${product.name}`,
        metadata: JSON.stringify({
          productId: validatedData.productId,
          productName: product.name,
          purchaseType: validatedData.purchaseType,
          accessLevel: validatedData.accessLevel
        })
      }
    });

    return NextResponse.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    console.error('Error purchasing analytics product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to purchase analytics product' },
      { status: 500 }
    );
  }
}

// GET /api/monetization/analytics/usage - Get analytics usage metrics
export async function USAGE(request: NextRequest) {
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

// POST /api/monetization/analytics/usage - Record usage metric
const recordUsageSchema = z.object({
  userId: z.string().optional(),
  enterpriseId: z.string().optional(),
  metricType: z.enum(['API_CALL', 'TRANSACTION', 'LISTING_VIEW', 'COURSE_ACCESS', 'STORAGE_USAGE']),
  metricValue: z.number().min(0, 'Metric value must be positive'),
  metricUnit: z.enum(['COUNT', 'BYTES', 'SECONDS', 'PERCENTAGE']),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('DAILY'),
  metadata: z.string().optional()
});

export async function RECORD_USAGE(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = recordUsageSchema.parse(body);

    // Create usage metric
    const usageMetric = await db.usageMetric.create({
      data: {
        userId: validatedData.userId,
        enterpriseId: validatedData.enterpriseId,
        metricType: validatedData.metricType,
        metricValue: validatedData.metricValue,
        metricUnit: validatedData.metricUnit,
        period: validatedData.period,
        metadata: validatedData.metadata
      }
    });

    return NextResponse.json({
      success: true,
      data: usageMetric
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    console.error('Error recording usage metric:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record usage metric' },
      { status: 500 }
    );
  }
}