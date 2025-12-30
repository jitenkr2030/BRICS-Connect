import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  country: z.string().optional(),
  businessType: z.enum(['SME', 'FREELANCER', 'STUDENT', 'ENTERPRISE']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        phone: validatedData.phone,
        country: validatedData.country,
        businessType: validatedData.businessType,
        kycStatus: 'PENDING',
        isVerified: false,
        verificationLevel: 0,
      }
    })

    // Create default wallets for BRICS currencies
    const bricsCurrencies = ['CBDC', 'CNY', 'INR', 'BRL', 'RUB', 'ZAR']
    await Promise.all(
      bricsCurrencies.map(currency =>
        db.wallet.create({
          data: {
            userId: user.id,
            currency,
            balance: 0.00,
            frozenBalance: 0.00,
            walletType: currency === 'CBDC' ? 'INTEREST_BEARING' : 'STANDARD',
            isActive: true,
          }
        })
      )
    )

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        country: user.country,
        businessType: user.businessType,
        kycStatus: user.kycStatus,
        verificationLevel: user.verificationLevel,
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}