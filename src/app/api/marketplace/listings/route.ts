import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const listingSchema = z.object({
  sellerId: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string(),
  subcategory: z.string().optional(),
  price: z.number().positive(),
  currency: z.string(),
  quantity: z.number().positive(),
  minOrder: z.number().positive().optional(),
  images: z.string().optional(),
  specifications: z.string().optional(),
  shippingInfo: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = category ? { category, status: 'ACTIVE' } : { status: 'ACTIVE' }

    const listings = await db.marketplaceListing.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            country: true,
            verificationLevel: true,
          }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return NextResponse.json({
      success: true,
      listings: listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        subcategory: listing.subcategory,
        price: listing.price,
        currency: listing.currency,
        quantity: listing.quantity,
        minOrder: listing.minOrder,
        images: listing.images ? JSON.parse(listing.images) : [],
        specifications: listing.specifications ? JSON.parse(listing.specifications) : {},
        shippingInfo: listing.shippingInfo ? JSON.parse(listing.shippingInfo) : {},
        viewCount: listing.viewCount,
        rating: listing.rating,
        reviewCount: listing.reviewCount,
        seller: listing.seller,
        reviewCount: listing._count.reviews,
        createdAt: listing.createdAt,
      }))
    })

  } catch (error) {
    console.error('Marketplace fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marketplace listings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = listingSchema.parse(body)

    // Check if seller exists and is verified
    const seller = await db.user.findUnique({
      where: { id: validatedData.sellerId }
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    if (seller.verificationLevel < 1) {
      return NextResponse.json(
        { error: 'Seller must be verified to create listings' },
        { status: 403 }
      )
    }

    // Create marketplace listing
    const listing = await db.marketplaceListing.create({
      data: {
        sellerId: validatedData.sellerId,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        subcategory: validatedData.subcategory,
        price: validatedData.price,
        currency: validatedData.currency,
        quantity: validatedData.quantity,
        minOrder: validatedData.minOrder || 1,
        images: validatedData.images,
        specifications: validatedData.specifications,
        shippingInfo: validatedData.shippingInfo,
        status: 'ACTIVE',
        viewCount: 0,
        rating: 0.00,
        reviewCount: 0,
      }
    })

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        price: listing.price,
        currency: listing.currency,
        quantity: listing.quantity,
        status: listing.status,
        createdAt: listing.createdAt,
      }
    })

  } catch (error) {
    console.error('Listing creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}