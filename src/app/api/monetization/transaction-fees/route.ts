import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// GET /api/monetization/transaction-fees - Get transaction fees
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const feeType = searchParams.get('feeType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    if (userId) where.userId = userId;
    if (feeType) where.feeType = feeType;

    const [fees, total] = await Promise.all([
      db.transactionFee.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      db.transactionFee.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: fees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transaction fees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction fees' },
      { status: 500 }
    );
  }
}

// POST /api/monetization/transaction-fees - Create transaction fee record
const createTransactionFeeSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  feeType: z.enum(['TRANSACTION_FEE', 'CURRENCY_CONVERSION', 'MARKETPLACE_COMMISSION', 'COURSE_FEE']),
  baseAmount: z.number().min(0, 'Base amount must be positive'),
  feeAmount: z.number().min(0, 'Fee amount must be positive'),
  feeRate: z.number().min(0, 'Fee rate must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  description: z.string().optional(),
  metadata: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTransactionFeeSchema.parse(body);

    // Check if transaction fee already exists
    const existingFee = await db.transactionFee.findUnique({
      where: { transactionId: validatedData.transactionId }
    });

    if (existingFee) {
      return NextResponse.json(
        { success: false, error: 'Transaction fee already exists for this transaction' },
        { status: 400 }
      );
    }

    const transactionFee = await db.transactionFee.create({
      data: validatedData
    });

    // Create revenue record
    await db.revenueRecord.create({
      data: {
        source: 'TRANSACTION_FEE',
        amount: validatedData.feeAmount,
        currency: validatedData.currency,
        description: `${validatedData.feeType} - ${validatedData.description || 'Transaction fee'}`,
        metadata: JSON.stringify({
          transactionId: validatedData.transactionId,
          userId: validatedData.userId,
          feeType: validatedData.feeType
        })
      }
    });

    return NextResponse.json({
      success: true,
      data: transactionFee
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating transaction fee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction fee' },
      { status: 500 }
    );
  }
}

// POST /api/monetization/transaction-fees/calculate - Calculate transaction fee
const calculateFeeSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  transactionType: z.string().min(1, 'Transaction type is required'),
  userType: z.string().optional(),
  userId: z.string().optional()
});

export async function CALCULATE(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = calculateFeeSchema.parse(body);

    // Get applicable fee configuration
    const feeConfig = await db.feeConfiguration.findFirst({
      where: {
        type: 'TRANSACTION_FEE',
        isActive: true,
        OR: [
          { appliesTo: null },
          { appliesTo: 'ALL' },
          { appliesTo: validatedData.userType?.toUpperCase() }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!feeConfig) {
      return NextResponse.json(
        { success: false, error: 'No fee configuration found' },
        { status: 404 }
      );
    }

    let feeAmount = 0;
    let effectiveRate = feeConfig.feeValue.toNumber();

    // Calculate fee based on fee type
    if (feeConfig.feeType === 'PERCENTAGE') {
      feeAmount = validatedData.amount * (effectiveRate / 100);
    } else if (feeConfig.feeType === 'FIXED') {
      feeAmount = effectiveRate;
    } else if (feeConfig.feeType === 'TIERED') {
      // Simple tiered calculation - can be enhanced
      if (validatedData.amount < 1000) {
        feeAmount = validatedData.amount * 0.01; // 1%
      } else if (validatedData.amount < 10000) {
        feeAmount = validatedData.amount * 0.005; // 0.5%
      } else {
        feeAmount = validatedData.amount * 0.002; // 0.2%
      }
    }

    // Apply min/max fee constraints
    if (feeConfig.minFee && feeAmount < feeConfig.minFee.toNumber()) {
      feeAmount = feeConfig.minFee.toNumber();
    }
    if (feeConfig.maxFee && feeAmount > feeConfig.maxFee.toNumber()) {
      feeAmount = feeConfig.maxFee.toNumber();
    }

    return NextResponse.json({
      success: true,
      data: {
        baseAmount: validatedData.amount,
        feeAmount,
        feeRate: effectiveRate,
        currency: validatedData.currency,
        totalAmount: validatedData.amount + feeAmount,
        feeConfig: {
          name: feeConfig.name,
          type: feeConfig.feeType,
          minFee: feeConfig.minFee?.toNumber(),
          maxFee: feeConfig.maxFee?.toNumber()
        }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    console.error('Error calculating transaction fee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate transaction fee' },
      { status: 500 }
    );
  }
}