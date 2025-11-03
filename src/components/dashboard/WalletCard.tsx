"use client";

import { useEffect, useState } from "react";
import { Wallet, DollarSign, TrendingUp, ArrowUpRight, RefreshCw, Plus, ArrowDownLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AddFundsModal from "./AddFundsModal";
import WithdrawModal from "./WithdrawModal";

interface WalletBalance {
  id: number;
  userId: string;
  currencyType: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface WalletCardProps {
  userId: string;
  userRole?: string;
  onRefresh?: () => void;
}

export default function WalletCard({ userId, userRole, onRefresh }: WalletCardProps) {
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [commissionRate, setCommissionRate] = useState<number>(0.05);

  const fetchWallets = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      // Fetch commission rate
      const settingsRes = await fetch("/api/admin/settings");
      const settingsData = await settingsRes.json();
      if (Array.isArray(settingsData) && settingsData.length > 0) {
        setCommissionRate(settingsData[0].commissionRate || 0.05);
      }
      
      // Fetch wallets
      const res = await fetch(`/api/wallets?userId=${userId}`, {
        headers: { Authorization: `Bearer ${session?.access_token || ''}` },
      });

      if (res.ok) {
        const data = await res.json();
        setWallets(data);
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWallets();
    }
  }, [userId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWallets();
    onRefresh?.();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const usdWallet = wallets.find((w) => w.currencyType === "USD");
  const usdtWallet = wallets.find((w) => w.currencyType === "USDT_TRC20");

  const totalUsdValue = (usdWallet?.balance || 0) + (usdtWallet?.balance || 0);

  return (
    <div className="space-y-4">
      {/* Total Balance Overview */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 shadow-2xl text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Total Balance</p>
                <p className="text-xs text-white/60">All Wallets Combined</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {userRole === 'employer' ? (
                <button
                  onClick={() => setShowAddFunds(true)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all flex items-center gap-1"
                  title="Add Funds"
                >
                  <Plus size={20} />
                </button>
              ) : (
                <button
                  onClick={() => setShowWithdraw(true)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all flex items-center gap-1"
                  title="Withdraw"
                >
                  <ArrowDownLeft size={20} />
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  size={20}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-5xl font-bold mb-2">
              ${totalUsdValue.toFixed(2)}
            </p>
            <div className="flex items-center gap-2 text-white/90">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">Total Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* USD Wallet */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-emerald-300 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">USD Wallet</p>
                <p className="text-xs text-gray-500">PayPal Gateway</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
              💵 USD
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900">
              ${(usdWallet?.balance || 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Available Balance</p>
          </div>

          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <ArrowUpRight size={16} />
            <span>Via PayPal</span>
          </div>
        </div>

        {/* USDT Wallet */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">USDT Wallet</p>
                <p className="text-xs text-gray-500">TRC-20 Network</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
              🔐 USDT
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900">
              ₮{(usdtWallet?.balance || 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Available Balance</p>
          </div>

          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
            <ArrowUpRight size={16} />
            <span>Via CoinPayments</span>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="text-amber-600" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-1">Dual Currency Support</h4>
            <p className="text-sm text-amber-800">
              Accept payments in both USD (via PayPal) and USDT TRC-20 (via CoinPayments). Withdraw anytime with low fees.
            </p>
          </div>
        </div>
      </div>

      {/* Add Funds Modal - Only for Employers */}
      {userRole === 'employer' && (
        <AddFundsModal
          isOpen={showAddFunds}
          onClose={() => setShowAddFunds(false)}
          onSuccess={() => {
            fetchWallets(); // Refresh wallet data
            onRefresh?.(); // Call parent refresh if provided
          }}
          commissionRate={commissionRate}
        />
      )}

      {/* Withdraw Modal - Only for Workers */}
      {userRole === 'worker' && (
        <WithdrawModal
          isOpen={showWithdraw}
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => {
            fetchWallets(); // Refresh wallet data
            onRefresh?.(); // Call parent refresh if provided
          }}
          usdBalance={usdWallet?.balance || 0}
          usdtBalance={usdtWallet?.balance || 0}
        />
      )}
    </div>
  );
}
