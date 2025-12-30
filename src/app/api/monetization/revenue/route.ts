import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// GET /api/monetization/revenue - Get revenue analytics and reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'MONTHLY';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const source = searchParams.get('source');

    // Build date filter
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = {
        gte: thirtyDaysAgo
      };
    }

    // Build where clause
    const where: any = {
      date: dateFilter
    };
    if (source) where.source = source;

    // Get revenue records
    const revenueRecords = await db.revenueRecord.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    // Get transaction fees
    const transactionFees = await db.transactionFee.findMany({
      where: {
        createdAt: dateFilter
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate totals by source
    const revenueBySource = revenueRecords.reduce((acc: any, record) => {
      const source = record.source;
      if (!acc[source]) {
        acc[source] = {
          count: 0,
          totalAmount: 0,
          currency: record.currency
        };
      }
      acc[source].count++;
      acc[source].totalAmount += record.amount.toNumber();
      return acc;
    }, {});

    // Calculate totals by fee type
    const feesByType = transactionFees.reduce((acc: any, fee) => {
      const type = fee.feeType;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          totalFees: 0,
          totalBaseAmount: 0,
          currency: fee.currency
        };
      }
      acc[type].count++;
      acc[type].totalFees += fee.feeAmount.toNumber();
      acc[type].totalBaseAmount += fee.baseAmount.toNumber();
      return acc;
    }, {});

    // Calculate daily revenue trend
    const dailyRevenue = revenueRecords.reduce((acc: any, record) => {
      const date = record.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += record.amount.toNumber();
      return acc;
    }, {});

    // Calculate overall metrics
    const totalRevenue = revenueRecords.reduce((sum, record) => sum + record.amount.toNumber(), 0);
    const totalFees = transactionFees.reduce((sum, fee) => sum + fee.feeAmount.toNumber(), 0);
    const totalTransactions = transactionFees.length;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalFees,
          totalTransactions,
          averageFeePerTransaction: totalTransactions > 0 ? totalFees / totalTransactions : 0,
          period: period,
          dateRange: {
            start: dateFilter.gte,
            end: dateFilter.lte || new Date()
          }
        },
        revenueBySource,
        feesByType,
        dailyRevenue: Object.entries(dailyRevenue).map(([date, amount]) => ({
          date,
          amount
        })).sort((a, b) => a.date.localeCompare(b.date)),
        recentTransactions: transactionFees.slice(0, 10).map(fee => ({
          id: fee.id,
          transactionId: fee.transactionId,
          feeType: fee.feeType,
          feeAmount: fee.feeAmount.toNumber(),
          currency: fee.currency,
          createdAt: fee.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}

// POST /api/monetization/revenue - Create revenue record
const createRevenueSchema = z.object({
  source: z.enum(['TRANSACTION_FEE', 'MARKETPLACE_COMMISSION', 'COURSE_SALE', 'SUBSCRIPTION', 'ADVERTISEMENT', 'PARTNERSHIP']),
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  description: z.string().optional(),
  metadata: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createRevenueSchema.parse(body);

    const revenueRecord = await db.revenueRecord.create({
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      data: revenueRecord
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating revenue record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create revenue record' },
      { status: 500 }
    );
  }
}