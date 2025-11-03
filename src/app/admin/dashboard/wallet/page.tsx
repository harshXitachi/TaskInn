"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, TrendingUp, DollarSign, Percent, Save, Download, AlertCircle, Check, X, Coins } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WalletStats {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingCommissions: number;
}

export default function AdminWalletPage() {
  const router = useRouter();
  const [usdWallet, setUsdWallet] = useState<WalletStats>({
    balance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    pendingCommissions: 0,
  });
  const [usdtWallet, setUsdtWallet] = useState<WalletStats>({
    balance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    pendingCommissions: 0,
  });
  const [commissionRate, setCommissionRate] = useState(5);
  const [newCommissionRate, setNewCommissionRate] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Withdrawal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawCurrency, setWithdrawCurrency] = useState<"USD" | "USDT_TRC20">("USD");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [paymentAddress, setPaymentAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawNotes, setWithdrawNotes] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (!session) {
      router.push("/admin");
      return;
    }

    loadWalletData();
  }, [router]);

  const loadWalletData = async () => {
    try {
      setLoadError(null);
      const token = localStorage.getItem("admin_bearer_token");
      
      if (!token) {
        setLoadError("Authentication token not found. Please log in again.");
        toast.error("Authentication token not found");
        setTimeout(() => router.push("/admin"), 2000);
        return;
      }
      
      // Fetch admin wallet stats (separate USD and USDT)
      const walletRes = await fetch("/api/admin/wallet/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!walletRes.ok) {
        const errorData = await walletRes.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Failed to fetch wallet stats (${walletRes.status})`);
      }
      
      const walletData = await walletRes.json();
      
      if (walletData.success && walletData.stats) {
        setUsdWallet(walletData.stats.usd);
        setUsdtWallet(walletData.stats.usdt);
      }

      // Fetch admin settings for commission rate
      const settingsRes = await fetch("/api/admin/settings");
      
      if (!settingsRes.ok) {
        throw new Error("Failed to fetch admin settings");
      }
      
      const settings = await settingsRes.json();
      const adminSettings = settings[0];

      if (adminSettings) {
        const rate = (adminSettings.commissionRate || 0.05) * 100;
        setCommissionRate(rate);
        setNewCommissionRate(rate);
      }
    } catch (error) {
      console.error("Failed to load wallet data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setLoadError(errorMessage);
      toast.error(`Failed to load wallet data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCommissionRate = async () => {
    if (newCommissionRate < 0 || newCommissionRate > 100) {
      toast.error("Commission rate must be between 0 and 100");
      return;
    }

    setIsSaving(true);

    try {
      const settingsRes = await fetch("/api/admin/settings");
      const settings = await settingsRes.json();
      const adminSettings = settings[0];

      const response = await fetch(`/api/admin/settings?id=${adminSettings.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commissionRate: newCommissionRate / 100,
        }),
      });

      if (!response.ok) throw new Error("Failed to update commission rate");

      toast.success("Commission rate updated successfully");
      setCommissionRate(newCommissionRate);
    } catch (error) {
      toast.error("Failed to update commission rate");
    } finally {
      setIsSaving(false);
    }
  };

  const openWithdrawModal = (currency: "USD" | "USDT_TRC20") => {
    setWithdrawCurrency(currency);
    setWithdrawAmount("");
    setPaymentAddress("");
    setBankName("");
    setAccountNumber("");
    setWithdrawNotes("");
    setShowWithdrawModal(true);
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    const currentWallet = withdrawCurrency === "USD" ? usdWallet : usdtWallet;
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount < 5) {
      toast.error("Minimum withdrawal amount is $5");
      return;
    }

    if (amount > currentWallet.balance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!paymentAddress.trim()) {
      toast.error("Please provide payment address/account details");
      return;
    }

    setIsWithdrawing(true);

    try {
      const token = localStorage.getItem("admin_bearer_token");
      const response = await fetch("/api/admin/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          currencyType: withdrawCurrency,
          paymentMethod,
          paymentAddress: paymentAddress.trim(),
          bankName: bankName.trim() || undefined,
          accountNumber: accountNumber.trim() || undefined,
          notes: withdrawNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Withdrawal failed");
      }

      toast.success(`Successfully withdrew ${withdrawCurrency === "USD" ? "$" : ""}${amount.toFixed(2)}${withdrawCurrency === "USDT_TRC20" ? " USDT" : ""}`);
      setShowWithdrawModal(false);
      loadWalletData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="backdrop-blur-xl bg-slate-800/50 border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Wallet</h2>
          <p className="text-slate-300 mb-6">{loadError}</p>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setIsLoading(true);
                setLoadError(null);
                loadWalletData();
              }}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl"
            >
              Retry
            </Button>
            <Button
              onClick={() => router.push("/admin")}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/modern-minimalist-logo-for-taskinn-a-pro-7f90acf1-20251031063352.jpg"
                alt="TaskInn Logo"
                width={120}
                height={40}
                className="h-8 w-auto brightness-0 invert"
              />
              <h1 className="text-xl font-semibold text-white">Admin Wallet</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Wallet Balance Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* USD Wallet */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">USD Wallet</h2>
                  <p className="text-sm text-emerald-300">Commission Balance</p>
                </div>
              </div>
              <button
                onClick={() => openWithdrawModal("USD")}
                disabled={usdWallet.balance === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Download className="h-4 w-4" />
                Withdraw
              </button>
            </div>
            <div className="text-5xl font-bold text-white mb-4">
              ${usdWallet.balance.toFixed(2)}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Total Earned:</span>
                <span className="font-semibold text-emerald-300">${usdWallet.totalEarned.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Withdrawn:</span>
                <span className="font-semibold">${usdWallet.totalWithdrawn.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* USDT Wallet */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <Coins className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">USDT Wallet</h2>
                  <p className="text-sm text-blue-300">TRC20 Commission</p>
                </div>
              </div>
              <button
                onClick={() => openWithdrawModal("USDT_TRC20")}
                disabled={usdtWallet.balance === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Download className="h-4 w-4" />
                Withdraw
              </button>
            </div>
            <div className="text-5xl font-bold text-white mb-4">
              {usdtWallet.balance.toFixed(2)} <span className="text-3xl text-blue-300">USDT</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Total Earned:</span>
                <span className="font-semibold text-blue-300">{usdtWallet.totalEarned.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Withdrawn:</span>
                <span className="font-semibold">{usdtWallet.totalWithdrawn.toFixed(2)} USDT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Rate Management */}
        <div className="backdrop-blur-xl bg-slate-800/50 border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Percent className="h-6 w-6 text-orange-400" />
            Commission Rate Management
          </h3>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Current Commission Rate</label>
                <div className="text-5xl font-bold text-white">{commissionRate}%</div>
                <p className="text-sm text-slate-400 mt-3">
                  Deducted from user withdrawals only (not from task payments)
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Update Commission Rate</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newCommissionRate}
                      onChange={(e) => setNewCommissionRate(parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                      placeholder="5.0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                  </div>
                  <Button
                    onClick={handleUpdateCommissionRate}
                    disabled={isSaving || newCommissionRate === commissionRate}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl px-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Update"}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Rate applies to all future user withdrawals
                </p>
              </div>
            </div>
          </div>

          {/* Commission Example */}
          <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
            <div className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              How Commission Works
            </div>
            <div className="text-slate-300 text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Worker completes task and receives <strong>$100</strong> in wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Worker requests withdrawal of <strong>$100</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>System deducts <strong>{newCommissionRate}%</strong> commission = <strong>${(100 * newCommissionRate / 100).toFixed(2)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Worker receives <strong className="text-emerald-400">${(100 - (100 * newCommissionRate / 100)).toFixed(2)}</strong> to their bank/wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-400" />
                <span>Admin earns <strong className="text-orange-400">${(100 * newCommissionRate / 100).toFixed(2)}</strong> commission</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="backdrop-blur-xl bg-slate-800 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Withdraw {withdrawCurrency === "USD" ? "USD" : "USDT"}</h2>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Available Balance
                </label>
                <div className="text-3xl font-bold text-emerald-400">
                  {withdrawCurrency === "USD" 
                    ? `$${usdWallet.balance.toFixed(2)}`
                    : `${usdtWallet.balance.toFixed(2)} USDT`
                  }
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  {withdrawCurrency === "USD" && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  )}
                  <input
                    type="number"
                    min="5"
                    max={withdrawCurrency === "USD" ? usdWallet.balance : usdtWallet.balance}
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full ${withdrawCurrency === "USD" ? "pl-8" : "pl-4"} pr-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none`}
                  />
                  {withdrawCurrency === "USDT_TRC20" && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">USDT</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">Minimum withdrawal: {withdrawCurrency === "USD" ? "$5.00" : "5.00 USDT"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                >
                  {withdrawCurrency === "USD" && (
                    <>
                      <option value="bank">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                    </>
                  )}
                  {withdrawCurrency === "USDT_TRC20" && (
                    <option value="crypto_wallet">TRC20 Wallet</option>
                  )}
                </select>
              </div>

              {paymentMethod === "bank" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g., Chase Bank"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account number"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {paymentMethod === "bank" ? "Additional Details" : paymentMethod === "paypal" ? "PayPal Email" : "Wallet Address"}
                </label>
                <input
                  type="text"
                  value={paymentAddress}
                  onChange={(e) => setPaymentAddress(e.target.value)}
                  placeholder={
                    paymentMethod === "bank" 
                      ? "Routing number, SWIFT, etc." 
                      : paymentMethod === "paypal"
                      ? "your@email.com"
                      : "TRC20 wallet address"
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={withdrawNotes}
                  onChange={(e) => setWithdrawNotes(e.target.value)}
                  placeholder="Add any notes..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none resize-none"
                />
              </div>

              <Button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? "Processing..." : "Confirm Withdrawal"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}