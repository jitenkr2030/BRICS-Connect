import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding monetization data...');

  // Create fee configurations
  const feeConfigs = [
    {
      name: 'Standard Transaction Fee',
      type: 'TRANSACTION_FEE',
      feeType: 'PERCENTAGE',
      feeValue: 1.5, // 1.5%
      minFee: 0.50,
      maxFee: 25.00,
      currency: 'USD',
      conditions: JSON.stringify({
        minAmount: 0,
        maxAmount: 10000,
        userTypes: ['STANDARD', 'PREMIUM']
      }),
      isActive: true,
      appliesTo: 'STANDARD'
    },
    {
      name: 'Premium Transaction Fee',
      type: 'TRANSACTION_FEE',
      feeType: 'PERCENTAGE',
      feeValue: 0.8, // 0.8%
      minFee: 0.25,
      maxFee: 15.00,
      currency: 'USD',
      conditions: JSON.stringify({
        minAmount: 0,
        maxAmount: 50000,
        userTypes: ['PREMIUM', 'ENTERPRISE']
      }),
      isActive: true,
      appliesTo: 'PREMIUM'
    },
    {
      name: 'Enterprise Transaction Fee',
      type: 'TRANSACTION_FEE',
      feeType: 'TIERED',
      feeValue: 0.5, // Base 0.5%
      minFee: 0.10,
      maxFee: 50.00,
      currency: 'USD',
      conditions: JSON.stringify({
        tiers: [
          { min: 0, max: 1000, rate: 0.8 },
          { min: 1000, max: 10000, rate: 0.5 },
          { min: 10000, max: 100000, rate: 0.3 },
          { min: 100000, max: Infinity, rate: 0.2 }
        ]
      }),
      isActive: true,
      appliesTo: 'ENTERPRISE'
    },
    {
      name: 'Marketplace Commission',
      type: 'MARKETPLACE_COMMISSION',
      feeType: 'PERCENTAGE',
      feeValue: 3.0, // 3%
      minFee: 1.00,
      maxFee: 100.00,
      currency: 'USD',
      conditions: JSON.stringify({
        categoryAdjustments: {
          'ELECTRONICS': 1.2,
          'FASHION': 1.0,
          'FOOD': 0.8,
          'BOOKS': 0.7,
          'SERVICES': 0.9
        }
      }),
      isActive: true,
      appliesTo: null
    },
    {
      name: 'Course Platform Fee',
      type: 'COURSE_PLATFORM_FEE',
      feeType: 'TIERED',
      feeValue: 25.0, // Base 25%
      minFee: 2.99,
      maxFee: 199.99,
      currency: 'USD',
      conditions: JSON.stringify({
        tiers: [
          { min: 0, max: 50, rate: 30 },
          { min: 50, max: 200, rate: 25 },
          { min: 200, max: 500, rate: 20 },
          { min: 500, max: Infinity, rate: 15 }
        ],
        categoryAdjustments: {
          'TECHNOLOGY': 0.9,
          'BUSINESS': 1.0,
          'ARTS': 1.1,
          'LANGUAGE': 0.8,
          'SCIENCE': 0.95
        },
        levelAdjustments: {
          'BEGINNER': 1.0,
          'INTERMEDIATE': 0.95,
          'ADVANCED': 0.9
        }
      }),
      isActive: true,
      appliesTo: null
    },
    {
      name: 'Currency Conversion Fee',
      type: 'CURRENCY_CONVERSION',
      feeType: 'PERCENTAGE',
      feeValue: 0.5, // 0.5%
      minFee: 0.25,
      maxFee: 10.00,
      currency: 'USD',
      conditions: JSON.stringify({
        supportedCurrencies: ['USD', 'CNY', 'INR', 'BRL', 'RUB', 'ZAR'],
        vipDiscount: 0.2 // 20% discount for VIP users
      }),
      isActive: true,
      appliesTo: null
    }
  ];

  for (const config of feeConfigs) {
    await prisma.feeConfiguration.upsert({
      where: { name: config.name },
      update: config,
      create: config
    });
  }

  // Create subscription plans
  const subscriptionPlans = [
    {
      name: 'Wallet Premium',
      description: 'Advanced wallet features with reduced fees and higher limits',
      type: 'WALLET_PREMIUM',
      price: 9.99,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      features: JSON.stringify([
        'Reduced transaction fees (0.8% vs 1.5%)',
        'Higher daily limits ($10,000 vs $1,000)',
        'Priority customer support',
        'Advanced analytics dashboard',
        'Multi-device synchronization',
        'Export transaction history'
      ]),
      limits: JSON.stringify({
        dailyTransactionLimit: 10000,
        monthlyTransactionLimit: 100000,
        maxWallets: 10,
        apiCallsPerDay: 1000
      }),
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Marketplace Pro',
      description: 'Professional selling tools and analytics for marketplace sellers',
      type: 'MARKETPLACE_PRO',
      price: 29.99,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      features: JSON.stringify([
        'Reduced commission rates (2.5% vs 3%)',
        'Advanced seller analytics',
        'Bulk listing management',
        'Promoted listings',
        'Customer relationship tools',
        'Inventory management',
        'Sales tax calculation'
      ]),
      limits: JSON.stringify({
        maxListings: 1000,
        monthlySalesLimit: 50000,
        imageUploadLimit: 100,
        customStorefront: true
      }),
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Education Plus',
      description: 'Premium learning features and certification programs',
      type: 'EDUCATION_PLUS',
      price: 19.99,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      features: JSON.stringify([
        'Unlimited course access',
        'Premium certificates',
        '1-on-1 mentorship sessions',
        'Course completion tracking',
        'Offline downloads',
        'Priority instructor support',
        'Career services'
      ]),
      limits: JSON.stringify({
        maxActiveCourses: 10,
        mentorshipHoursPerMonth: 2,
        certificateLimit: 5,
        downloadLimit: 50
      }),
      isActive: true,
      sortOrder: 3
    },
    {
      name: 'Enterprise Suite',
      description: 'Complete platform solution for large organizations',
      type: 'ENTERPRISE',
      price: 299.99,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      features: JSON.stringify([
        'All premium features included',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantees',
        'Advanced security features',
        'Custom branding',
        'API access',
        'Training and onboarding'
      ]),
      limits: JSON.stringify({
        maxUsers: 100,
        customIntegrations: true,
        dedicatedSupport: true,
        slaGuarantee: 99.9,
        customBranding: true
      }),
      isActive: true,
      sortOrder: 4
    }
  ];

  for (const plan of subscriptionPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan
    });
  }

  // Create analytics products
  const analyticsProducts = [
    {
      name: 'Market Insights Basic',
      description: 'Essential market data and trends for BRICS markets',
      type: 'MARKET_INSIGHTS',
      price: 99.99,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      features: JSON.stringify([
        'Daily market updates',
        'Price trends analysis',
        'Basic competitor analysis',
        'Market size reports',
        'Email notifications'
      ]),
      dataSources: JSON.stringify([
        'Public market data',
        'Platform transactions',
        'User behavior analytics',
        'Economic indicators'
      ]),
      updateFrequency: 'DAILY',
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Trade Analytics Pro',
      description: 'Advanced trade analytics and predictive insights',
      type: 'TRADE_ANALYTICS',
      price: 299.99,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      features: JSON.stringify([
        'Real-time trade monitoring',
        'Predictive analytics',
        'Supply chain insights',
        'Risk assessment tools',
        'Custom reports',
        'API access',
        'Expert consultations'
      ]),
      dataSources: JSON.stringify([
        'Real-time transaction data',
        'Supply chain databases',
        'Custom feeds',
        'Partner data sources',
        'Economic forecasts'
      ]),
      updateFrequency: 'REAL_TIME',
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'User Behavior Intelligence',
      description: 'Deep insights into user behavior and platform usage patterns',
      type: 'USER_BEHAVIOR',
      price: 199.99,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      features: JSON.stringify([
        'User journey mapping',
        'Conversion optimization',
        'Retention analysis',
        'Segmentation tools',
        'A/B testing insights',
        'Behavioral predictions'
      ]),
      dataSources: JSON.stringify([
        'User interaction data',
        'Platform analytics',
        'Survey data',
        'Third-party integrations'
      ]),
      updateFrequency: 'WEEKLY',
      isActive: true,
      sortOrder: 3
    }
  ];

  for (const product of analyticsProducts) {
    await prisma.analyticsProduct.upsert({
      where: { name: product.name },
      update: product,
      create: product
    });
  }

  // Create partnership programs
  const partnershipPrograms = [
    {
      name: 'Bank Partnership Program',
      description: 'Partner with banks to provide integrated financial services',
      type: 'REVENUE_SHARING',
      commissionRate: 15.0,
      requirements: JSON.stringify({
        minAssets: 1000000000,
        licenseRequired: true,
        complianceLevel: 'HIGH',
        territory: 'BRICS countries'
      }),
      benefits: JSON.stringify([
        'Revenue sharing on transactions',
        'Co-branded services',
        'Access to user base',
        'Marketing support',
        'Technical integration support'
      ]),
      isActive: true,
      contactEmail: 'partnerships@bricsconnect.net'
    },
    {
      name: 'Fintech Integration Program',
      description: 'Integrate fintech solutions with our platform',
      type: 'API_PARTNER',
      commissionRate: 10.0,
      requirements: JSON.stringify({
        apiCompliance: true,
        securityCertification: true,
        scalability: 'HIGH',
        support247: true
      }),
      benefits: JSON.stringify([
        'API access to platform',
        'Developer support',
        'Co-marketing opportunities',
        'Revenue sharing',
        'Technical documentation'
      ]),
      isActive: true,
      contactEmail: 'fintech@bricsconnect.net'
    },
    {
      name: 'Educational Institution Partnership',
      description: 'Partner with educational institutions for content and certification',
      type: 'REVENUE_SHARING',
      commissionRate: 20.0,
      requirements: JSON.stringify({
        accreditation: true,
        qualityStandards: 'HIGH',
        contentVolume: 'minimum 50 courses',
        instructorVerification: true
      }),
      benefits: JSON.stringify([
        'Revenue sharing on course sales',
        'Platform promotion',
        'Certification authority',
        'Student access programs',
        'Analytics dashboard'
      ]),
      isActive: true,
      contactEmail: 'education@bricsconnect.net'
    }
  ];

  for (const program of partnershipPrograms) {
    await prisma.partnershipProgram.upsert({
      where: { name: program.name },
      update: program,
      create: program
    });
  }

  console.log('✅ Monetization data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding monetization data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });