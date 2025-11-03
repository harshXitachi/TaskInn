"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast.error("Invalid email or password. Please make sure you have already registered an account and try again.");
        setIsLoading(false);
        return;
      }

      toast.success("Login successful!");
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err) {
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        toast.error("Google sign-in failed. Please try again.");
        setIsGoogleLoading(false);
      }
    } catch (error) {
      toast.error("Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
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

          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-teal-400" />
              <h2 className="text-4xl xl:text-5xl font-medium text-white leading-tight">
                Welcome Back
                <br />
                to TaskInn
              </h2>
            </div>
            <p className="text-xl text-gray-300 max-w-md">
              Continue your journey to financial freedom. Access your dashboard, 
              track your earnings, and discover new opportunities.
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
                    className="h-12 w-12 rounded-full border-2 border-black overflow-hidden animate-scale-in"
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
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 animate-slide-up">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-medium text-black mb-2">
                  Sign In
                </h1>
                <p className="text-gray-600">
                  Access your dashboard and start earning
                </p>
              </div>

              {/* Google Sign In Button */}
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-full py-6 text-base font-medium shadow-sm hover:shadow-md transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                      disabled={isLoading || isGoogleLoading}
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
                      disabled={isLoading || isGoogleLoading}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="••••••••"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || isGoogleLoading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      disabled={isLoading || isGoogleLoading}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black focus:ring-2 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700">Remember me</span>
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full bg-black hover:bg-black/90 text-white rounded-full py-6 text-base font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">Don't have an account?</span>
                </div>
              </div>

              {/* Signup Link */}
              <Link
                href="/signup"
                className="block w-full text-center py-3 rounded-full border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}