import { db } from '@/lib/db';

// BRICS Language Learning Courses Seed Data
const bricsLanguageCourses = [
  // Chinese Learning Hindi
  {
    title: "Business Hindi for Chinese Speakers",
    description: "Learn essential Hindi for business communication with Indian companies and partners",
    targetLanguage: "Hindi",
    sourceLanguage: "Chinese",
    level: "BEGINNER",
    category: "Business",
    instructor: "Dr. Rajesh Kumar",
    duration: 40,
    price: 2999,
    originalPrice: 3999,
    thumbnail: "/images/courses/hindi-chinese.jpg",
    videoUrl: "/videos/courses/hindi-chinese-intro.mp4",
    focusAreas: ["Speaking", "Listening", "Writing"],
    businessContext: ["Trade", "Negotiation", "Finance"],
    tags: ["Hindi", "Business", "Chinese", "India"],
    requirements: ["Basic understanding of Chinese characters"],
    outcomes: ["Conduct basic business conversations in Hindi", "Understand Indian business culture", "Read and write basic Hindi business documents"],
    keyTopics: ["Business greetings", "Negotiation phrases", "Financial terms", "Cultural etiquette"],
    isPublished: true,
    isFeatured: true,
  },
  
  // Hindi Learning Chinese
  {
    title: "Mandarin for Indian Business Professionals",
    description: "Master essential Mandarin for trade and business with Chinese companies",
    targetLanguage: "Mandarin",
    sourceLanguage: "Hindi",
    level: "BEGINNER",
    category: "Business",
    instructor: "Prof. Li Wei",
    duration: 45,
    price: 3499,
    originalPrice: 4499,
    thumbnail: "/images/courses/chinese-hindi.jpg",
    videoUrl: "/videos/courses/chinese-hindi-intro.mp4",
    focusAreas: ["Speaking", "Listening", "Reading"],
    businessContext: ["Manufacturing", "Supply Chain", "Technology"],
    tags: ["Mandarin", "Business", "Hindi", "China"],
    requirements: ["Basic English proficiency"],
    outcomes: ["Negotiate with Chinese suppliers", "Understand Chinese business culture", "Read basic Chinese business documents"],
    keyTopics: ["Business terminology", "Manufacturing terms", "Negotiation strategies", "Cultural insights"],
    isPublished: true,
    isFeatured: true,
  },

  // Russian Learning Hindi
  {
    title: "Hindi for Russian Business Partners",
    description: "Learn Hindi for effective communication with Indian businesses in energy, technology, and trade sectors",
    targetLanguage: "Hindi",
    sourceLanguage: "Russian",
    level: "INTERMEDIATE",
    category: "Business",
    instructor: "Dr. Sergei Petrov",
    duration: 50,
    price: 3999,
    originalPrice: 4999,
    thumbnail: "/images/courses/hindi-russian.jpg",
    videoUrl: "/videos/courses/hindi-russian-intro.mp4",
    focusAreas: ["Speaking", "Writing", "Reading"],
    businessContext: ["Energy", "Technology", "Defense"],
    tags: ["Hindi", "Business", "Russian", "India"],
    requirements: ["Intermediate English proficiency"],
    outcomes: ["Communicate effectively in Indian business settings", "Understand Indian regulatory environment", "Draft basic business proposals in Hindi"],
    keyTopics: ["Energy sector terminology", "Technology partnerships", "Regulatory compliance", "Business correspondence"],
    isPublished: true,
    isFeatured: false,
  },

  // Hindi Learning Russian
  {
    title: "Russian for Indian Entrepreneurs",
    description: "Essential Russian language skills for Indian businesses expanding into Russian markets",
    targetLanguage: "Russian",
    sourceLanguage: "Hindi",
    level: "BEGINNER",
    category: "Business",
    instructor: "Maria Ivanova",
    duration: 35,
    price: 2799,
    originalPrice: 3799,
    thumbnail: "/images/courses/russian-hindi.jpg",
    videoUrl: "/videos/courses/russian-hindi-intro.mp4",
    focusAreas: ["Speaking", "Listening", "Reading"],
    businessContext: ["Trade", "Manufacturing", "Agriculture"],
    tags: ["Russian", "Business", "Hindi", "Russia"],
    requirements: ["Basic Hindi or English proficiency"],
    outcomes: ["Navigate Russian business environment", "Communicate with Russian partners", "Understand Russian market dynamics"],
    keyTopics: ["Business introductions", "Market entry strategies", "Legal terminology", "Cultural adaptation"],
    isPublished: true,
    isFeatured: false,
  },

  // Portuguese Learning Hindi
  {
    title: "Português para Negócios na Índia",
    description: "Learn Portuguese for Indian businesses looking to expand into Brazilian and Portuguese markets",
    targetLanguage: "Portuguese",
    sourceLanguage: "Hindi",
    level: "BEGINNER",
    category: "Business",
    instructor: "Carlos Silva",
    duration: 40,
    price: 3199,
    originalPrice: 4199,
    thumbnail: "/images/courses/portuguese-hindi.jpg",
    videoUrl: "/videos/courses/portuguese-hindi-intro.mp4",
    focusAreas: ["Speaking", "Listening", "Writing"],
    businessContext: ["Agriculture", "Mining", "Technology"],
    tags: ["Portuguese", "Business", "Hindi", "Brazil"],
    requirements: ["Basic English proficiency"],
    outcomes: ["Conduct business in Portuguese", "Understand Brazilian business culture", "Navigate Portuguese-speaking markets"],
    keyTopics: ["Business negotiations", "Agricultural terminology", "Mining sector terms", "Cultural etiquette"],
    isPublished: true,
    isFeatured: false,
  },

  // Hindi Learning Portuguese
  {
    title: "Hindi for Brazilian Business Professionals",
    description: "Essential Hindi language skills for Brazilian companies entering the Indian market",
    targetLanguage: "Hindi",
    sourceLanguage: "Portuguese",
    level: "INTERMEDIATE",
    category: "Business",
    instructor: "Dr. Ananya Sharma",
    duration: 45,
    price: 3499,
    originalPrice: 4499,
    thumbnail: "/images/courses/hindi-portuguese.jpg",
    videoUrl: "/videos/courses/hindi-portuguese-intro.mp4",
    focusAreas: ["Speaking", "Reading", "Writing"],
    businessContext: ["Technology", "Manufacturing", "Services"],
    tags: ["Hindi", "Business", "Portuguese", "Brazil"],
    requirements: ["Intermediate Portuguese proficiency"],
    outcomes: ["Communicate effectively in Indian business", "Understand Indian market dynamics", "Build business relationships in India"],
    keyTopics: ["Business communication", "Market analysis", "Partnership development", "Cultural integration"],
    isPublished: true,
    isFeatured: false,
  },

  // English for BRICS (Universal)
  {
    title: "Business English for BRICS Professionals",
    description: "Master business English for effective communication across all BRICS nations",
    targetLanguage: "English",
    sourceLanguage: "Multiple",
    level: "INTERMEDIATE",
    category: "Business",
    instructor: "Dr. Michael Johnson",
    duration: 60,
    price: 2499,
    originalPrice: 3499,
    thumbnail: "/images/courses/english-brics.jpg",
    videoUrl: "/videos/courses/english-brics-intro.mp4",
    focusAreas: ["Speaking", "Writing", "Listening", "Reading"],
    businessContext: ["International Trade", "Finance", "Technology", "Diplomacy"],
    tags: ["English", "Business", "BRICS", "International"],
    requirements: ["Basic English knowledge"],
    outcomes: ["Communicate effectively in international business", "Write professional business documents", "Understand cross-cultural communication"],
    keyTopics: ["International business terminology", "Cross-cultural communication", "Financial English", "Diplomatic language"],
    isPublished: true,
    isFeatured: true,
  },

  // Cultural Integration Courses
  {
    title: "BRICS Business Culture Integration",
    description: "Understanding cultural nuances and business etiquette across all BRICS countries",
    targetLanguage: "Multiple",
    sourceLanguage: "English",
    level: "ADVANCED",
    category: "Culture",
    instructor: "Dr. Elena Kuznetsova",
    duration: 30,
    price: 1999,
    originalPrice: 2999,
    thumbnail: "/images/courses/brics-culture.jpg",
    videoUrl: "/videos/courses/brics-culture-intro.mp4",
    focusAreas: ["Cultural Understanding", "Business Etiquette"],
    businessContext: ["Cross-Cultural Communication", "International Relations"],
    tags: ["Culture", "BRICS", "Business Etiquette", "International"],
    requirements: ["Business experience", "English proficiency"],
    outcomes: ["Navigate BRICS business cultures", "Avoid cultural misunderstandings", "Build international relationships"],
    keyTopics: ["Cultural dimensions", "Business etiquette", "Communication styles", "Negotiation approaches"],
    isPublished: true,
    isFeatured: false,
  },
];

