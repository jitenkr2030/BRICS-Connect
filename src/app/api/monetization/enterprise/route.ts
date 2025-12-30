import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// GET /api/monetization/enterprise - Get enterprise subscriptions and plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');

    if (companyId) {
      // Get enterprise subscriptions for a company
      const enterpriseSubscriptions = await db.enterpriseSubscription.findMany({
        where: { companyId },
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
        data: enterpriseSubscriptions
      });
    }

    // Get all enterprise subscriptions
    const where: any = {};
    if (status) where.status = status;

    const enterpriseSubscriptions = await db.enterpriseSubscription.findMany({
      where,
      include: {
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: enterpriseSubscriptions
    });
  } catch (error) {
    console.error('Error fetching enterprise subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enterprise subscriptions' },
      { status: 500 }
    );
  }
}

// POST /api/monetization/enterprise - Create enterprise subscription
const createEnterpriseSubscriptionSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  companyName: z.string().min(1, 'Company name is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().optional(),
  contractTerms: z.string().optional(),
  customFeatures: z.string().optional(),
  userLimit: z.number().min(1, 'User limit must be at least 1').optional(),
  paymentMethod: z.enum(['CARD', 'BANK_TRANSFER', 'CRYPTO', 'INVOICE']).optional(),
  autoRenew: z.boolean().default(true)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createEnterpriseSubscriptionSchema.parse(body);

    // Check if company already has this subscription
    const existingSubscription = await db.enterpriseSubscription.findFirst({
      where: {
        companyId: validatedData.companyId,
        planId: validatedData.planId,
        status: 'ACTIVE'
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { success: false, error: 'Company already has an active subscription to this plan' },
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

    // Create enterprise subscription
    const enterpriseSubscription = await db.enterpriseSubscription.create({
      data: {
        companyId: validatedData.companyId,
        planId: validatedData.planId,
        companyName: validatedData.companyName,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,
        status: 'ACTIVE',
        startDate,
        endDate,
        nextBillingDate,
        autoRenew: validatedData.autoRenew,
        contractTerms: validatedData.contractTerms,
        customFeatures: validatedData.customFeatures,
        userLimit: validatedData.userLimit,
        currentUsers: 0
      },
      include: {
        plan: true
      }
    });

    // Create invoice
    const invoiceNumber = `ENT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days for enterprise

    await db.invoice.create({
      data: {
        invoiceNumber,
        enterpriseId: enterpriseSubscription.id,
        type: 'ENTERPRISE',
        amount: plan.price,
        currency: plan.currency,
        totalAmount: plan.price,
        status: 'PENDING',
        dueDate,
        description: `${plan.name} - Enterprise Plan`,
        lineItems: JSON.stringify([
          {
            description: `${plan.name} - ${validatedData.companyName}`,
            quantity: 1,
            unitPrice: plan.price.toNumber(),
            total: plan.price.toNumber()
          }
        ])
      }
    });

    // Create revenue record
    await db.revenueRecord.create({
      data: {
        source: 'SUBSCRIPTION',
        amount: plan.price,
        currency: plan.currency,
        description: `Enterprise subscription: ${plan.name} - ${validatedData.companyName}`,
        metadata: JSON.stringify({
          companyId: validatedData.companyId,
          companyName: validatedData.companyName,
          planId: validatedData.planId,
          subscriptionId: enterpriseSubscription.id
        })
      }
    });

    return NextResponse.json({
      success: true,
      data: enterpriseSubscription
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating enterprise subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create enterprise subscription' },
      { status: 500 }
    );
  }
}

// PUT /api/monetization/enterprise - Update enterprise subscription
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { currentUsers, status, customFeatures } = body;

    const updatedSubscription = await db.enterpriseSubscription.update({
      where: { id: subscriptionId },
      data: {
        ...(currentUsers !== undefined && { currentUsers }),
        ...(status && { status }),
        ...(customFeatures && { customFeatures }),
        updatedAt: new Date()
      },
      include: {
        plan: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSubscription
    });
  } catch (error) {
    console.error('Error updating enterprise subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update enterprise subscription' },
      { status: 500 }
    );
  }
}