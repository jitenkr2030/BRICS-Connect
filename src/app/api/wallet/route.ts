import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const transactionSchema = z.object({
  walletId: z.string(),
  type: z.enum(['SEND', 'RECEIVE', 'PAYMENT', 'REFUND']),
  amount: z.number().positive(),
  currency: z.string(),
  description: z.string().optional(),
  referenceId: z.string().optional(),
  recipientWalletId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user wallets
    const wallets = await db.wallet.findMany({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    return NextResponse.json({
      success: true,
      wallets: wallets.map(wallet => ({
        id: wallet.id,
        currency: wallet.currency,
        balance: wallet.balance,
        frozenBalance: wallet.frozenBalance,
        walletType: wallet.walletType,
        isActive: wallet.isActive,
        recentTransactions: wallet.transactions
      }))
    })

  } catch (error) {
    console.error('Wallet fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = transactionSchema.parse(body)

    // Get source wallet
    const sourceWallet = await db.wallet.findUnique({
      where: { id: validatedData.walletId }
    })

    if (!sourceWallet) {
      return NextResponse.json(
        { error: 'Source wallet not found' },
        { status: 404 }
      )
    }

    // Check sufficient balance
    if (sourceWallet.balance < validatedData.amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Create transaction record
    const transaction = await db.transaction.create({
      data: {
        walletId: validatedData.walletId,
        type: validatedData.type,
        amount: validatedData.amount,
        currency: validatedData.currency,
        description: validatedData.description,
        referenceId: validatedData.referenceId,
        status: 'PENDING',
      }
    })

    // Update wallet balance
    const newBalance = sourceWallet.balance.minus(validatedData.amount)
    await db.wallet.update({
      where: { id: validatedData.walletId },
      data: { balance: newBalance }
    })

    // If it's a transfer to another wallet
    if (validatedData.recipientWalletId) {
      const recipientWallet = await db.wallet.findUnique({
        where: { id: validatedData.recipientWalletId }
      })

      if (recipientWallet) {
        await db.wallet.update({
          where: { id: validatedData.recipientWalletId },
          data: { 
            balance: recipientWallet.balance.plus(validatedData.amount)
          }
        })

        // Create corresponding transaction for recipient
        await db.transaction.create({
          data: {
            walletId: validatedData.recipientWalletId,
            type: 'RECEIVE',
            amount: validatedData.amount,
            currency: validatedData.currency,
            description: validatedData.description,
            referenceId: validatedData.referenceId,
            status: 'COMPLETED',
          }
        })
      }
    }

    // Update transaction status
    await db.transaction.update({
      where: { id: transaction.id },
      data: { status: 'COMPLETED' }
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
      newBalance: newBalance.toNumber()
    })

  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json(
      { error: 'Transaction failed' },
      { status: 500 }
    )
  }
}