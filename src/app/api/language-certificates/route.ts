import { db } from '@/lib/db';
import { z } from 'zod';

const createCertificateSchema = z.object({
  userId: z.string(),
  courseId: z.string(),
  certificateType: z.string().default("COMPLETION"),
  level: z.string().default("BEGINNER"),
  proficiencyLevel: z.string(),
  skillsDemonstrated: z.array(z.string()).optional(),
});

// GET /api/language-certificates - Get certificates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    const courseId = searchParams.get('courseId') || '';
    const verificationCode = searchParams.get('verificationCode') || '';

    const where: any = {};
    if (userId) where.userId = userId;
    if (courseId) where.courseId = courseId;
    if (verificationCode) where.verificationCode = verificationCode;

    const certificates = await db.languageCertificate.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            targetLanguage: true,
            sourceLanguage: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { issueDate: 'desc' }
    });

    return Response.json(certificates);
  } catch (error) {
    console.error('Error fetching language certificates:', error);
    return Response.json({ error: 'Failed to fetch language certificates' }, { status: 500 });
  }
}

// POST /api/language-certificates - Create new certificate
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createCertificateSchema.parse(body);

    // Check if certificate already exists
    const existingCertificate = await db.languageCertificate.findFirst({
      where: {
        userId: validatedData.userId,
        courseId: validatedData.courseId,
        certificateType: validatedData.certificateType
      }
    });

    if (existingCertificate) {
      return Response.json({ error: 'Certificate already exists for this course and type' }, { status: 400 });
    }

    const certificate = await db.languageCertificate.create({
      data: {
        ...validatedData,
        skillsDemonstrated: validatedData.skillsDemonstrated ? JSON.stringify(validatedData.skillsDemonstrated) : null,
      },
      include: {
        course: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return Response.json(certificate, { status: 201 });
  } catch (error) {
    console.error('Error creating language certificate:', error);
    return Response.json({ error: 'Failed to create language certificate' }, { status: 500 });
  }
}