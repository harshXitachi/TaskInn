"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, Users, DollarSign, Briefcase, Activity } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState({
    userGrowth: { current: 0, previous: 0, change: 0 },
    taskCompletion: { completed: 0, pending: 0, rejected: 0 },
    revenue: { total: 0, thisMonth: 0, lastMonth: 0 },
    topWorkers: [] as any[],
    topEmployers: [] as any[],
    categoryBreakdown: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (!session) {
      router.push("/admin");
      return;
    }

    loadAnalytics();
  }, [router]);

  const loadAnalytics = async () => {
    try {
      // Fetch all necessary data
      const adminToken = localStorage.getItem("admin_bearer_token");
      const paymentsFetch = adminToken
        ? fetch("/api/payments?all=true", {
            headers: { Authorization: `Bearer ${adminToken}` },
          })
        : fetch("/api/payments?all=true");

      const [usersRes, tasksRes, submissionsRes, paymentsRes, statsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/tasks"),
        fetch("/api/submissions"),
        paymentsFetch,
        fetch("/api/users?stats=true"),
      ]);

      // Parse payloads with correct shapes
      const users = await usersRes.json();

      const tasksPayload = await tasksRes.json();
      const tasks = Array.isArray(tasksPayload) ? tasksPayload : tasksPayload?.data ?? [];

      const submissionsPayload = await submissionsRes.json();
      const submissions = Array.isArray(submissionsPayload) ? submissionsPayload : submissionsPayload?.data ?? [];

      const payments = await paymentsRes.json();

      // Calculate analytics
      const completedSubmissions = submissions.filter((s: any) => s.status === "approved").length;
      const pendingSubmissions = submissions.filter((s: any) => s.status === "pending").length;
      const rejectedSubmissions = submissions.filter((s: any) => s.status === "rejected").length;

      const totalRevenue = (Array.isArray(payments) ? payments : []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      // Get top workers (by completed tasks)
      const workerStats = users
        .filter((u: any) => u.role === "worker")
        .map((u: any) => {
          const workerSubmissions = submissions.filter(
            (s: any) => s.workerId === u.id && s.status === "approved"
          );
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            completedTasks: workerSubmissions.length,
          };
        })
        .sort((a: any, b: any) => b.completedTasks - a.completedTasks)
        .slice(0, 5);

      // Get top employers (by posted tasks)
      const employerStats = users
        .filter((u: any) => u.role === "employer")
        .map((u: any) => {
          const employerTasks = tasks.filter((t: any) => t.employerId === u.id);
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            postedTasks: employerTasks.length,
          };
        })
        .sort((a: any, b: any) => b.postedTasks - a.postedTasks)
        .slice(0, 5);

      setAnalytics({
        userGrowth: {
          current: users.length,
          previous: Math.floor(users.length * 0.8),
          change: 20,
        },
        taskCompletion: {
          completed: completedSubmissions,
          pending: pendingSubmissions,
          rejected: rejectedSubmissions,
        },
        revenue: {
          total: totalRevenue,
          thisMonth: totalRevenue * 0.3,
          lastMonth: totalRevenue * 0.25,
        },
        topWorkers: workerStats,
        topEmployers: employerStats,
        categoryBreakdown: [],
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/modern-minimalist-logo-for-taskinn-a-pro-7f90acf1-20251031063352.jpg"
                alt="TaskInn Logo"
                width={120}
                height={40}
                className="h-8 w-auto brightness-0 invert"
              />
              <h1 className="text-xl font-medium text-white">Analytics Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-400" />
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp className="h-4 w-4" />
                +{analytics.userGrowth.change}%
              </div>
            </div>
            <div className="text-3xl font-semibold text-white mb-1">{analytics.userGrowth.current}</div>
            <div className="text-sm text-gray-400">Total Users</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="h-8 w-8 text-purple-400" />
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-3xl font-semibold text-white mb-1">{analytics.taskCompletion.completed}</div>
            <div className="text-sm text-gray-400">Completed Tasks</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-green-400" />
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp className="h-4 w-4" />
                +15%
              </div>
            </div>
            <div className="text-3xl font-semibold text-white mb-1">${analytics.revenue.total.toFixed(0)}</div>
            <div className="text-sm text-gray-400">Total Revenue</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-orange-400" />
              <span className="text-orange-400 text-sm">Live</span>
            </div>
            <div className="text-3xl font-semibold text-white mb-1">{analytics.taskCompletion.pending}</div>
            <div className="text-sm text-gray-400">Pending Tasks</div>
          </div>
        </div>

        {/* Task Completion Stats */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-medium text-white mb-6">Task Completion Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <div className="text-2xl font-semibold text-green-400 mb-1">{analytics.taskCompletion.completed}</div>
              <div className="text-sm text-gray-400">Approved</div>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <div className="text-2xl font-semibold text-yellow-400 mb-1">{analytics.taskCompletion.pending}</div>
              <div className="text-sm text-gray-400">Pending</div>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <div className="text-2xl font-semibold text-red-400 mb-1">{analytics.taskCompletion.rejected}</div>
              <div className="text-sm text-gray-400">Rejected</div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Workers */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-6">Top Workers</h3>
            <div className="space-y-4">
              {analytics.topWorkers.map((worker, index) => (
                <div key={worker.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium">{worker.name}</div>
                      <div className="text-sm text-gray-400">{worker.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{worker.completedTasks}</div>
                    <div className="text-xs text-gray-400">tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Employers */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-6">Top Employers</h3>
            <div className="space-y-4">
              {analytics.topEmployers.map((employer, index) => (
                <div key={employer.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium">{employer.name}</div>
                      <div className="text-sm text-gray-400">{employer.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{employer.postedTasks}</div>
                    <div className="text-xs text-gray-400">tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}