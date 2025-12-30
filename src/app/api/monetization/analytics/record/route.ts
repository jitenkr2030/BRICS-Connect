import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// POST /api/monetization/analytics/record - Record usage metric
const recordUsageSchema = z.object({
  userId: z.string().optional(),
  enterpriseId: z.string().optional(),
  metricType: z.enum(['API_CALL', 'TRANSACTION', 'LISTING_VIEW', 'COURSE_ACCESS', 'STORAGE_USAGE']),
  metricValue: z.number().min(0, 'Metric value must be positive'),
  metricUnit: z.enum(['COUNT', 'BYTES', 'SECONDS', 'PERCENTAGE']),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('DAILY'),
  metadata: z.string().optional()
});

export async function POST(request: NextRequest) {
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