import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// POST /api/monetization/transaction-fees/calculate - Calculate transaction fee
const calculateFeeSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  transactionType: z.string().min(1, 'Transaction type is required'),
  userType: z.string().optional(),
  userId: z.string().optional()
});

export async function POST(request: NextRequest) {
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