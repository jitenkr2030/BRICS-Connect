import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// GET /api/monetization/subscriptions - Get subscription plans and user subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    if (userId) {
      // Get user subscriptions
      const userSubscriptions = await db.userSubscription.findMany({
        where: { userId },
        include: {
          plan: true,
          invoices: {
            where: { status: 'PAID' },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        data: userSubscriptions
      });
    }

    // Get subscription plans
    const where: any = {};
    if (type) where.type = type;
    if (isActive !== null) where.isActive = isActive === 'true';

    const plans = await db.subscriptionPlan.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST /api/monetization/subscriptions - Create new subscription
const createSubscriptionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  paymentMethod: z.enum(['CARD', 'BANK_TRANSFER', 'CRYPTO', 'WALLET']).optional(),
  autoRenew: z.boolean().default(true)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSubscriptionSchema.parse(body);

    // Check if user already has this subscription
    const existingSubscription = await db.userSubscription.findFirst({
      where: {
        userId: validatedData.userId,
        planId: validatedData.planId,
        status: 'ACTIVE'
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { success: false, error: 'User already has an active subscription to this plan' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = await db.subscriptionPlan.findUnique({
      where: { id: validatedData.planId }
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    const nextBillingDate = new Date();

    if (plan.billingCycle === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (plan.billingCycle === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1);
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    // Create subscription
    const subscription = await db.userSubscription.create({
      data: {
        userId: validatedData.userId,
        planId: validatedData.planId,
        status: 'ACTIVE',
        startDate,
        endDate,
        nextBillingDate,
        autoRenew: validatedData.autoRenew,
        paymentMethod: validatedData.paymentMethod,
        lastPaymentAt: new Date()
      },
      include: {
        plan: true
      }
    });

    // Create invoice
    const invoiceNumber = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

    await db.invoice.create({
      data: {
        invoiceNumber,
        userId: validatedData.userId,
        subscriptionId: subscription.id,
        type: 'SUBSCRIPTION',
        amount: plan.price,
        currency: plan.currency,
        totalAmount: plan.price,
        status: 'PENDING',
        dueDate,
        description: `${plan.name} - ${plan.billingCycle}`,
        lineItems: JSON.stringify([
          {
            description: plan.name,
            quantity: 1,
            unitPrice: plan.price.toNumber(),
            total: plan.price.toNumber()
          }
        ])
      }
    });

    // Create revenue record (assuming payment is processed)
    await db.revenueRecord.create({
      data: {
        source: 'SUBSCRIPTION',
        amount: plan.price,
        currency: plan.currency,
        description: `New subscription: ${plan.name}`,
        metadata: JSON.stringify({
          userId: validatedData.userId,
          planId: validatedData.planId,
          subscriptionId: subscription.id
        })
      }
    });

    return NextResponse.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}