"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      // Store admin session data
      localStorage.setItem("admin_session", JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        commissionRate: data.commissionRate,
      }));

      // Store admin ID as ADMIN bearer token (separate from user tokens)
      localStorage.setItem("admin_bearer_token", data.id.toString());
      
      // Clear any regular user token to avoid conflicts
      localStorage.removeItem("bearer_token");

      toast.success("Admin login successful!");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(239,68,68,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Admin Badge */}
          <div className="flex justify-center mb-8">
            <div className="bg-red-500/10 border border-red-500/30 rounded-full px-6 py-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-400" />
              <span className="text-red-400 font-medium">Admin Access</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 sm:p-10">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/modern-minimalist-logo-design-for-taskin-143be8c6-20251031064733.jpg"
                alt="TaskInn Logo"
                width={150}
                height={60}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-medium text-white mb-2">
                Admin Panel
              </h1>
              <p className="text-gray-400">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-300">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="username"
                    type="text"
                    required
                    disabled={isLoading}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="admin"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full py-6 text-base font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Access Admin Panel"}
              </Button>
            </form>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>⚠️ Authorized personnel only</p>
            <p className="mt-2 text-xs text-gray-600">Default: username: admin, password: admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}