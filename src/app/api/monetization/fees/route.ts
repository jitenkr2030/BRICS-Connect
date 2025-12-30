import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// GET /api/monetization/fees - Get all fee configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (type) where.type = type;
    if (isActive !== null) where.isActive = isActive === 'true';

    const fees = await db.feeConfiguration.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: fees
    });
  } catch (error) {
    console.error('Error fetching fee configurations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fee configurations' },
      { status: 500 }
    );
  }
}

// POST /api/monetization/fees - Create new fee configuration
const createFeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['TRANSACTION_FEE', 'MARKETPLACE_COMMISSION', 'CURRENCY_CONVERSION', 'COURSE_PLATFORM_FEE']),
  feeType: z.enum(['PERCENTAGE', 'FIXED', 'TIERED']),
  feeValue: z.number().min(0, 'Fee value must be positive'),
  minFee: z.number().min(0).optional(),
  maxFee: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  conditions: z.string().optional(),
  isActive: z.boolean().default(true),
  appliesTo: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createFeeSchema.parse(body);

    const fee = await db.feeConfiguration.create({
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      data: fee
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating fee configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create fee configuration' },
      { status: 500 }
    );
  }
}