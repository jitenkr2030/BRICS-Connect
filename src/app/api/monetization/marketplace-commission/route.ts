import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// GET /api/monetization/marketplace-commission - Get commission settings and calculate commission
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get('amount');
    const userType = searchParams.get('userType');
    const category = searchParams.get('category');

    if (amount) {
      // Calculate commission for specific amount
      return await calculateCommission(parseFloat(amount), userType, category);
    }

    // Get commission configuration
    const commissionConfig = await db.feeConfiguration.findFirst({
      where: {
        type: 'MARKETPLACE_COMMISSION',
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: commissionConfig
    });
  } catch (error) {
    console.error('Error fetching marketplace commission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch marketplace commission' },
      { status: 500 }
    );
  }
}

// POST /api/monetization/marketplace-commission - Create commission record
const createCommissionSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  sellerId: z.string().min(1, 'Seller ID is required'),
  buyerId: z.string().min(1, 'Buyer ID is required'),
  orderAmount: z.number().min(0, 'Order amount must be positive'),
  commissionAmount: z.number().min(0, 'Commission amount must be positive'),
  commissionRate: z.number().min(0, 'Commission rate must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  category: z.string().optional(),
  metadata: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCommissionSchema.parse(body);

    // Create transaction fee record for marketplace commission
    const commissionRecord = await db.transactionFee.create({
      data: {
        transactionId: `ORDER_${validatedData.orderId}`,
        userId: validatedData.sellerId,
        feeType: 'MARKETPLACE_COMMISSION',
        baseAmount: validatedData.orderAmount,
        feeAmount: validatedData.commissionAmount,
        feeRate: validatedData.commissionRate,
        currency: validatedData.currency,
        description: `Marketplace commission for order ${validatedData.orderId}`,
        metadata: JSON.stringify({
          orderId: validatedData.orderId,
          sellerId: validatedData.sellerId,
          buyerId: validatedData.buyerId,
          category: validatedData.category
        })
      }
    });

    // Create revenue record
    await db.revenueRecord.create({
      data: {
        source: 'MARKETPLACE_COMMISSION',
        amount: validatedData.commissionAmount,
        currency: validatedData.currency,
        description: `Marketplace commission from order ${validatedData.orderId}`,
        metadata: JSON.stringify({
          orderId: validatedData.orderId,
          sellerId: validatedData.sellerId,
          buyerId: validatedData.buyerId,
          commissionRate: validatedData.commissionRate
        })
      }
    });

    // Update order with commission info
    await db.marketplaceOrder.update({
      where: { id: validatedData.orderId },
      data: {
        metadata: JSON.stringify({
          commission: {
            amount: validatedData.commissionAmount,
            rate: validatedData.commissionRate,
            recordedAt: new Date().toISOString()
          }
        })
      }
    });

    return NextResponse.json({
      success: true,
      data: commissionRecord
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating marketplace commission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create marketplace commission' },
      { status: 500 }
    );
  }
}

async function calculateCommission(amount: number, userType?: string | null, category?: string | null) {
  try {
    // Get commission configuration
    const commissionConfig = await db.feeConfiguration.findFirst({
      where: {
        type: 'MARKETPLACE_COMMISSION',
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!commissionConfig) {
      return NextResponse.json(
        { success: false, error: 'No commission configuration found' },
        { status: 404 }
      );
    }

    let commissionAmount = 0;
    let commissionRate = commissionConfig.feeValue.toNumber();

    // Calculate commission based on fee type
    if (commissionConfig.feeType === 'PERCENTAGE') {
      commissionAmount = amount * (commissionRate / 100);
    } else if (commissionConfig.feeType === 'FIXED') {
      commissionAmount = commissionRate;
    } else if (commissionConfig.feeType === 'TIERED') {
      // Tiered commission based on order value
      if (amount < 100) {
        commissionAmount = amount * 0.05; // 5%
      } else if (amount < 1000) {
        commissionAmount = amount * 0.03; // 3%
      } else if (amount < 10000) {
        commissionAmount = amount * 0.02; // 2%
      } else {
        commissionAmount = amount * 0.01; // 1%
      }
    }

    // Apply min/max commission constraints
    if (commissionConfig.minFee && commissionAmount < commissionConfig.minFee.toNumber()) {
      commissionAmount = commissionConfig.minFee.toNumber();
    }
    if (commissionConfig.maxFee && commissionAmount > commissionConfig.maxFee.toNumber()) {
      commissionAmount = commissionConfig.maxFee.toNumber();
    }

    // Category-based adjustments
    if (category) {
      const categoryAdjustments: { [key: string]: number } = {
        'ELECTRONICS': 1.2, // 20% higher commission
        'FASHION': 1.0,
        'FOOD': 0.8, // 20% lower commission
        'BOOKS': 0.7, // 30% lower commission
        'SERVICES': 0.9
      };

      const adjustment = categoryAdjustments[category.toUpperCase()];
      if (adjustment) {
        commissionAmount *= adjustment;
      }
    }

    // User type adjustments
    if (userType) {
      const userTypeAdjustments: { [key: string]: number } = {
        'PREMIUM': 0.8, // 20% discount for premium users
        'ENTERPRISE': 0.7, // 30% discount for enterprise users
        'STANDARD': 1.0,
        'BASIC': 1.1 // 10% higher for basic users
      };

      const adjustment = userTypeAdjustments[userType.toUpperCase()];
      if (adjustment) {
        commissionAmount *= adjustment;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        orderAmount: amount,
        commissionAmount: Math.round(commissionAmount * 100) / 100, // Round to 2 decimal places
        commissionRate: commissionRate,
        netAmount: amount - commissionAmount,
        currency: 'USD',
        breakdown: {
          baseCommission: commissionAmount,
          categoryAdjustment: category ? category.toUpperCase() : null,
          userTypeAdjustment: userType ? userType.toUpperCase() : null
        }
      }
    });
  } catch (error) {
    console.error('Error calculating marketplace commission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate marketplace commission' },
      { status: 500 }
    );
  }
}