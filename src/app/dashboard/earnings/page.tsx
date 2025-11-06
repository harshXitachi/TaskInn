"use client";

import { useState, useEffect } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { createClient } from "@/lib/supabase/client";
import {
  DollarSign, 
  Download,
  Wallet,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import WalletCard from "@/components/dashboard/WalletCard";

interface Transaction {
  id: number;
  type: string;
  amount: number;
  currencyType: string;
  status: string;
  description: string;
  createdAt: string;
}

export default function EarningsPage() {
  const { user } = useSupabaseUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "USDT_TRC20">("USD");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [commissionRate, setCommissionRate] = useState(0.05);
  const [rateLoading, setRateLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const userId = user?.id;

        if (!userId) return;

        // Fetch commission rate
        const settingsRes = await fetch("/api/admin/settings");
        const settingsData = await settingsRes.json();
        if (Array.isArray(settingsData) && settingsData.length > 0) {
          setCommissionRate(settingsData[0].commissionRate || 0.05);
        }

        // Fetch wallets
        const walletsRes = await fetch(`/api/wallets?userId=${userId}`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        if (walletsRes.ok) {
          const walletsData = await walletsRes.json();
          setWallets(walletsData);

          // Fetch transactions for all wallets
          const allTransactions: Transaction[] = [];
          for (const wallet of walletsData) {
            const transactionsRes = await fetch(`/api/wallets/transactions?walletId=${wallet.id}`, {
              headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            if (transactionsRes.ok) {
              const txData = await transactionsRes.json();
              allTransactions.push(...txData);
            }
          }
          // Sort by createdAt DESC
          allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTransactions(allTransactions);
        }
      } catch (error) {
        console.error("Error fetching earnings:", error);
        toast.error("Failed to fetch earnings data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const refreshCommissionRate = async () => {
    setRateLoading(true);
    try {
      const settingsRes = await fetch("/api/admin/settings");
      const settingsData = await settingsRes.json();
      if (Array.isArray(settingsData) && settingsData.length > 0) {
        setCommissionRate(settingsData[0].commissionRate || 0.05);
      }
    } catch (error) {
      console.error("Error refreshing commission rate:", error);
    } finally {
      setRateLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount < 5) {
      toast.error("Minimum withdrawal amount is $5 (or 5 USDT)");
      return;
    }

    const currentWallet = wallets.find(w => w.currencyType === selectedCurrency);
    if (!currentWallet || amount > currentWallet.balance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!paymentDetails.trim()) {
      toast.error(selectedCurrency === "USD" ? "Please enter your PayPal email" : "Please enter your USDT TRC-20 wallet address");
      return;
    }

    setWithdrawing(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch("/api/wallets/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          amount,
          currencyType: selectedCurrency,
          paymentMethod: selectedCurrency === "USD" ? "paypal" : "crypto_wallet",
          paymentAddress: paymentDetails,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const { amount: withdrawalAmount, commission, netAmount } = data.withdrawal;
        toast.success(
          `Withdrawal successful! Requested: ${selectedCurrency === "USD" ? "$" : "₮"}${withdrawalAmount.toFixed(2)} • Commission: ${selectedCurrency === "USD" ? "$" : "₮"}${commission.toFixed(2)} • You'll receive: ${selectedCurrency === "USD" ? "$" : "₮"}${netAmount.toFixed(2)}`,
          { duration: 6000 }
        );
        setWithdrawAmount("");
        setPaymentDetails("");
        
        // Refresh data
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to process withdrawal");
      }
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast.error("Failed to process withdrawal");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentWallet = wallets.find(w => w.currencyType === selectedCurrency);
  const withdrawalAmount = parseFloat(withdrawAmount) || 0;
  const commission = withdrawalAmount * commissionRate;
  const netAmount = withdrawalAmount - commission;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold mb-2">Earnings & Wallet</h1>
        <p className="text-gray-600">Manage your income and withdraw to USD or USDT</p>
      </div>

      {/* Wallet Card */}
      {user?.id && <WalletCard userId={user.id} />}

      {/* Withdrawal Form */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center">
              <Download className="text-emerald-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Request Withdrawal</h2>
              <p className="text-sm text-gray-600">Choose your preferred currency • Commission: {(commissionRate * 100).toFixed(0)}%</p>
            </div>
          </div>
          <button
            type="button"
            onClick={refreshCommissionRate}
            disabled={rateLoading}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh commission rate"
          >
            <RefreshCw
              size={20}
              className={`text-gray-600 ${rateLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        
        <form onSubmit={handleWithdraw} className="space-y-6">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">Select Currency</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedCurrency("USD")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedCurrency === "USD"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className={selectedCurrency === "USD" ? "text-emerald-600" : "text-gray-400"} size={24} />
                  <div>
                    <p className="font-semibold text-gray-900">USD (PayPal)</p>
                    <p className="text-xs text-gray-600">Withdraw via PayPal</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${wallets.find(w => w.currencyType === "USD")?.balance?.toFixed(2) || "0.00"}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCurrency("USDT_TRC20")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedCurrency === "USDT_TRC20"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className={selectedCurrency === "USDT_TRC20" ? "text-blue-600" : "text-gray-400"} size={24} />
                  <div>
                    <p className="font-semibold text-gray-900">USDT (TRC-20)</p>
                    <p className="text-xs text-gray-600">Withdraw via Crypto</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ₮{wallets.find(w => w.currencyType === "USDT_TRC20")?.balance?.toFixed(2) || "0.00"}
                </p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Amount</label>
              <div className="relative">
                {selectedCurrency === "USD" ? (
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                ) : (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₮</span>
                )}
                <input
                  type="number"
                  step="0.01"
                  min="5"
                  max={currentWallet?.balance || 0}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Available: <span className="font-semibold text-emerald-600">{selectedCurrency === "USD" ? "$" : "₮"}{currentWallet?.balance?.toFixed(2) || "0.00"}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {selectedCurrency === "USD" ? "PayPal Email" : "USDT TRC-20 Wallet Address"}
              </label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder={
                    selectedCurrency === "USD"
                      ? "your@email.com"
                      : "TRC-20 wallet address"
                  }
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Withdrawal Preview */}
          {withdrawalAmount >= 5 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-3">Withdrawal Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-amber-800">Withdrawal Amount:</span>
                      <span className="font-semibold text-gray-900">{selectedCurrency === "USD" ? "$" : "₮"}{withdrawalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-amber-200">
                      <span className="text-amber-800">Commission ({(commissionRate * 100).toFixed(0)}%):</span>
                      <span className="font-semibold text-red-600">-{selectedCurrency === "USD" ? "$" : "₮"}{commission.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 pt-3 border-t-2 border-amber-300">
                      <span className="text-amber-900 font-semibold">You will receive:</span>
                      <span className="font-bold text-emerald-600 text-xl">{selectedCurrency === "USD" ? "$" : "₮"}{netAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-amber-700 mt-3 italic">
                    {selectedCurrency === "USD" 
                      ? "💳 Payment will be sent to your PayPal account within 24-48 hours" 
                      : "🔐 USDT will be sent to your TRC-20 wallet within 1-3 hours"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={withdrawing || (currentWallet?.balance || 0) < 5}
            className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {withdrawing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download size={20} />
                Request Withdrawal
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Clock size={24} className="text-gray-700" />
          Payment History
        </h2>
        
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No payment history yet</p>
            <p className="text-gray-400 text-sm mt-1">Complete tasks to start earning!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-5 border-2 border-gray-100 rounded-xl hover:border-emerald-300 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    transaction.transactionType === "task_payment" ? "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600" : "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600"
                  }`}>
                    {transaction.transactionType === "task_payment" ? <CheckCircle size={20} /> : <Download size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {transaction.transactionType === "task_payment" ? "Task Payment" : "Withdrawal"}
                      </p>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {transaction.currencyType === "USD" ? "💵 USD" : "🔐 USDT"}
                      </span>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-gray-600 max-w-md line-clamp-1">{transaction.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    transaction.amount > 0 ? "text-emerald-600" : "text-blue-600"
                  }`}>
                    {transaction.amount > 0 ? "+" : ""}{transaction.currencyType === "USD" ? "$" : "₮"}{Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold mt-1 ${
                    transaction.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                    transaction.status === "pending" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {transaction.status === "completed" && <CheckCircle size={12} />}
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
