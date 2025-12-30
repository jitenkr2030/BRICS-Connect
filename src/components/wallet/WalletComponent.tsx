'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react'

interface WalletComponentProps {
  userId: string
}

interface Wallet {
  id: string
  currency: string
  balance: number
  change: number
}

export default function WalletComponent({ userId }: WalletComponentProps) {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock wallet data
    const mockWallets: Wallet[] = [
      { id: '1', currency: 'CBDC', balance: 50000.00, change: 2.5 },
      { id: '2', currency: 'CNY', balance: 35000.00, change: 1.2 },
      { id: '3', currency: 'INR', balance: 28430.50, change: -0.8 },
      { id: '4', currency: 'BRL', balance: 12000.00, change: 3.1 },
      { id: '5', currency: 'RUB', balance: 8500.00, change: 0.5 },
      { id: '6', currency: 'ZAR', balance: 6500.00, change: -1.2 }
    ]
    
    setWallets(mockWallets)
    setIsLoading(false)
  }, [userId])

  const getTotalBalance = () => {
    return wallets.reduce((total, wallet) => total + wallet.balance, 0)
  }

  const getCurrencyInfo = (code: string) => {
    const currencies: Record<string, { name: string; symbol: string; color: string }> = {
      'CBDC': { name: 'Digital Currency', symbol: '₿', color: 'from-yellow-500 to-orange-500' },
      'CNY': { name: 'Chinese Yuan', symbol: '¥', color: 'from-red-500 to-pink-500' },
      'INR': { name: 'Indian Rupee', symbol: '₹', color: 'from-green-500 to-emerald-500' },
      'BRL': { name: 'Brazilian Real', symbol: 'R$', color: 'from-blue-500 to-cyan-500' },
      'RUB': { name: 'Russian Ruble', symbol: '₽', color: 'from-purple-500 to-indigo-500' },
      'ZAR': { name: 'South African Rand', symbol: 'R', color: 'from-teal-500 to-green-500' }
    }
    return currencies[code] || currencies['CBDC']
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading wallet data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Total Balance Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Total Balance</CardTitle>
          <CardDescription className="text-blue-100">
            Across all BRICS currencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-4">
            ${getTotalBalance().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white">
              {wallets.length} Currencies
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              BRICS Network
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Currency Wallets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => {
          const currencyInfo = getCurrencyInfo(wallet.currency)
          return (
            <Card key={wallet.id} className="overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${currencyInfo.color}`}></div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 bg-gradient-to-r ${currencyInfo.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-white font-bold text-xs">{wallet.currency}</span>
                    </div>
                    <div>
                      <CardTitle className="text-sm">{wallet.currency}</CardTitle>
                      <CardDescription>{currencyInfo.name}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={wallet.change >= 0 ? "default" : "secondary"}>
                    {wallet.change >= 0 ? '+' : ''}{wallet.change}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold">{wallet.balance.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">
                      ${(wallet.balance * 0.14).toLocaleString()} USD
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      Send
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                      Receive
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <CreditCard className="w-4 h-4 mr-1" />
                      Card
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <ArrowUpRight className="w-6 h-6 mb-2" />
              <span className="text-sm">Send Money</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <ArrowDownRight className="w-6 h-6 mb-2" />
              <span className="text-sm">Receive Money</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <CreditCard className="w-6 h-6 mb-2" />
              <span className="text-sm">Create QR Code</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="w-6 h-6 mb-2" />
              <span className="text-sm">Exchange Currency</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}