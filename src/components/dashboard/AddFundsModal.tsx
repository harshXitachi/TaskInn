"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DollarSign, Wallet, Info, X } from "lucide-react";
import { toast } from "sonner";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  commissionRate?: number;
}

export default function AddFundsModal({
  isOpen,
  onClose,
  onSuccess,
  commissionRate: propCommissionRate,
}: AddFundsModalProps) {
  const [addFundsData, setAddFundsData] = useState({
    currencyType: "USD",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [commissionRate, setCommissionRate] = useState(propCommissionRate || 0.05);
  const [fetchingRate, setFetchingRate] = useState(false);

  // Fetch commission rate when modal opens
  useEffect(() => {
    if (isOpen && !propCommissionRate) {
      fetchCommissionRate();
    } else if (propCommissionRate) {
      setCommissionRate(propCommissionRate);
    }
  }, [isOpen, propCommissionRate]);

  const fetchCommissionRate = async () => {
    setFetchingRate(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCommissionRate(data[0].commissionRate || 0.05);
      }
    } catch (error) {
      console.error("Error fetching commission rate:", error);
      // Keep default rate on error
    } finally {
      setFetchingRate(false);
    }
  };

  if (!isOpen) return null;

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

    setLoading(true);

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
          // Check for PayPal account restriction error
          const errorMsg = data.error || "Failed to create PayPal payment";
          if (errorMsg.includes("PAYEE_ACCOUNT_RESTRICTED") || errorMsg.includes("UNPROCESSABLE_ENTITY")) {
            toast.error("PayPal account verification required. Please contact support or use USDT payment method.", {
              duration: 8000,
            });
          } else {
            toast.error(errorMsg);
          }
          setLoading(false);
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
          // Show payment details modal with QR code
          showCoinPaymentsModal(data);
          setLoading(false);
        } else {
          toast.error(data.error || "Failed to create USDT payment");
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error adding funds:", error);
      toast.error("An error occurred while adding funds");
      setLoading(false);
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
            ${paymentData.qrcodeUrl ? `<img src="${paymentData.qrcodeUrl}" alt="QR Code" class="mx-auto rounded-lg shadow-lg" />` : ''}
            <p class="text-sm text-gray-600 mt-2">Scan QR code with your wallet</p>
          </div>
          <div class="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <p class="text-sm font-medium text-amber-900">Amount: ₮${paymentData.amount}</p>
            <p class="text-xs text-amber-800 mt-1">Payment will be confirmed automatically</p>
          </div>
          ${paymentData.checkoutUrl ? `<a href="${paymentData.checkoutUrl}" target="_blank" class="block w-full px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all text-center">View Payment Details on CoinPayments</a>` : ''}
          <button onclick="this.closest('.fixed').remove()" class="w-full px-6 py-3 border-2 border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-all">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    onClose(); // Close the add funds modal
  };

  // Amount preview
  const depositAmount = parseFloat(addFundsData.amount) || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Add Funds</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleAddFunds} className="space-y-6">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Currency</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setAddFundsData({ ...addFundsData, currencyType: "USD" })
                }
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  addFundsData.currencyType === "USD"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign
                    className={
                      addFundsData.currencyType === "USD"
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }
                    size={20}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">USD</p>
                    <p className="text-xs text-gray-600">US Dollar</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setAddFundsData({ ...addFundsData, currencyType: "USDT_TRC20" })
                }
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  addFundsData.currencyType === "USDT_TRC20"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Wallet
                    className={
                      addFundsData.currencyType === "USDT_TRC20"
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
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <div className="relative">
              {addFundsData.currencyType === "USD" ? (
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
                min="5"
                value={addFundsData.amount}
                onChange={(e) =>
                  setAddFundsData({ ...addFundsData, amount: e.target.value })
                }
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Minimum amount: {addFundsData.currencyType === "USD" ? "$" : "₮"}5.00
            </p>
          </div>

          {/* Deposit Preview */}
          {depositAmount >= 5 && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-emerald-800 font-medium mb-3">
                <Info size={18} />
                <span>Deposit Amount</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-900 font-semibold">You will deposit:</span>
                <span className="font-bold text-emerald-600 text-2xl">
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
              disabled={loading || depositAmount < 5}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Funds"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}