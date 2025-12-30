import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBRICSCourses() {
  console.log('🎓 Seeding BRICS Business & Knowledge Platform Courses...');

  try {
    // Level 1: FREE Courses
    const level1Courses = [
      {
        title: "BRICS for Normal People",
        description: "What BRICS really means for your job, business, or future - explained in simple, non-political terms.",
        instructor: "BRICS Academy Team",
        category: "BRICS Fundamentals",
        subcategory: "Introduction",
        level: "BEGINNER",
        courseLevel: "LEVEL_1_FREE",
        language: "en",
        languages: JSON.stringify(["en", "hi"]),
        duration: 120,
        price: 0,
        currency: "INR",
        priceTier: "FREE",
        estimatedHours: 2,
        difficulty: "BEGINNER",
        accessType: "LIFETIME",
        targetAudience: JSON.stringify(["Students", "Workers", "Shop Owners", "General Public"]),
        keyTopics: JSON.stringify([
          "What is BRICS (simple explanation)",
          "Why BRICS exists (problems it solves)",
          "How BRICS affects prices",
          "How BRICS affects jobs",
          "Business opportunities in BRICS",
          "Myths vs reality about BRICS"
        ]),
        modules: JSON.stringify([
          {
            title: "Introduction to BRICS",
            description: "Understanding the basics in simple terms",
            duration: 20,
            order: 1
          },
          {
            title: "Why BRICS Matters to You",
            description: "Personal impact on jobs and business",
            duration: 25,
            order: 2
          },
          {
            title: "BRICS and Your Wallet",
            description: "How BRICS affects prices and purchasing power",
            duration: 25,
            order: 3
          },
          {
            title: "Business Opportunities",
            description: "Where the opportunities really are",
            duration: 30,
            order: 4
          },
          {
            title: "Myths vs Reality",
            description: "Separating fact from fiction",
            duration: 20,
            order: 5
          }
        ]),
        outcomes: JSON.stringify([
          "Understand BRICS in simple terms",
          "Identify how BRICS affects your life",
          "Spot business opportunities",
          "Distinguish myths from reality"
        ]),
        isFeatured: true,
        tags: JSON.stringify(["BRICS", "Introduction", "Free", "Beginner"]),
        reviewsEnabled: true,
        discussionsEnabled: true,
        certificateEnabled: false,
        autoApprove: true,
        status: "ACTIVE",
        publishedAt: new Date()
      },
      {
        title: "Understanding BRICS Countries (People & Markets)",
        description: "Deep dive into each BRICS country - what they buy, sell, and need from the world.",
        instructor: "BRICS Academy Team",
        category: "BRICS Fundamentals",
        subcategory: "Country Analysis",
        level: "BEGINNER",
        courseLevel: "LEVEL_1_FREE",
        language: "en",
        languages: JSON.stringify(["en", "hi", "pt", "zh", "ru"]),
        duration: 180,
        price: 99,
        currency: "INR",
        priceTier: "FREE",
        estimatedHours: 3,
        difficulty: "BEGINNER",
        accessType: "LIFETIME",
        targetAudience: JSON.stringify(["Curious Learners", "Students", "Researchers"]),
        keyTopics: JSON.stringify([
          "Brazil: What they buy, sell, and need",
          "Russia: Market reality beyond headlines",
          "India: Strengths & gaps",
          "China: Manufacturing & supply chains",
          "South Africa: Gateway to Africa"
        ]),
        modules: JSON.stringify([
          {
            title: "Brazil: The South American Powerhouse",
            description: "Understanding Brazil's economy and market needs",
            duration: 35,
            order: 1
          },
          {
            title: "Russia: Beyond the Headlines",
            description: "Market reality and opportunities",
            duration: 35,
            order: 2
          },
          {
            title: "India: Strengths and Growth Areas",
            description: "Understanding India's market dynamics",
            duration: 35,
            order: 3
          },
          {
            title: "China: Manufacturing Giant",
            description: "Supply chains and market needs",
            duration: 40,
            order: 4
          },
          {
            title: "South Africa: Gateway to Africa",
            description: "Understanding the African market through SA",
            duration: 35,
            order: 5
          }
        ]),
        outcomes: JSON.stringify([
          "Understand each BRICS country's economy",
          "Identify market opportunities",
          "Know what each country buys and sells",
          "Understand cultural business contexts"
        ]),
        tags: JSON.stringify(["BRICS", "Countries", "Markets", "Free", "Beginner"]),
        reviewsEnabled: true,
        discussionsEnabled: true,
        certificateEnabled: false,
        autoApprove: true,
        status: "ACTIVE",
        publishedAt: new Date()
      }
    ];

    // Level 2: FOUNDATION Courses
    const level2Courses = [
      {
        title: "BRICS Business Basics",
        description: "No jargon. No MBA language. Just practical cross-border business knowledge for SMEs.",
        instructor: "Business Experts Network",
        category: "Business Skills",
        subcategory: "Cross-Border Trade",
        level: "BEGINNER",
        courseLevel: "LEVEL_2_FOUNDATION",
        language: "en",
        languages: JSON.stringify(["en", "hi"]),
        duration: 240,
        price: 499,
        currency: "INR",
        priceTier: "TIER_1",
        estimatedHours: 4,
        difficulty: "BEGINNER",
        accessType: "LIFETIME",
        targetAudience: JSON.stringify(["Small Business Owners", "Entrepreneurs", "SMEs"]),
        keyTopics: JSON.stringify([
          "How cross-border business works (simple flow)",
          "Export vs import basics",
          "B2B vs B2C in BRICS",
          "Risks & mistakes beginners make"
        ]),
        modules: JSON.stringify([
          {
            title: "Cross-Border Business 101",
            description: "Understanding international trade basics",
            duration: 60,
            order: 1
          },
          {
            title: "Export Fundamentals",
            description: "How to export goods successfully",
            duration: 60,
            order: 2
          },
          {
            title: "Import Basics",
            description: "How to import goods effectively",
            duration: 60,
            order: 3
          },
          {
            title: "B2B vs B2C in BRICS",
            description: "Choosing your business model",
            duration: 30,
            order: 4
          },
          {
            title: "Common Mistakes to Avoid",
            description: "Learning from others' failures",
            duration: 30,
            order: 5
          }
        ]),
        outcomes: JSON.stringify([
          "Understand cross-border business basics",
          "Know export/import fundamentals",
          "Choose the right business model",
          "Avoid common beginner mistakes"
        ]),
        tags: JSON.stringify(["Business", "Cross-Border", "SME", "Foundation"]),
        reviewsEnabled: true,
        discussionsEnabled: true,
        certificateEnabled: true,
        certificateType: "COMPLETION",
        autoApprove: true,
        status: "ACTIVE",
        publishedAt: new Date()
      },
      {
        title: "How Money Moves in BRICS (Without Fear)",
        description: "Educational guide to BRICS currencies and payments - not financial advice.",
        instructor: "Financial Education Team",
        category: "Financial Skills",
        subcategory: "Cross-Border Payments",
        level: "BEGINNER",
        courseLevel: "LEVEL_2_FOUNDATION",
        language: "en",
        languages: JSON.stringify(["en", "hi"]),
        duration: 180,
        price: 499,
        currency: "INR",
        priceTier: "TIER_1",
        estimatedHours: 3,
        difficulty: "BEGINNER",
        accessType: "LIFETIME",
        targetAudience: JSON.stringify(["SMEs", "Freelancers", "Service Providers"]),
        keyTopics: JSON.stringify([
          "Currency basics (INR, CNY, BRL, RUB, ZAR)",
          "What CBDC is (in plain language)",
          "How payments actually settle",
          "What you should NOT do (frauds, scams)"
        ]),
        modules: JSON.stringify([
          {
            title: "BRICS Currencies Explained",
            description: "Understanding INR, CNY, BRL, RUB, ZAR",
            duration: 45,
            order: 1
          },
          {
            title: "CBDC in Simple Terms",
            description: "What is Central Bank Digital Currency",
            duration: 45,
            order: 2
          },
          {
            title: "How Payments Work",
            description: "Understanding payment settlement",
            duration: 45,
            order: 3
          },
          {
            title: "Avoiding Frauds and Scams",
            description: "Protecting your money",
            duration: 45,
            order: 4
          }
        ]),
        outcomes: JSON.stringify([
          "Understand BRICS currencies",
          "Know how CBDC works",
          "Understand payment systems",
          "Avoid common financial scams"
        ]),
        tags: JSON.stringify(["Finance", "Payments", "CBDC", "Currency", "Safety"]),
        reviewsEnabled: true,
        discussionsEnabled: true,
        certificateEnabled: true,
        certificateType: "COMPLETION",
        autoApprove: true,
        status: "ACTIVE",
        publishedAt: new Date()
      }
    ];

    // Level 3: PRACTICAL Courses
    const level3Courses = [
      {
        title: "How Indian SMEs Can Sell to BRICS Countries",
        description: "Step-by-step guide for Indian SMEs to successfully sell products across BRICS nations.",
        instructor: "Export Experts Network",
        category: "Practical Skills",
        subcategory: "Export Strategy",
        level: "INTERMEDIATE",
        courseLevel: "LEVEL_3_PRACTICAL",
        language: "en",
        languages: JSON.stringify(["en", "hi"]),
        duration: 300,
        price: 999,
        currency: "INR",
        priceTier: "TIER_2",
        estimatedHours: 5,
        difficulty: "INTERMEDIATE",
        accessType: "LIFETIME",
        targetAudience: JSON.stringify(["MSMEs", "Exporters", "Manufacturers"]),
        keyTopics: JSON.stringify([
          "Finding buyers (without agents)",
          "Product-market fit by country",
          "Pricing basics",
          "Cultural mistakes to avoid",
          "Case studies (small businesses)"
        ]),
        modules: JSON.stringify([
          {
            title: "Finding Buyers Directly",
            description: "How to find customers without middlemen",
            duration: 60,
            order: 1
          },
          {
            title: "Product-Market Fit Analysis",
            description: "Matching products to country needs",
            duration: 60,
            order: 2
          },
          {
            title: "Pricing Strategy for BRICS",
            description: "How to price your products effectively",
            duration: 60,
            order: 3
          },
          {
            title: "Cultural Business Etiquette",
            description: "Avoiding cultural mistakes",
            duration: 60,
            order: 4
          },
          {
            title: "Real Case Studies",
            description: "Learning from successful exporters",
            duration: 60,
            order: 5
          }
        ]),
        outcomes: JSON.stringify([
          "Find buyers directly in BRICS countries",
          "Analyze product-market fit",
          "Set competitive prices",
          "Understand cultural business practices",
          "Learn from real success stories"
        ]),
        tags: JSON.stringify(["Export", "SME", "Practical", "India", "BRICS"]),
        reviewsEnabled: true,
        discussionsEnabled: true,
        certificateEnabled: true,
        certificateType: "ACHIEVEMENT",
        autoApprove: true,
        status: "ACTIVE",
        publishedAt: new Date()
      },
      {
        title: "BRICS Freelance & Services Opportunity",
        description: "How Indian professionals can sell services to BRICS countries - tech, design, accounting, and more.",
        instructor: "Freelance Experts Network",
        category: "Practical Skills",
        subcategory: "Service Export",
        level: "INTERMEDIATE",
        courseLevel: "LEVEL_3_PRACTICAL",
        language: "en",
        languages: JSON.stringify(["en", "hi"]),
        duration: 240,
        price: 799,
        currency: "INR",
        priceTier: "TIER_2",
        estimatedHours: 4,
        difficulty: "INTERMEDIATE",
        accessType: "LIFETIME",
        targetAudience: JSON.stringify(["Freelancers", "Professionals", "Service Providers"]),
        keyTopics: JSON.stringify([
          "Services BRICS countries outsource",
          "How Indians can sell: Tech, Design, Accounting, Compliance",
          "Contract basics",
          "Safe payment methods"
        ]),
        modules: JSON.stringify([
          {
            title: "BRICS Service Market Overview",
            description: "Understanding demand for services",
            duration: 60,
            order: 1
          },
          {
            title: "Tech Services Opportunity",
            description: "Software development, IT support, and more",
            duration: 45,
            order: 2
          },
          {
            title: "Creative and Design Services",
            description: "Design, content, and creative work",
            duration: 45,
            order: 3
          },
          {
            title: "Professional Services",
            description: "Accounting, legal, and compliance",
            duration: 45,
            order: 4
          },
          {
            title: "Contracts and Payments",
            description: "Safe contracting and payment methods",
            duration: 45,
            order: 5
          }
        ]),
        outcomes: JSON.stringify([
          "Identify service opportunities in BRICS",
          "Market tech and creative services",
          "Understand professional service demand",
          "Create safe contracts",
          "Receive payments securely"
        ]),
        tags: JSON.stringify(["Freelance", "Services", "Professional", "Practical"]),
        reviewsEnabled: true,
        discussionsEnabled: true,
        certificateEnabled: true,
        certificateType: "ACHIEVEMENT",
        autoApprove: true,
        status: "ACTIVE",
        publishedAt: new Date()
      }
    ];

    // Level 4: ADVANCED Courses
    const level4Courses = [
      {
        title: "BRICS Trade Compliance (Simplified)",
        description: "Complete guide to legal compliance for BRICS trade - IEC, GST, documentation, and more.",
        instructor: "Legal & Compliance Experts",
        category: "Advanced Skills",
        subcategory: "Trade Compliance",
        level: "ADVANCED",
        courseLevel: "LEVEL_4_ADVANCED",
        language: "en",
        languages: JSON.stringify(["en", "hi"]),
        duration: 360,
        price: 2999,
        currency: "INR",
        priceTier: "TIER_3",
        estimatedHours: 6,
        difficulty: "ADVANCED",
        accessType: "LIFETIME",
        targetAudience: JSON.stringify(["Serious Exporters", "Trade Professionals", "Compliance Officers"]),
        keyTopics: JSON.stringify([
          "IEC, GST, documentation (India-focused)",
          "Country-specific rules",
          "Customs basics",
          "Avoiding legal trouble"
        ]),
        modules: JSON.stringify([
          {
            title: "Indian Export Compliance",
            description: "IEC, GST, and essential documentation",
            duration: 90,
            order: 1
          },
          {
            title: "Brazil Trade Regulations",
            description: "Understanding Brazilian import rules",
            duration: 60,
            order: 2
          },
          {
            title: "Russia Trade Compliance",
            description: "Russian import regulations and documentation",
            duration: 60,
            order: 3
          },
          {
            title: "China Trade Requirements",
            description: "Chinese import compliance and standards",
            duration: 60,
            order: 4
          },
          {
            title: "South Africa Trade Rules",
            description: "South African import regulations",
            duration: 45,
            order: 5
          },
          {
            title: "Legal Risk Management",
            description: "Avoiding legal trouble in BRICS trade",
            duration: 45,
            order: 6
          }
        ]),
        outcomes: JSON.stringify([
          "Master Indian export compliance",
          "Understand each BRICS country's rules",
          "Handle customs procedures",
          "Avoid legal issues",
          "Manage trade compliance effectively"
        ]),
        tags: JSON.stringify(["Compliance", "Legal", "Advanced", "Export", "Documentation"]),
        reviewsEnabled: true,
        discussionsEnabled: true,
        certificateEnabled: true,
        certificateType: "PROFESSIONAL",
        autoApprove: true,
        status: "ACTIVE",
        publishedAt: new Date()
      },
      {
        title: "BRICS Digital Economy & Future",
        description: "For builders, developers, and thinkers - understanding the future of BRICS digital economy.",
        instructor: "Digital Economy Experts",
        category: "Advanced Skills",
        subcategory: "Digital Economy",
        level: "ADVANCED",
        courseLevel: "LEVEL_4_ADVANCED",
        language: "en",
        languages: JSON.stringify(["en", "hi"]),
        duration: 240,
        price: 1999,
        currency: "INR",
        priceTier: "TIER_3",
        estimatedHours: 4,
        difficulty: "ADVANCED",
        accessType: "LIFETIME",
        targetAudience: JSON.stringify(["Developers", "Founders", "Tech Professionals", "Digital Entrepreneurs"]),
        keyTopics: JSON.stringify([
          "CBDCs & digital public infrastructure",
          "Cross-border payment evolution",
          "Role of platforms like BRICSConnect",
          "Opportunities for startups & developers"
        ]),
        modules: JSON.stringify([
          {
            title: "CBDCs and Digital Infrastructure",
            description: "Understanding Central Bank Digital Currencies",
            duration: 60,
            order: 1
          },
          {
            title: "Cross-Border Payment Evolution",
            description: "Future of international payments",
            duration: 60,
            order: 2
          },
          {
            title: "Platform Economy in BRICS",
            description: "Role of platforms like BRICSConnect",
            duration: 60,
            order: 3
          },
          {
            title: "Startup Opportunities",
            description: "Building solutions for BRICS digital economy",
            duration: 60,
            order: 4
          }
        ]),
        outcomes: JSON.stringify([
          "Understand CBDCs and digital infrastructure",
          "Know the future of cross-border payments",
          "Identify platform opportunities",
          "Build solutions for BRICS digital economy"
        ]),
        tags: JSON.stringify(["Digital", "CBDC", "Future", "Startup", "Technology"]),
        reviewsEnabled: true,
        discussionsEnabled: true,
        certificateEnabled: true,
        certificateType: "PROFESSIONAL",
        autoApprove: true,
        status: "ACTIVE",
        publishedAt: new Date()
      }
    ];

    // Community-Driven Courses
    const communityCourses = [
      {
        title: "India → Brazil: Beginner Guide",
        description: "Community-created guide for Indian businesses looking to export to Brazil.",
        instructor: "BRICS Community Contributors",
        category: "Country Playbooks",
        subcategory: "India-Brazil",
        level: "BEGINNER",
        courseLevel: "COMMUNITY",
        language: "en",
        languages: JSON.stringify(["en", "hi", "pt"]),
        duration: 120,
        price: 499,
        currency: "INR",
        priceTier: "TIER_1",
        estimatedHours: 2,
        difficulty: "BEGINNER",
        accessType: "LIFETIME",
        targetAudience: JSON.stringify(["Indian Exporters", "Brazil Importers", "Trade Beginners"]),
        keyTopics: JSON.stringify([
          "Brazil market entry basics",
          "Product preferences in Brazil",
          "Cultural business practices",
          "Legal requirements",
          "Success stories"
        ]),
        modules: JSON.stringify([
          {
            title: "Understanding Brazilian Market",
            description: "Market overview and opportunities",
            duration: 30,
            order: 1
          },
          {
            title: "Product Selection for Brazil",
            description: "What sells well in Brazil",
            duration: 30,
            order: 2
          },
          {
            title: "Cultural Business Practices",
            description: "How to do business in Brazil",
            duration: 30,
            order: 3
          },
          {
            title: "Legal and Documentation",
            description: "Brazilian import requirements",
            duration: 30,
            order: 4
          }
        ]),
        outcomes: JSON.stringify([
          "Understand Brazilian market",
          "Select right products",
          "Navigate cultural differences",
          "Handle legal requirements"
        ]),
        tags: JSON.stringify(["India", "Brazil", "Community", "Playbook"]),
        reviewsEnabled: true,
        discussionsEnabled: true,
        certificateEnabled: false,
        autoApprove: true,
        status: "ACTIVE",
        publishedAt: new Date()
      }
    ];

    // Insert all courses
    const allCourses = [
      ...level1Courses,
      ...level2Courses,
      ...level3Courses,
      ...level4Courses,
      ...communityCourses
    ];

    for (const courseData of allCourses) {
      const course = await prisma.course.create({
        data: courseData
      });
      console.log(`✅ Created course: ${course.title}`);
    }

    console.log('🎓 BRICS courses seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding BRICS courses:', error);
    throw error;
  }
}

async function main() {
  await seedBRICSCourses();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });