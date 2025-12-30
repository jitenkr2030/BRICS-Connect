'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import AuthForm from '@/components/auth/AuthForm'
import WalletComponent from '@/components/wallet/WalletComponent'
import MarketplaceComponent from '@/components/marketplace/MarketplaceComponent'
import EducationComponent from '@/components/education/EducationComponent'
import LanguageLearningCatalog from '@/components/language/LanguageLearningCatalog'
import { 
  Wallet, 
  ShoppingCart, 
  GraduationCap, 
  TrendingUp, 
  Users, 
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  BookOpen,
  Package,
  Star,
  Bell,
  Settings,
  Plus,
  Search,
  Filter,
  Languages
} from 'lucide-react'

export default function BRICSConnect() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState<any>(null)

  const mockData = {
    wallet: {
      totalBalance: 125430.50,
      currencies: [
        { code: 'CBDC', balance: 50000.00, change: 2.5 },
        { code: 'CNY', balance: 35000.00, change: 1.2 },
        { code: 'INR', balance: 28430.50, change: -0.8 },
        { code: 'BRL', balance: 12000.00, change: 3.1 }
      ],
      recentTransactions: [
        { id: 1, type: 'receive', amount: 2500.00, currency: 'CNY', description: 'Payment from supplier', time: '2 hours ago' },
        { id: 2, type: 'send', amount: 850.00, currency: 'CBDC', description: 'Course enrollment fee', time: '5 hours ago' },
        { id: 3, type: 'payment', amount: 3200.00, currency: 'BRL', description: 'Marketplace purchase', time: '1 day ago' }
      ]
    },
    marketplace: {
      activeListings: 12,
      totalOrders: 48,
      revenue: 28500.00,
      topProducts: [
        { id: 1, title: 'Industrial Components', price: 2500.00, currency: 'CNY', orders: 15, rating: 4.8 },
        { id: 2, title: 'Electronics Parts', price: 1800.00, currency: 'CBDC', orders: 12, rating: 4.9 },
        { id: 3, title: 'Raw Materials', price: 3200.00, currency: 'BRL', orders: 8, rating: 4.6 }
      ],
      recentOrders: [
        { id: 1, title: 'Industrial Components', quantity: 5, total: 12500.00, status: 'shipped', buyer: 'Mumbai Tech' },
        { id: 2, title: 'Electronics Parts', quantity: 3, total: 5400.00, status: 'pending', buyer: 'São Paulo Industries' }
      ]
    },
    education: {
      enrolledCourses: 6,
      completedCourses: 3,
      certificates: 3,
      progress: 65,
      currentCourses: [
        { id: 1, title: 'Cross-Border Trade Management', progress: 85, instructor: 'Dr. Maria Silva', duration: '4 hours' },
        { id: 2, title: 'Digital Currency Integration', progress: 60, instructor: 'Prof. Li Wei', duration: '6 hours' },
        { id: 3, title: 'Supply Chain Optimization', progress: 30, instructor: 'Dr. Raj Patel', duration: '5 hours' }
      ],
      achievements: [
        { id: 1, title: 'Trade Expert', description: 'Completed 5 trade courses', icon: '🏆' },
        { id: 2, title: 'Fast Learner', description: 'Completed course in record time', icon: '⚡' },
        { id: 3, title: 'Top Student', description: 'Highest rating in class', icon: '🌟' }
      ]
    }
  }

  const bricsCountries = [
    { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL' },
    { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY' },
    { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺', currency: 'RUB' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR' }
  ]

  const handleAuthSuccess = (userData: any) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">BRICS Connect</h1>
              </div>
              <Badge variant="secondary" className="text-xs">
                One platform to pay, trade, and learn across BRICS
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-slate-600">
            Manage your cross-border business across BRICS nations
          </p>
          <div className="flex items-center space-x-4 mt-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>{bricsCountries.find(c => c.code === user?.country)?.flag}</span>
              <span>{bricsCountries.find(c => c.code === user?.country)?.name}</span>
            </Badge>
            <Badge variant="outline">
              {user?.businessType}
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              Level {user?.verificationLevel || 1} Verified
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockData.wallet.totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +2.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.marketplace.activeListings}</div>
              <p className="text-xs text-muted-foreground">
                {mockData.marketplace.totalOrders} total orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.education.enrolledCourses}</div>
              <p className="text-xs text-muted-foreground">
                {mockData.education.completedCourses} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockData.marketplace.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="language">Languages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest cross-border activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.wallet.recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'receive' ? 'bg-green-100' : 
                            transaction.type === 'send' ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            {transaction.type === 'receive' ? (
                              <ArrowDownRight className="w-5 h-5 text-green-600" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">{transaction.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {transaction.type === 'receive' ? '+' : '-'}
                            {transaction.amount} {transaction.currency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <CreditCard className="w-6 h-6 mb-2" />
                      <span className="text-sm">Send Money</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Plus className="w-6 h-6 mb-2" />
                      <span className="text-sm">Add Listing</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <BookOpen className="w-6 h-6 mb-2" />
                      <span className="text-sm">Browse Courses</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Filter className="w-6 h-6 mb-2" />
                      <span className="text-sm">Analytics</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <WalletComponent userId={user?.id} />
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <MarketplaceComponent userId={user?.id} />
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <EducationComponent userId={user?.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}