"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Mail, Lock, User, Sparkles, Briefcase, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "worker" as "worker" | "employer",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
          },
        },
      });

      if (error) {
        const errorMessage = error.message.includes("already registered")
          ? "Email already registered. Please use a different email or login."
          : "Registration failed. Please try again.";
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-40"
        >
          <source
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_videos/smooth-abstract-digital-particles-flowin-89da2e10-20251030164323.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-900/30 to-teal-900/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="inline-flex">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/icons/68a413987ca3efce6f38eec6_Logo-1.png"
              alt="TaskInn Logo"
              width={120}
              height={40}
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>

          <div className="space-y-6 opacity-0 translate-y-5 animate-[fadeIn_0.8s_ease-out_forwards]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-teal-400" />
              <h2 className="text-4xl xl:text-5xl font-medium text-white leading-tight">
                Start Earning
                <br />
                On Your Terms
              </h2>
            </div>
            <p className="text-xl text-gray-300 max-w-md">
              Join thousands of workers earning money through simple micro-tasks. 
              Flexible hours, instant payments, unlimited opportunities.
            </p>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[
                  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a71d7fa79008ec6716ac73_Modern_20man_20portrait_2-10.avif",
                  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a71d7fa80bb87671d03416_Dreamy_20Portrait_20of_20-11.avif",
                  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a71d7fa80bb87671d03408_Contemplative_20Woman_20i-12.avif",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="h-12 w-12 rounded-full border-2 border-black overflow-hidden opacity-0 scale-80 animate-[scaleIn_0.5s_ease-out_forwards]"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <Image
                      src={src}
                      alt={`User ${i + 1}`}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-white">
                <div className="font-semibold">9,200+ Active Workers</div>
                <div className="text-sm text-gray-400">Earning daily</div>
              </div>
            </div>
          </div>

          <div className="text-gray-400 text-sm">
            © 2025 TaskInn. All rights reserved.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <Link href="/" className="inline-flex lg:hidden mb-8">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/icons/68a413987ca3efce6f38eec6_Logo-1.png"
                alt="TaskInn Logo"
                width={120}
                height={40}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>

            {/* Form Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 opacity-0 translate-y-10 animate-[slideUp_0.6s_ease-out_forwards]">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-medium text-black mb-2">
                  Create Account
                </h1>
                <p className="text-gray-600">
                  Start your journey to financial freedom
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    I want to join as
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "worker" })}
                      disabled={isLoading}
                      className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        formData.role === "worker"
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <UserCheck className="h-6 w-6" />
                      <span className="text-sm font-medium">Worker</span>
                      <span className="text-xs opacity-70">Complete tasks</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "employer" })}
                      disabled={isLoading}
                      className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        formData.role === "employer"
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Briefcase className="h-6 w-6" />
                      <span className="text-sm font-medium">Employer</span>
                      <span className="text-xs opacity-70">Post tasks</span>
                    </button>
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      required
                      disabled={isLoading}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      disabled={isLoading}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
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
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="••••••••"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      disabled={isLoading}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="••••••••"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black hover:bg-black/90 text-white rounded-full py-6 text-base font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">Already have an account?</span>
                </div>
              </div>

              {/* Login Link */}
              <Link
                href="/login"
                className="block w-full text-center py-3 rounded-full border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}