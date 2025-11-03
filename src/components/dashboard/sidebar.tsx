"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  DollarSign, 
  Star,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SidebarProps {
  userRole: "worker" | "employer" | "admin";
}

const workerLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Available Tasks", icon: Briefcase },
  { href: "/dashboard/submissions", label: "My Submissions", icon: CheckSquare },
  { href: "/dashboard/earnings", label: "Earnings", icon: DollarSign },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
];

const employerLinks = [
  { href: "/dashboard/employer", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/employer/tasks", label: "My Tasks", icon: Briefcase },
  { href: "/dashboard/employer/submissions", label: "Submissions", icon: CheckSquare },
  { href: "/dashboard/employer/payments", label: "Payments", icon: DollarSign },
  { href: "/dashboard/employer/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/employer/profile", label: "Profile", icon: Settings },
];

const adminLinks = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/tasks", label: "All Tasks", icon: Briefcase },
  { href: "/dashboard/admin/disputes", label: "Disputes", icon: FileText },
  { href: "/dashboard/admin/payments", label: "Payments", icon: DollarSign },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const links = userRole === "admin" ? adminLinks : userRole === "employer" ? employerLinks : workerLinks;

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      router.push("/");
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 z-40 transition-all duration-300 shadow-xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-72"} w-72`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between">
            <Link href="/" className={`flex items-center gap-3 group ${isCollapsed ? "justify-center" : ""}`}>
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/clean-minimalist-logo-design-for-taskinn-26461290-20251031101916.jpg"
                  alt="TaskInn Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              {!isCollapsed && (
                <div>
                  <span className="text-xl font-bold text-gray-900">TaskInn</span>
                  <p className="text-xs text-gray-500 capitalize">{userRole} Dashboard</p>
                </div>
              )}
            </Link>
            {/* Desktop Collapse Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-all"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium group relative ${
                    isActive
                      ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? link.label : ""}
                >
                  <Icon size={20} className={isActive ? "text-white" : "text-gray-600 group-hover:text-gray-900"} />
                  {!isCollapsed && <span>{link.label}</span>}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {link.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out Button */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              onClick={handleSignOut}
              className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 hover:shadow-md transition-all font-medium group relative ${
                isCollapsed ? "justify-center" : ""
              }`}
              title={isCollapsed ? "Sign Out" : ""}
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              {!isCollapsed && <span>Sign Out</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  Sign Out
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
        />
      )}
    </>
  );
}