async function seedLanguageCourses() {
  console.log('🌍 Seeding BRICS Language Learning Courses...');

  try {
    for (const courseData of bricsLanguageCourses) {
      const course = await db.languageCourse.create({
        data: {
          ...courseData,
          focusAreas: courseData.focusAreas ? JSON.stringify(courseData.focusAreas) : null,
          businessContext: courseData.businessContext ? JSON.stringify(courseData.businessContext) : null,
          tags: courseData.tags ? JSON.stringify(courseData.tags) : null,
          requirements: courseData.requirements ? JSON.stringify(courseData.requirements) : null,
          outcomes: courseData.outcomes ? JSON.stringify(courseData.outcomes) : null,
          keyTopics: courseData.keyTopics ? JSON.stringify(courseData.keyTopics) : null,
        }
      });

      console.log(`✅ Created language course: ${course.title}`);

      // Create sample lessons for each course
      const sampleLessons = [
        {
          title: "Introduction to Business Language",
          content: "Welcome to the course! In this lesson, you'll learn essential business greetings and introductions.",
          type: "VIDEO",
          duration: 15,
          vocabulary: ["business", "meeting", "partnership", "negotiation"],
          phrases: ["Nice to meet you", "Let's discuss business", "I look forward to our partnership"],
          culturalNotes: "In business meetings, punctuality is highly valued across all BRICS countries.",
          businessScenarios: ["First meeting", "Business card exchange", "Introduction presentation"],
          videoUrl: "/videos/lessons/introduction.mp4",
          order: 1,
          isPublished: true,
          isPreview: true,
        },
        {
          title: "Business Communication Basics",
          content: "Learn how to communicate effectively in business settings with proper etiquette.",
          type: "TEXT",
          duration: 20,
          vocabulary: ["communication", "proposal", "contract", "agreement"],
          phrases: ["Could you please explain", "I would like to propose", "We agree to the terms"],
          culturalNotes: "Direct communication styles vary across cultures - adapt your approach accordingly.",
          businessScenarios: ["Email writing", "Phone calls", "Video conferences"],
          order: 2,
          isPublished: true,
          isPreview: false,
        },
        {
          title: "Negotiation Language",
          content: "Master the language of negotiation and deal-making in international business.",
          type: "INTERACTIVE",
          duration: 25,
          vocabulary: ["negotiation", "compromise", "proposal", "agreement"],
          phrases: ["We propose", "Would you consider", "Let's find a middle ground"],
          culturalNotes: "Negotiation styles differ significantly across BRICS countries - research is essential.",
          businessScenarios: ["Price negotiation", "Contract terms", "Partnership agreements"],
          exercises: {
            "type": "role_play",
            "scenarios": ["Price negotiation", "Partnership discussion", "Contract review"]
          },
          order: 3,
          isPublished: true,
          isPreview: false,
        }
      ];

      for (const lessonData of sampleLessons) {
        const lesson = await db.languageLesson.create({
          data: {
            courseId: course.id,
            ...lessonData,
            vocabulary: lessonData.vocabulary ? JSON.stringify(lessonData.vocabulary) : null,
            phrases: lessonData.phrases ? JSON.stringify(lessonData.phrases) : null,
            businessScenarios: lessonData.businessScenarios ? JSON.stringify(lessonData.businessScenarios) : null,
            exercises: lessonData.exercises ? JSON.stringify(lessonData.exercises) : null,
          }
        });

        console.log(`  📚 Created lesson: ${lesson.title}`);
      }

      // Create assessment for each course
      const assessment = await db.languageAssessment.create({
        data: {
          courseId: course.id,
          title: "Course Completion Assessment",
          description: "Test your knowledge and receive your certificate",
          type: "CERTIFICATION",
          questions: [
            {
              "type": "multiple_choice",
              "question": "What is the most appropriate greeting in a business setting?",
              "options": ["Hey", "Hello", "Good morning/afternoon", "Yo"],
              "correct": 2
            },
            {
              "type": "translation",
              "question": "Translate: 'We look forward to our partnership'",
              "correct_answer": "Partnership translation"
            },
            {
              "type": "scenario",
              "question": "How would you handle a negotiation scenario?",
              "context": "You are negotiating a price with a supplier",
              "evaluation": "diplomatic_communication"
            }
          ],
          timeLimit: 30,
          passingScore: 70,
          skillsTested: JSON.stringify(["Speaking", "Writing", "Listening", "Reading"]),
        }
      });

      console.log(`  📝 Created assessment: ${assessment.title}`);
    }

    console.log('✅ BRICS Language Learning Courses seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding language courses:', error);
    throw error;
  }
}

// Run the seed function
seedLanguageCourses()
  .then(() => {
    console.log('🎉 Language learning seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });