'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  ShoppingCart, 
  GraduationCap, 
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Settings,
  Shield,
  FileText,
  Activity,
  BarChart3,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react'

interface AdminDashboardProps {
  userId: string
}

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalListings: number
  activeListings: number
  totalCourses: number
  activeCourses: number
  totalRevenue: number
  monthlyRevenue: number
  pendingReports: number
  systemHealth: 'healthy' | 'warning' | 'error'
}

interface RecentActivity {
  id: string
  type: string
  description: string
  user: string
  timestamp: string
  status: string
}

interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  isRead: boolean
}

export default function AdminDashboard({ userId }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchAdminData()
  }, [userId])

  const fetchAdminData = async () => {
    try {
      // Mock admin data - in production this would come from API
      const mockStats: AdminStats = {
        totalUsers: 15420,
        activeUsers: 8934,
        totalListings: 3456,
        activeListings: 2890,
        totalCourses: 156,
        activeCourses: 142,
        totalRevenue: 2847500.00,
        monthlyRevenue: 425000.00,
        pendingReports: 23,
        systemHealth: 'healthy'
      }

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'user_registration',
          description: 'New user registered from China',
          user: 'Zhang Wei',
          timestamp: '2 minutes ago',
          status: 'completed'
        },
        {
          id: '2',
          type: 'listing_created',
          description: 'New marketplace listing for electronics',
          user: 'Maria Silva',
          timestamp: '15 minutes ago',
          status: 'pending_approval'
        },
        {
          id: '3',
          type: 'course_enrollment',
          description: 'Bulk enrollment for digital currency course',
          user: 'Raj Patel',
          timestamp: '1 hour ago',
          status: 'completed'
        },
        {
          id: '4',
          type: 'transaction_flagged',
          description: 'Large transaction flagged for review',
          user: 'System',
          timestamp: '2 hours ago',
          status: 'requires_review'
        }
      ]

      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'High Transaction Volume',
          message: 'Transaction volume is 300% above normal levels',
          timestamp: '30 minutes ago',
          isRead: false
        },
        {
          id: '2',
          type: 'error',
          title: 'Payment Gateway Issue',
          message: 'CBDC payment processor experiencing delays',
          timestamp: '2 hours ago',
          isRead: false
        }
      ]

      setStats(mockStats)
      setRecentActivity(mockActivity)
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return <Users className="w-4 h-4" />
      case 'listing_created': return <ShoppingCart className="w-4 h-4" />
      case 'course_enrollment': return <GraduationCap className="w-4 h-4" />
      case 'transaction_flagged': return <AlertTriangle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800'
      case 'requires_review': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info': return <FileText className="w-4 h-4 text-blue-500" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Platform Management & Monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={stats?.systemHealth === 'healthy' ? 'default' : 'destructive'}>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                stats?.systemHealth === 'healthy' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {stats?.systemHealth === 'healthy' ? 'System Healthy' : 'System Issues'}
            </div>
          </Badge>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="monetization">Monetization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeUsers.toLocaleString()} active now
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Marketplace</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalListings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeListings.toLocaleString()} active listings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Education</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCourses}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeCourses} active courses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ${stats?.monthlyRevenue.toLocaleString()} this month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.description}</p>
                        <p className="text-xs text-gray-600">
                          {activity.user} • {activity.timestamp}
                        </p>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Important system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-gray-600">{alert.message}</p>
                        <p className="text-xs text-gray-500">{alert.timestamp}</p>
                      </div>
                      {!alert.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>

                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>User management interface would be implemented here</p>
                  <p className="text-sm">Including user details, KYC status, ban/unban functionality</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>Review and moderate platform content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Content moderation dashboard</p>
                <p className="text-sm">Review listings, courses, and user reports</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Monitoring</CardTitle>
              <CardDescription>Monitor and review suspicious transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Transaction monitoring interface</p>
                <p className="text-sm">Real-time transaction tracking and fraud detection</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monetization Tab */}
        <TabsContent value="monetization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monetization Dashboard</CardTitle>
              <CardDescription>Track revenue, fees, and platform monetization performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Monetization dashboard would be loaded here</p>
                <p className="text-sm">Revenue tracking, fee management, and subscription analytics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>Detailed insights and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Analytics dashboard</p>
                <p className="text-sm">User growth, revenue trends, and platform performance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure platform parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Platform configuration</p>
                <p className="text-sm">Security settings, payment configs, and system preferences</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}