"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  DollarSign,
  TrendingUp,
  Briefcase,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  Activity,
  Wallet,
  BarChart3,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<any>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    totalEmployers: 0,
    totalTasks: 0,
    activeTasks: 0,
    totalEarnings: 0,
    adminWallet: 0,
    commissionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check admin session
    const session = localStorage.getItem("admin_session");
    if (!session) {
      router.push("/admin");
      return;
    }

    setAdminSession(JSON.parse(session));
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      // Fetch users stats
      const usersRes = await fetch("/api/users");
      const users = await usersRes.json();
      
      const workers = users.filter((u: any) => u.role === "worker").length;
      const employers = users.filter((u: any) => u.role === "employer").length;

      // Fetch tasks stats
      const tasksRes = await fetch("/api/tasks");
      const tasksPayload = await tasksRes.json();
      const tasksList = Array.isArray(tasksPayload) ? tasksPayload : tasksPayload?.data ?? [];
      const activeTasks = tasksList.filter((t: any) => t.status === "open").length;

      // Fetch admin settings
      const settingsRes = await fetch("/api/admin/settings");
      const settings = await settingsRes.json();
      const adminSettings = settings[0];

      // Fetch admin wallet stats (real earnings and balances)
      const adminToken = localStorage.getItem("admin_bearer_token");
      let walletStatsUSD = { balance: 0, totalEarned: 0 } as any;
      let walletStatsUSDT = { balance: 0, totalEarned: 0 } as any;
      try {
        const walletRes = await fetch("/api/admin/wallet/stats", {
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
        });
        if (walletRes.ok) {
          const walletJson = await walletRes.json();
          walletStatsUSD = walletJson?.stats?.usd ?? walletStatsUSD;
          walletStatsUSDT = walletJson?.stats?.usdt ?? walletStatsUSDT;
        }
      } catch (e) {
        // ignore wallet fetch failure and keep defaults
      }

      // Calculate platform totals from admin wallets
      const totalEarnings = Number((walletStatsUSD.totalEarned + walletStatsUSDT.totalEarned).toFixed(2));
      const adminWalletBalance = Number((walletStatsUSD.balance + walletStatsUSDT.balance).toFixed(2));

      setStats({
        totalUsers: users.length,
        totalWorkers: workers,
        totalEmployers: employers,
        totalTasks: tasksList.length,
        activeTasks,
        totalEarnings,
        adminWallet: adminWalletBalance,
        commissionRate: (adminSettings?.commissionRate || 0) * 100,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    router.push("/admin");
  };

  if (!adminSession || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/admin/dashboard/analytics",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: UserCog,
      label: "User Management",
      href: "/admin/dashboard/users",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Wallet,
      label: "Admin Wallet",
      href: "/admin/dashboard/wallet",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/admin/dashboard/settings",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const statCards = [
    { 
      icon: Users, 
      label: "Total Users", 
      value: stats.totalUsers, 
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/5"
    },
    { 
      icon: Briefcase, 
      label: "Active Tasks", 
      value: stats.activeTasks, 
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-500/10 to-purple-600/5"
    },
    { 
      icon: DollarSign, 
      label: "Total Earnings", 
      value: `$${stats.totalEarnings.toFixed(2)}`, 
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-500/10 to-emerald-600/5"
    },
    { 
      icon: Wallet, 
      label: "Admin Wallet", 
      value: `$${stats.adminWallet.toFixed(2)}`, 
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-500/10 to-orange-600/5"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-slate-900/80 border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/modern-minimalist-logo-for-taskinn-a-pro-7f90acf1-20251031063352.jpg"
                alt="TaskInn Logo"
                width={120}
                height={40}
                className="h-8 w-auto brightness-0 invert"
              />
              <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg">
                <Shield className="h-4 w-4 text-white" />
                <span className="text-white text-sm font-semibold">Admin</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-slate-300 text-sm">
                Welcome, <span className="font-semibold text-white">{adminSession.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-lg">Manage your TaskInn platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`backdrop-blur-xl bg-gradient-to-br ${stat.bgGradient} border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all hover:-translate-y-1 shadow-xl`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-slate-800/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">User Breakdown</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-slate-300">Workers</span>
                <span className="text-white font-semibold">{stats.totalWorkers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-slate-300">Employers</span>
                <span className="text-white font-semibold">{stats.totalEmployers}</span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-slate-800/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Task Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-slate-300">Total Tasks</span>
                <span className="text-white font-semibold">{stats.totalTasks}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-slate-300">Active Tasks</span>
                <span className="text-white font-semibold">{stats.activeTasks}</span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-slate-800/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Commission</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-slate-300">Rate</span>
                <span className="text-white font-semibold">{stats.commissionRate}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-slate-300">Collected</span>
                <span className="text-white font-semibold">${stats.adminWallet.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="backdrop-blur-xl bg-slate-800/50 border border-white/10 rounded-2xl p-6 mb-8 hover:border-white/20 transition-all">
          <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="group flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/0 hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className={`bg-gradient-to-br ${item.color} p-2.5 rounded-lg shadow-lg group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-semibold">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}