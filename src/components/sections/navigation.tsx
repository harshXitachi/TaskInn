"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Features", href: "#feature" },
  { name: "Pricing", href: "#pricing" },
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      setShowUserMenu(false);
      router.push("/");
    }
  };

  const getDashboardLink = () => {
    const role = user?.user_metadata?.role;
    if (role === "admin") return "/dashboard/admin";
    if (role === "employer") return "/dashboard/employer";
    return "/dashboard";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center">
      <div
        className={`
          flex items-center justify-between
          backdrop-blur-[12px] bg-white/90 rounded-full
          transition-all duration-300 ease-in-out
          w-[calc(100%-2rem)] sm:w-auto
          px-3 lg:px-3 py-2
          ${
            isScrolled
              ? "mt-2 shadow-[0_1px_20px_0_rgba(224,215,198,0.5)] border border-transparent"
              : "mt-6 shadow-none border border-transparent"
          }`}
      >
        <Link href="/" className="flex-shrink-0 ml-1">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/icons/68a413987ca3efce6f38eec6_Logo-1.png"
            alt="TaskInn Logo"
            width={106.5}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>
        <nav className="hidden lg:flex items-center bg-[rgba(255,255,255,0.08)] rounded-full p-1 mx-4 space-x-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3 py-1 text-base font-normal text-black rounded-full transition-colors hover:text-primary"
            >
              {link.name}
            </a>
          ))}
        </nav>
        
        <div className="hidden lg:flex items-center gap-2">
          {!loading && !user ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-base font-medium text-black rounded-full transition-colors hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="group relative flex items-center bg-black text-white rounded-full py-2 pl-4 pr-2 text-base font-medium shadow-[0_5px_16px_0_rgba(0,0,0,0.2)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <span>Get started</span>
                <span className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-white relative overflow-hidden">
                  <span className="text-black block transition-transform duration-300 ease-in-out group-hover:-translate-x-full">
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </span>
                  <span className="text-black absolute block transition-transform duration-300 ease-in-out translate-x-full group-hover:translate-x-0">
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </span>
                </span>
              </Link>
            </>
          ) : user ? (
            <div className="relative user-menu-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.user_metadata?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium">{user.user_metadata?.name || user.email}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium">{user.user_metadata?.name || user.email}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-500 capitalize mt-1">
                      {user.user_metadata?.role || "worker"}
                    </p>
                  </div>
                  
                  <Link
                    href={getDashboardLink()}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <LayoutDashboard size={18} />
                    <span className="text-sm font-medium">Dashboard</span>
                  </Link>
                  
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <User size={18} />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>
                  
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-2 w-full hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="lg:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-background border-l-0 p-6 w-[85vw] max-w-sm"
            >
              <div className="flex justify-end mb-8">
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="h-6 w-6" />
                  </Button>
                </SheetClose>
              </div>
              
              {user && (
                <div className="mb-6 p-4 bg-gray-100 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user.user_metadata?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.user_metadata?.name || user.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.user_metadata?.role || "worker"}</p>
                    </div>
                  </div>
                </div>
              )}

              <nav className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.name}>
                    <a
                      href={link.href}
                      className="text-2xl font-medium text-foreground transition-colors hover:text-muted-foreground py-2"
                    >
                      {link.name}
                    </a>
                  </SheetClose>
                ))}
                
                {!loading && !user ? (
                  <>
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="text-2xl font-medium text-foreground transition-colors hover:text-muted-foreground py-2"
                      >
                        Login
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/signup"
                        className="text-2xl font-medium text-foreground transition-colors hover:text-muted-foreground py-2"
                      >
                        Get started
                      </Link>
                    </SheetClose>
                  </>
                ) : user ? (
                  <>
                    <SheetClose asChild>
                      <Link
                        href={getDashboardLink()}
                        className="text-2xl font-medium text-foreground transition-colors hover:text-muted-foreground py-2"
                      >
                        Dashboard
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/dashboard/profile"
                        className="text-2xl font-medium text-foreground transition-colors hover:text-muted-foreground py-2"
                      >
                        Profile
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={handleSignOut}
                        className="text-2xl font-medium text-red-600 transition-colors hover:text-red-700 py-2 text-left"
                      >
                        Sign Out
                      </button>
                    </SheetClose>
                  </>
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}