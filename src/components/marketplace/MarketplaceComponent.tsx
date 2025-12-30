'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Eye,
  ShoppingCart,
  TrendingUp,
  Globe,
  MapPin,
  Building
} from 'lucide-react'

interface MarketplaceComponentProps {
  userId: string
}

interface Listing {
  id: string
  title: string
  description: string
  category: string
  subcategory?: string
  price: number
  currency: string
  quantity: number
  minOrder: number
  images: string[]
  specifications: any
  shippingInfo: any
  viewCount: number
  rating: number
  reviewCount: number
  seller: {
    id: string
    name: string
    country: string
    verificationLevel: number
  }
  createdAt: string
}

export default function MarketplaceComponent({ userId }: MarketplaceComponentProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    currency: 'CNY',
    quantity: '',
    minOrder: '1',
    specifications: '',
    shippingInfo: '',
  })

  const categories = [
    'Electronics',
    'Machinery',
    'Textiles',
    'Agriculture',
    'Raw Materials',
    'Consumer Goods',
    'Industrial Parts',
    'Technology'
  ]

  const bricsCountries = [
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' }
  ]

  const currencies = ['CNY', 'INR', 'BRL', 'RUB', 'ZAR', 'CBDC']

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      
      const response = await fetch(`/api/marketplace/listings?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setListings(result.listings)
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateListing = async () => {
    try {
      const response = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId: userId,
          title: createForm.title,
          description: createForm.description,
          category: createForm.category,
          subcategory: createForm.subcategory,
          price: parseFloat(createForm.price),
          currency: createForm.currency,
          quantity: parseInt(createForm.quantity),
          minOrder: parseInt(createForm.minOrder),
          specifications: createForm.specifications,
          shippingInfo: createForm.shippingInfo,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setCreateDialogOpen(false)
        setCreateForm({
          title: '',
          description: '',
          category: '',
          subcategory: '',
          price: '',
          currency: 'CNY',
          quantity: '',
          minOrder: '1',
          specifications: '',
          shippingInfo: '',
        })
        fetchListings()
        alert('Listing created successfully!')
      } else {
        alert(result.error || 'Failed to create listing')
      }
    } catch (error) {
      console.error('Create listing error:', error)
      alert('Failed to create listing')
    }
  }

  const handleCreateOrder = async (listingId: string) => {
    try {
      const response = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerId: userId,
          listingId: listingId,
          quantity: 1,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Order placed successfully!')
      } else {
        alert(result.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Create order error:', error)
      alert('Failed to place order')
    }
  }

  const getCountryInfo = (code: string) => {
    return bricsCountries.find(c => c.code === code) || bricsCountries[0]
  }

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">B2B Marketplace</h2>
          <p className="text-gray-600">Connect with BRICS businesses for trade opportunities</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Listing</DialogTitle>
              <DialogDescription>
                List your products for BRICS-wide trade
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  placeholder="Enter product title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={createForm.category} onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  value={createForm.price}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={createForm.currency} onValueChange={(value) => setCreateForm(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Available quantity"
                  value={createForm.quantity}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="minOrder">Minimum Order</Label>
                <Input
                  id="minOrder"
                  type="number"
                  placeholder="Minimum order quantity"
                  value={createForm.minOrder}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, minOrder: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="specifications">Specifications</Label>
                <Textarea
                  id="specifications"
                  placeholder="Product specifications"
                  value={createForm.specifications}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, specifications: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="shipping">Shipping Info</Label>
                <Textarea
                  id="shipping"
                  placeholder="Shipping information"
                  value={createForm.shippingInfo}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, shippingInfo: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <Button onClick={handleCreateListing} className="w-full">
                  Create Listing
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map(listing => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {listing.images.length > 0 && (
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {listing.description}
                  </CardDescription>
                </div>
                <Badge variant="outline">{listing.category}</Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {listing.price} {listing.currency}
                    </p>
                    <p className="text-sm text-gray-600">
                      Min. Order: {listing.minOrder} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {listing.quantity} available
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm ml-1">{listing.rating}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {listing.reviewCount} reviews
                  </span>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm ml-1">{listing.viewCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs">{getCountryInfo(listing.seller.country).flag}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{listing.seller.name}</p>
                      <p className="text-xs text-gray-600">
                        Level {listing.seller.verificationLevel} Verified
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleCreateOrder(listing.id)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Order
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filters' 
              : 'Be the first to list a product in the marketplace'}
          </p>
        </div>
      )}
    </div>
  )
}