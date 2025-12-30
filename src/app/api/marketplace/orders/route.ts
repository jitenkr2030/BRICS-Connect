import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const orderSchema = z.object({
  buyerId: z.string(),
  listingId: z.string(),
  quantity: z.number().positive(),
  shippingAddress: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = orderSchema.parse(body)

    // Get listing details
    const listing = await db.marketplaceListing.findUnique({
      where: { id: validatedData.listingId },
      include: { seller: true }
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.quantity < validatedData.quantity) {
      return NextResponse.json(
        { error: 'Insufficient quantity available' },
        { status: 400 }
      )
    }

    // Calculate total price
    const totalPrice = listing.price.mul(validatedData.quantity)

    // Create order
    const order = await db.marketplaceOrder.create({
      data: {
        buyerId: validatedData.buyerId,
        listingId: validatedData.listingId,
        quantity: validatedData.quantity,
        unitPrice: listing.price,
        totalPrice: totalPrice,
        currency: listing.currency,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        shippingAddress: validatedData.shippingAddress,
        notes: validatedData.notes,
      }
    })

    // Update listing quantity
    await db.marketplaceListing.update({
      where: { id: validatedData.listingId },
      data: {
        quantity: listing.quantity - validatedData.quantity
      }
    })

    // Create notification for seller
    await db.notification.create({
      data: {
        userId: listing.sellerId,
        type: 'ORDER',
        title: 'New Order Received',
        message: `You have received a new order for ${listing.title}`,
        data: JSON.stringify({ orderId: order.id, listingId: listing.id }),
        actionUrl: `/marketplace/orders/${order.id}`,
      }
    })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        listingId: order.listingId,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        currency: order.currency,
        status: order.status,
        createdAt: order.createdAt,
      }
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'buyer' or 'seller'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const where = type === 'seller' 
      ? { listing: { sellerId: userId } }
      : { buyerId: userId }

    const orders = await db.marketplaceOrder.findMany({
      where,
      include: {
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                country: true,
              }
            }
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            country: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        listing: {
          id: order.listing.id,
          title: order.listing.title,
          images: order.listing.images ? JSON.parse(order.listing.images) : [],
        },
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        totalPrice: order.totalPrice,
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
        trackingNumber: order.trackingNumber,
        notes: order.notes,
        seller: order.listing.seller,
        buyer: order.buyer,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }))
    })

  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}