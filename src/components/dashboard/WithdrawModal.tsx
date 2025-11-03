"use client";

import { useState } from "react";
import { DollarSign, Wallet, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usdBalance: number;
  usdtBalance: number;
}

export default function WithdrawModal({
  isOpen,
  onClose,
  onSuccess,
  usdBalance,
  usdtBalance,
}: WithdrawModalProps) {
  const [withdrawData, setWithdrawData] = useState({
    currencyType: "USD",
    amount: "",
    paypalEmail: "",
    usdtAddress: "",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(withdrawData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const maxBalance = withdrawData.currencyType === "USD" ? usdBalance : usdtBalance;
    if (amount > maxBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (amount < 10) {
      toast.error("Minimum withdrawal is $10 or ₮10");
      return;
    }

    if (withdrawData.currencyType === "USD" && !withdrawData.paypalEmail) {
      toast.error("Please enter your PayPal email");
      return;
    }

    if (withdrawData.currencyType === "USDT_TRC20" && !withdrawData.usdtAddress) {
      toast.error("Please enter your USDT TRC-20 address");
      return;
    }

    // Validate USDT address format
    if (withdrawData.currencyType === "USDT_TRC20") {
      if (!withdrawData.usdtAddress.startsWith("T") || withdrawData.usdtAddress.length !== 34) {
        toast.error("Invalid USDT TRC-20 address format");
        return;
      }
    }

    setLoading(true);

    try {
      if (withdrawData.currencyType === "USD") {
        // PayPal withdrawal
        const res = await fetch("/api/payments/paypal/withdraw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            paypalEmail: withdrawData.paypalEmail,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          toast.success("Withdrawal successful! Funds sent to your PayPal account.");
          setWithdrawData({
            currencyType: "USD",
            amount: "",
            paypalEmail: "",
            usdtAddress: "",
          });
          onSuccess();
          onClose();
        } else {
          toast.error(data.error || "Withdrawal failed");
        }
      } else {
        // CoinPayments withdrawal
        const res = await fetch("/api/payments/coinpayments/withdraw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            address: withdrawData.usdtAddress,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          toast.success(
            "Withdrawal request created! It will be processed manually for security.",
            { duration: 5000 }
          );
          setWithdrawData({
            currencyType: "USD",
            amount: "",
            paypalEmail: "",
            usdtAddress: "",
          });
          onSuccess();
          onClose();
        } else {
          toast.error(data.error || "Withdrawal failed");
        }
      }
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast.error("An error occurred while processing withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const withdrawAmount = parseFloat(withdrawData.amount) || 0;
  const maxBalance = withdrawData.currencyType === "USD" ? usdBalance : usdtBalance;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Withdraw Funds</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-6">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Currency</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setWithdrawData({ ...withdrawData, currencyType: "USD" })
                }
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  withdrawData.currencyType === "USD"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign
                    className={
                      withdrawData.currencyType === "USD"
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }
                    size={20}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">USD</p>
                    <p className="text-xs text-gray-600">via PayPal</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-700">
                  Balance: ${usdBalance.toFixed(2)}
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setWithdrawData({ ...withdrawData, currencyType: "USDT_TRC20" })
                }
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  withdrawData.currencyType === "USDT_TRC20"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Wallet
                    className={
                      withdrawData.currencyType === "USDT_TRC20"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                    size={20}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">USDT</p>
                    <p className="text-xs text-gray-600">TRC-20</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-700">
                  Balance: ₮{usdtBalance.toFixed(2)}
                </p>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <div className="relative">
              {withdrawData.currencyType === "USD" ? (
                <DollarSign
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
              ) : (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  ₮
                </span>
              )}
              <input
                type="number"
                step="0.01"
                min="10"
                max={maxBalance}
                value={withdrawData.amount}
                onChange={(e) =>
                  setWithdrawData({ ...withdrawData, amount: e.target.value })
                }
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Minimum: {withdrawData.currencyType === "USD" ? "$" : "₮"}10.00 • 
              Available: {withdrawData.currencyType === "USD" ? "$" : "₮"}{maxBalance.toFixed(2)}
            </p>
          </div>

          {/* PayPal Email */}
          {withdrawData.currencyType === "USD" && (
            <div>
              <label className="block text-sm font-medium mb-2">PayPal Email</label>
              <input
                type="email"
                value={withdrawData.paypalEmail}
                onChange={(e) =>
                  setWithdrawData({ ...withdrawData, paypalEmail: e.target.value })
                }
                placeholder="your@paypal.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                required
              />
            </div>
          )}

          {/* USDT Address */}
          {withdrawData.currencyType === "USDT_TRC20" && (
            <div>
              <label className="block text-sm font-medium mb-2">USDT TRC-20 Address</label>
              <input
                type="text"
                value={withdrawData.usdtAddress}
                onChange={(e) =>
                  setWithdrawData({ ...withdrawData, usdtAddress: e.target.value })
                }
                placeholder="TRC-20 address (starts with T)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-sm"
                required
              />
              <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  USDT withdrawals require manual approval for security. Processing may take 24-48 hours.
                </p>
              </div>
            </div>
          )}

          {/* Withdrawal Summary */}
          {withdrawAmount >= 10 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
              <div className="flex justify-between items-center">
                <span className="text-blue-900 font-semibold">You will receive:</span>
                <span className="font-bold text-blue-600 text-2xl">
                  {withdrawData.currencyType === "USD" ? "$" : "₮"}
                  {withdrawAmount.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                {withdrawData.currencyType === "USD"
                  ? "Funds will be sent to your PayPal account"
                  : "Funds will be sent to your TRC-20 address"}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || withdrawAmount < 10 || withdrawAmount > maxBalance}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                "Withdraw"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
