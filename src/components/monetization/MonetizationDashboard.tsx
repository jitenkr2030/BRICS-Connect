'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  BookOpen,
  CreditCard,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';

interface RevenueData {
  summary: {
    totalRevenue: number;
    totalFees: number;
    totalTransactions: number;
    averageFeePerTransaction: number;
    period: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
  revenueBySource: {
    [key: string]: {
      count: number;
      totalAmount: number;
      currency: string;
    };
  };
  feesByType: {
    [key: string]: {
      count: number;
      totalFees: number;
      totalBaseAmount: number;
      currency: string;
    };
  };
  dailyRevenue: Array<{
    date: string;
    amount: number;
  }>;
  recentTransactions: Array<{
    id: string;
    transactionId: string;
    feeType: string;
    feeAmount: number;
    currency: string;
    createdAt: string;
  }>;
}

export default function MonetizationDashboard() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('MONTHLY');

  useEffect(() => {
    fetchRevenueData();
  }, [selectedPeriod]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/monetization/revenue?period=${selectedPeriod}`);
      const result = await response.json();
      
      if (result.success) {
        setRevenueData(result.data);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getFeeTypeIcon = (feeType: string) => {
    switch (feeType) {
      case 'TRANSACTION_FEE':
        return <CreditCard className="h-4 w-4" />;
      case 'MARKETPLACE_COMMISSION':
        return <ShoppingCart className="h-4 w-4" />;
      case 'COURSE_FEE':
        return <BookOpen className="h-4 w-4" />;
      case 'CURRENCY_CONVERSION':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'TRANSACTION_FEE':
        return <CreditCard className="h-4 w-4" />;
      case 'MARKETPLACE_COMMISSION':
        return <ShoppingCart className="h-4 w-4" />;
      case 'COURSE_SALE':
        return <BookOpen className="h-4 w-4" />;
      case 'SUBSCRIPTION':
        return <Users className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!revenueData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No revenue data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Monetization Dashboard</h2>
          <p className="text-muted-foreground">
            Track revenue, fees, and platform monetization performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === 'DAILY' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('DAILY')}
          >
            Daily
          </Button>
          <Button
            variant={selectedPeriod === 'WEEKLY' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('WEEKLY')}
          >
            Weekly
          </Button>
          <Button
            variant={selectedPeriod === 'MONTHLY' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('MONTHLY')}
          >
            Monthly
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueData.summary.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {revenueData.summary.period} period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueData.summary.totalFees)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {revenueData.summary.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Fee/Transaction</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueData.summary.averageFeePerTransaction)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueData.summary.totalTransactions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Processed transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="revenue-sources" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue-sources">Revenue Sources</TabsTrigger>
          <TabsTrigger value="fee-types">Fee Types</TabsTrigger>
          <TabsTrigger value="daily-trend">Daily Trend</TabsTrigger>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue-sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Revenue by Source
              </CardTitle>
              <CardDescription>
                Breakdown of revenue by different sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(revenueData.revenueBySource).map(([source, data]) => (
                  <div key={source} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getSourceIcon(source)}
                      <div>
                        <p className="font-medium">{source.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.count} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(data.totalAmount)}</p>
                      <Badge variant="secondary">{data.currency}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fee-types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Fees by Type
              </CardTitle>
              <CardDescription>
                Analysis of different fee types and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(revenueData.feesByType).map(([feeType, data]) => (
                  <div key={feeType} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getFeeTypeIcon(feeType)}
                      <div>
                        <p className="font-medium">{feeType.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.count} transactions • {formatCurrency(data.totalBaseAmount)} base amount
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(data.totalFees)}</p>
                      <Badge variant="secondary">{data.currency}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Daily Revenue Trend
              </CardTitle>
              <CardDescription>
                Daily revenue performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {revenueData.dailyRevenue.slice(-7).map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{day.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(day.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent-activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>
                Latest fee transactions and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revenueData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getFeeTypeIcon(transaction.feeType)}
                      <div>
                        <p className="font-medium">{transaction.transactionId}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.feeType.replace('_', ' ')} • {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(transaction.feeAmount)}</p>
                      <Badge variant="secondary">{transaction.currency}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}