"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function PayPalReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processing your payment...");

  useEffect(() => {
    const token = searchParams.get("token");
    const PayerID = searchParams.get("PayerID");

    if (!token) {
      setStatus("error");
      setMessage("Payment was cancelled or invalid");
      setTimeout(() => router.push("/dashboard/employer"), 3000);
      return;
    }

    capturePayment(token);
  }, [searchParams, router]);

  const capturePayment = async (orderId: string) => {
    try {
      const res = await fetch("/api/payments/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(`Successfully deposited $${data.amount.toFixed(2)}!`);
        toast.success("Payment successful!");
        setTimeout(() => router.push("/dashboard/employer"), 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "Payment failed");
        toast.error("Payment failed");
        setTimeout(() => router.push("/dashboard/employer"), 3000);
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred processing your payment");
      toast.error("Payment processing error");
      setTimeout(() => router.push("/dashboard/employer"), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === "processing" && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => router.push("/dashboard/employer")}
              className="mt-6 px-6 py-3 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
