'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Calculator,
  DollarSign,
  Percent,
  TrendingUp,
  CreditCard,
  ShoppingCart,
  BookOpen
} from 'lucide-react';

interface FeeConfiguration {
  id: string;
  name: string;
  type: string;
  feeType: string;
  feeValue: number;
  minFee?: number;
  maxFee?: number;
  currency: string;
  conditions?: string;
  isActive: boolean;
  appliesTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface FeeCalculation {
  baseAmount: number;
  feeAmount: number;
  feeRate: number;
  currency: string;
  totalAmount: number;
  feeConfig: {
    name: string;
    type: string;
    minFee?: number;
    maxFee?: number;
  };
}

export default function FeeManagement() {
  const [feeConfigurations, setFeeConfigurations] = useState<FeeConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculationResult, setCalculationResult] = useState<FeeCalculation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'TRANSACTION_FEE',
    feeType: 'PERCENTAGE',
    feeValue: 0,
    minFee: 0,
    maxFee: 0,
    currency: 'USD',
    conditions: '',
    isActive: true,
    appliesTo: ''
  });

  const [calculatorData, setCalculatorData] = useState({
    amount: 0,
    currency: 'USD',
    transactionType: 'PAYMENT',
    userType: 'STANDARD'
  });

  useEffect(() => {
    fetchFeeConfigurations();
  }, []);

  const fetchFeeConfigurations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monetization/fees');
      const result = await response.json();
      
      if (result.success) {
        setFeeConfigurations(result.data);
      }
    } catch (error) {
      console.error('Error fetching fee configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFee = async () => {
    try {
      const response = await fetch('/api/monetization/fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowCreateDialog(false);
        fetchFeeConfigurations();
        // Reset form
        setFormData({
          name: '',
          type: 'TRANSACTION_FEE',
          feeType: 'PERCENTAGE',
          feeValue: 0,
          minFee: 0,
          maxFee: 0,
          currency: 'USD',
          conditions: '',
          isActive: true,
          appliesTo: ''
        });
      }
    } catch (error) {
      console.error('Error creating fee configuration:', error);
    }
  };

  const handleCalculateFee = async () => {
    try {
      const response = await fetch('/api/monetization/transaction-fees/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calculatorData),
      });

      const result = await response.json();
      
      if (result.success) {
        setCalculationResult(result.data);
      }
    } catch (error) {
      console.error('Error calculating fee:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getFeeTypeIcon = (type: string) => {
    switch (type) {
      case 'TRANSACTION_FEE':
        return <CreditCard className="h-4 w-4" />;
      case 'MARKETPLACE_COMMISSION':
        return <ShoppingCart className="h-4 w-4" />;
      case 'COURSE_PLATFORM_FEE':
        return <BookOpen className="h-4 w-4" />;
      case 'CURRENCY_CONVERSION':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getFeeTypeColor = (type: string) => {
    switch (type) {
      case 'TRANSACTION_FEE':
        return 'bg-blue-100 text-blue-800';
      case 'MARKETPLACE_COMMISSION':
        return 'bg-green-100 text-green-800';
      case 'COURSE_PLATFORM_FEE':
        return 'bg-purple-100 text-purple-800';
      case 'CURRENCY_CONVERSION':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
          <h2 className="text-3xl font-bold">Fee Management</h2>
          <p className="text-muted-foreground">
            Configure and manage fee structures for all platform services
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                Fee Calculator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Calculate Transaction Fee</DialogTitle>
                <DialogDescription>
                  Calculate fees for different transaction scenarios
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={calculatorData.amount}
                    onChange={(e) => setCalculatorData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={calculatorData.currency} onValueChange={(value) => setCalculatorData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="BRL">BRL</SelectItem>
                      <SelectItem value="RUB">RUB</SelectItem>
                      <SelectItem value="ZAR">ZAR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transactionType">Transaction Type</Label>
                  <Select value={calculatorData.transactionType} onValueChange={(value) => setCalculatorData(prev => ({ ...prev, transactionType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAYMENT">Payment</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                      <SelectItem value="CONVERSION">Currency Conversion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="userType">User Type</Label>
                  <Select value={calculatorData.userType} onValueChange={(value) => setCalculatorData(prev => ({ ...prev, userType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCalculateFee} className="w-full">
                  Calculate Fee
                </Button>
                {calculationResult && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Calculation Result</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Amount:</span>
                        <span>{formatCurrency(calculationResult.baseAmount, calculationResult.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fee Amount:</span>
                        <span>{formatCurrency(calculationResult.feeAmount, calculationResult.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span>{formatCurrency(calculationResult.totalAmount, calculationResult.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fee Rate:</span>
                        <span>{calculationResult.feeRate}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Fee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Fee Configuration</DialogTitle>
                <DialogDescription>
                  Add a new fee configuration for the platform
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter fee name"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRANSACTION_FEE">Transaction Fee</SelectItem>
                      <SelectItem value="MARKETPLACE_COMMISSION">Marketplace Commission</SelectItem>
                      <SelectItem value="COURSE_PLATFORM_FEE">Course Platform Fee</SelectItem>
                      <SelectItem value="CURRENCY_CONVERSION">Currency Conversion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="feeType">Fee Type</Label>
                  <Select value={formData.feeType} onValueChange={(value) => setFormData(prev => ({ ...prev, feeType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee calculation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount</SelectItem>
                      <SelectItem value="TIERED">Tiered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="feeValue">Fee Value</Label>
                  <Input
                    id="feeValue"
                    type="number"
                    value={formData.feeValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, feeValue: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter fee value"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minFee">Minimum Fee</Label>
                    <Input
                      id="minFee"
                      type="number"
                      value={formData.minFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, minFee: parseFloat(e.target.value) || 0 }))}
                      placeholder="Min fee"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxFee">Maximum Fee</Label>
                    <Input
                      id="maxFee"
                      type="number"
                      value={formData.maxFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxFee: parseFloat(e.target.value) || 0 }))}
                      placeholder="Max fee"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="appliesTo">Applies To</Label>
                  <Select value={formData.appliesTo} onValueChange={(value) => setFormData(prev => ({ ...prev, appliesTo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select who this applies to" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Users</SelectItem>
                      <SelectItem value="STANDARD">Standard Users</SelectItem>
                      <SelectItem value="PREMIUM">Premium Users</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFee}>
                    Create Fee
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Fee Configurations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feeConfigurations.map((fee) => (
          <Card key={fee.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFeeTypeIcon(fee.type)}
                  <CardTitle className="text-lg">{fee.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getFeeTypeColor(fee.type)}>
                    {fee.type.replace('_', ' ')}
                  </Badge>
                  <Badge variant={fee.isActive ? 'default' : 'secondary'}>
                    {fee.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                {fee.feeType === 'PERCENTAGE' && (
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    {fee.feeValue}% fee
                  </span>
                )}
                {fee.feeType === 'FIXED' && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(fee.feeValue, fee.currency)} fixed fee
                  </span>
                )}
                {fee.feeType === 'TIERED' && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Tiered fee structure
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fee.minFee && fee.minFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Min Fee:</span>
                    <span>{formatCurrency(fee.minFee, fee.currency)}</span>
                  </div>
                )}
                {fee.maxFee && fee.maxFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Max Fee:</span>
                    <span>{formatCurrency(fee.maxFee, fee.currency)}</span>
                  </div>
                )}
                {fee.appliesTo && (
                  <div className="flex justify-between text-sm">
                    <span>Applies To:</span>
                    <span>{fee.appliesTo}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Created:</span>
                  <span>{new Date(fee.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}