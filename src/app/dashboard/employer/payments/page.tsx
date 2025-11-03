"use client";

import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  Wallet,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Check,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface Wallet {
  id: number;
  userId: string;
  currencyType: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: number;
  walletId: number;
  transactionType: string;
  amount: number;
  currencyType: string;
  status: string;
  referenceId: string | null;
  description: string;
  createdAt: string;
}

export default function EmployerPaymentsPage() {
  const { user } = useSupabaseUser();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addFundsData, setAddFundsData] = useState({
    currencyType: "USD",
    amount: "",
  });
  const [commissionRate, setCommissionRate] = useState(0.05); // Default 5%

  // Fetch commission rate
  const fetchCommissionRate = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${session?.access_token || ''}` },
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCommissionRate(data[0].commissionRate || 0.05);
      }
    } catch (error) {
      console.error("Error fetching commission rate:", error);
    }
  };

  const fetchWallets = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = user?.id;

      if (!userId) return;

      const res = await fetch(`/api/wallets?userId=${userId}`, {
        headers: { Authorization: `Bearer ${session?.access_token || ''}` },
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        setWallets(data);

        // Fetch transactions for first wallet
        if (data.length > 0) {
          const txRes = await fetch(`/api/wallets/transactions?walletId=${data[0].id}`, {
            headers: { Authorization: `Bearer ${session?.access_token || ''}` },
          });
          const txData = await txRes.json();
          if (Array.isArray(txData)) {
            setTransactions(txData);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCommissionRate();
      fetchWallets();
    }
  }, [user]);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(addFundsData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount < 5) {
      toast.error("Minimum amount is $5");
      return;
    }

    try {
      if (addFundsData.currencyType === "USD") {
        // PayPal deposit
        const res = await fetch("/api/payments/paypal/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });

        const data = await res.json();

        if (res.ok && data.success && data.approvalUrl) {
          // Redirect to PayPal for payment
          window.location.href = data.approvalUrl;
        } else {
          toast.error(data.error || "Failed to create PayPal payment");
        }
      } else {
        // CoinPayments deposit (USDT TRC-20)
        const res = await fetch("/api/payments/coinpayments/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // Show payment details modal
          showCoinPaymentsModal(data);
        } else {
          toast.error(data.error || "Failed to create USDT payment");
        }
      }
    } catch (error) {
      console.error("Error adding funds:", error);
      toast.error("An error occurred");
    }
  };

  const showCoinPaymentsModal = (paymentData: any) => {
    // Create a modal with QR code and payment address
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4";
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-2xl font-bold mb-4">Complete USDT Payment</h3>
        <div class="space-y-4">
          <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p class="text-sm font-medium text-blue-900 mb-2">Send USDT TRC-20 to:</p>
            <p class="font-mono text-sm break-all bg-white p-3 rounded-lg border border-blue-200">${paymentData.address}</p>
          </div>
          <div class="text-center">
            <img src="${paymentData.qrcodeUrl}" alt="QR Code" class="mx-auto rounded-lg shadow-lg" />
            <p class="text-sm text-gray-600 mt-2">Scan QR code with your wallet</p>
          </div>
          <div class="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <p class="text-sm font-medium text-amber-900">Amount: ₮${paymentData.amount}</p>
            <p class="text-xs text-amber-800 mt-1">Payment will be confirmed automatically</p>
          </div>
          <a href="${paymentData.checkoutUrl}" target="_blank" class="block w-full px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all text-center">
            View Payment Details on CoinPayments
          </a>
          <button onclick="this.closest('.fixed').remove()" class="w-full px-6 py-3 border-2 border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-all">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    setShowAddFunds(false); // Close the add funds modal
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Amount preview
  const depositAmount = parseFloat(addFundsData.amount) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Wallet & Payments</h1>
          <p className="text-gray-600 mt-2">Manage your funds and view transaction history</p>
        </div>
        <button
          onClick={() => setShowAddFunds(true)}
          className="px-6 py-3 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Funds
        </button>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className={`rounded-2xl p-8 shadow-lg text-white ${
              wallet.currencyType === "USD"
                ? "bg-gradient-to-br from-blue-600 to-blue-700"
                : "bg-gradient-to-br from-teal-600 to-teal-700"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-90">
                    {wallet.currencyType === "USD" ? "USD Wallet" : "USDT TRC20"}
                  </p>
                  <p className="text-xs opacity-75">
                    ID: {wallet.id}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm opacity-90 mb-1">Available Balance</p>
              <p className="text-4xl font-bold">
                {wallet.currencyType === "USD" ? "$" : ""}
                {wallet.balance.toFixed(2)}
                {wallet.currencyType === "USDT_TRC20" ? " USDT" : ""}
              </p>
            </div>
          </div>
        ))}

        {wallets.length === 0 && (
          <div className="col-span-2 bg-white rounded-2xl p-12 text-center">
            <Wallet size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Wallets Found</h3>
            <p className="text-gray-600 mb-6">Add funds to create your first wallet</p>
            <button
              onClick={() => setShowAddFunds(true)}
              className="px-6 py-3 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              Add Funds
            </button>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Transaction History</h2>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-black transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      tx.amount > 0
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <ArrowDownRight size={24} />
                    ) : (
                      <ArrowUpRight size={24} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{tx.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-lg font-semibold ${
                      tx.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.currencyType === "USD" ? "$" : ""}
                    {Math.abs(tx.amount).toFixed(2)}
                    {tx.currencyType === "USDT_TRC20" ? " USDT" : ""}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Check size={14} />
                    <span className="capitalize">{tx.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-6">Add Funds</h2>

            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select
                  value={addFundsData.currencyType}
                  onChange={(e) =>
                    setAddFundsData({ ...addFundsData, currencyType: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5"
                >
                  <option value="USD">USD</option>
                  <option value="USDT_TRC20">USDT TRC20</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={addFundsData.amount}
                  onChange={(e) =>
                    setAddFundsData({ ...addFundsData, amount: e.target.value })
                  }
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5"
                  required
                />
              </div>

              {/* Deposit Preview */}
              {depositAmount >= 5 && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-medium mb-2">
                    <Info size={18} />
                    <span>Deposit Amount</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-900 font-semibold">You will deposit:</span>
                    <span className="font-bold text-emerald-600 text-xl">
                      {addFundsData.currencyType === "USD" ? "$" : "₮"}
                      {depositAmount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-2">
                    {addFundsData.currencyType === "USD" 
                      ? "Payment via PayPal" 
                      : "Payment via USDT TRC-20"}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all"
                >
                  Add Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
