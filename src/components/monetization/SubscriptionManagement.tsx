'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Crown, 
  Star, 
  Building, 
  GraduationCap,
  Check,
  X,
  CreditCard,
  Calendar,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
  limits?: string;
  isActive: boolean;
  sortOrder: number;
}

interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  autoRenew: boolean;
  paymentMethod?: string;
  lastPaymentAt?: string;
  plan: SubscriptionPlan;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
}

export default function SubscriptionManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monetization/subscriptions');
      const result = await response.json();
      
      if (result.success) {
        setPlans(result.data);
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscriptions = async (userId: string) => {
    try {
      const response = await fetch(`/api/monetization/subscriptions?userId=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setUserSubscriptions(result.data);
      }
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !selectedUserId) return;

    try {
      const response = await fetch('/api/monetization/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          planId: selectedPlan.id,
          paymentMethod: 'CARD',
          autoRenew: true
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowSubscribeDialog(false);
        setSelectedPlan(null);
        setSelectedUserId('');
        fetchUserSubscriptions(selectedUserId);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'WALLET_PREMIUM':
        return <CreditCard className="h-6 w-6" />;
      case 'MARKETPLACE_PRO':
        return <Star className="h-6 w-6" />;
      case 'EDUCATION_PLUS':
        return <GraduationCap className="h-6 w-6" />;
      case 'ENTERPRISE':
        return <Building className="h-6 w-6" />;
      default:
        return <Crown className="h-6 w-6" />;
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'WALLET_PREMIUM':
        return 'from-blue-500 to-blue-600';
      case 'MARKETPLACE_PRO':
        return 'from-purple-500 to-purple-600';
      case 'EDUCATION_PLUS':
        return 'from-green-500 to-green-600';
      case 'ENTERPRISE':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Subscription Management</h2>
          <p className="text-muted-foreground">
            Manage subscription plans and user subscriptions
          </p>
        </div>
        <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
          <DialogTrigger asChild>
            <Button>
              <Crown className="h-4 w-4 mr-2" />
              New Subscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Subscription</DialogTitle>
              <DialogDescription>
                Subscribe a user to a plan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">User ID</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter user ID"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Select Plan</label>
                <Select value={selectedPlan?.id || ''} onValueChange={(value) => {
                  const plan = plans.find(p => p.id === value);
                  setSelectedPlan(plan || null);
                }}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select a subscription plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex items-center gap-2">
                          {getPlanIcon(plan.type)}
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(plan.price, plan.currency)}/{plan.billingCycle.toLowerCase()}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedPlan && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">{selectedPlan.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedPlan.description}</p>
                  <div className="space-y-1">
                    {JSON.parse(selectedPlan.features).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-3 w-3 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSubscribeDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubscribe} disabled={!selectedPlan || !selectedUserId}>
                  Subscribe User
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.isActive ? '' : 'opacity-50'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getPlanColor(plan.type)} text-white`}>
                  {getPlanIcon(plan.type)}
                </div>
                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(plan.price, plan.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per {plan.billingCycle.toLowerCase()}
                  </div>
                </div>
                <div className="space-y-2">
                  {JSON.parse(plan.features).slice(0, 3).map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-3 w-3 text-green-500" />
                      {feature}
                    </div>
                  ))}
                  {JSON.parse(plan.features).length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{JSON.parse(plan.features).length - 3} more features
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowSubscribeDialog(true);
                  }}
                >
                  Subscribe User
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Subscriptions */}
      {userSubscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Subscriptions
            </CardTitle>
            <CardDescription>
              Active subscriptions for user: {selectedUserId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userSubscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getPlanColor(subscription.plan.type)} text-white`}>
                      {getPlanIcon(subscription.plan.type)}
                    </div>
                    <div>
                      <p className="font-medium">{subscription.plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(subscription.plan.price, subscription.plan.currency)}/{subscription.plan.billingCycle.toLowerCase()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(subscription.startDate).toLocaleDateString()} - {
                            subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'Ongoing'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(subscription.plan.price, subscription.plan.currency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {subscription.autoRenew ? 'Auto-renewal ON' : 'Auto-renewal OFF'}
                    </div>
                    {subscription.nextBillingDate && (
                      <div className="text-xs text-muted-foreground">
                        Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}