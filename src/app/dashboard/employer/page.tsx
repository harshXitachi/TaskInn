"use client";

import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useEffect, useState } from "react";
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  Clock,
  Plus,
  Wallet as WalletIcon
} from "lucide-react";
import Link from "next/link";
import WalletCard from "@/components/dashboard/WalletCard";

interface EmployerStats {
  totalTasks: number;
  activeTasks: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  totalSpent: number;
}

interface Task {
  id: number;
  title: string;
  reward: number;
  status: string;
  submissionCount: number;
  currency?: string;
}

export default function EmployerDashboardPage() {
  const { user } = useSupabaseUser();
  const [stats, setStats] = useState<EmployerStats>({
    totalTasks: 0,
    activeTasks: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    totalSpent: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = "";
        const userId = user?.id;

        if (!userId) return;

        // Fetch employer's tasks
        const tasksRes = await fetch(`/api/tasks?employerId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tasksData = await tasksRes.json();

        if (tasksData.success) {
          const tasks = tasksData.data;
          setRecentTasks(tasks.slice(0, 5));

          // Calculate stats
          setStats({
            totalTasks: tasks.length,
            activeTasks: tasks.filter((t: Task) => t.status === "open").length,
            totalSubmissions: tasks.reduce((sum: number, t: Task) => sum + (t.submissionCount || 0), 0),
            pendingSubmissions: 0, // Will be calculated from submissions API
            totalSpent: tasks.reduce((sum: number, t: Task) => sum + t.reward * (t.submissionCount || 0), 0),
          });
        }

        // Fetch submissions for pending count
        const submissionsRes = await fetch(`/api/submissions?employerId=${userId}&status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const submissionsData = await submissionsRes.json();

        if (submissionsData.success) {
          setStats(prev => ({
            ...prev,
            pendingSubmissions: submissionsData.data.length,
          }));
        }
      } catch (error) {
        console.error("Error fetching employer data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.totalTasks.toString(),
      icon: Briefcase,
      color: "bg-blue-50 text-blue-600",
      trend: `${stats.activeTasks} active`,
    },
    {
      title: "Total Submissions",
      value: stats.totalSubmissions.toString(),
      icon: Users,
      color: "bg-purple-50 text-purple-600",
      trend: `${stats.pendingSubmissions} pending`,
    },
    {
      title: "Pending Reviews",
      value: stats.pendingSubmissions.toString(),
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
      trend: "Awaiting your review",
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
      trend: "On completed tasks",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Employer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your tasks and review submissions</p>
        </div>
        <Link
          href="/dashboard/employer/tasks/new"
          className="px-6 py-3 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Task
        </Link>
      </div>

      {/* Wallet Overview */}
      {user?.id && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <WalletIcon size={24} className="text-gray-700" />
            <h2 className="text-2xl font-semibold">Your Wallets</h2>
          </div>
          <WalletCard userId={user.id} userRole="employer" />
        </div>
      )}

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-3xl font-semibold mb-2">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.trend}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Link
            href="/dashboard/employer/tasks/new"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create New Task</h3>
            <p className="text-gray-600">Post a new micro-task for workers</p>
          </Link>

          <Link
            href="/dashboard/employer/submissions"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-yellow-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Review Submissions</h3>
            <p className="text-gray-600">Approve or reject worker submissions</p>
          </Link>

          <Link
            href="/dashboard/employer/tasks"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Manage Tasks</h3>
            <p className="text-gray-600">View and edit your posted tasks</p>
          </Link>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Your Tasks</h2>
          <Link
            href="/dashboard/employer/tasks"
            className="text-sm font-medium hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't created any tasks yet</p>
            <Link
              href="/dashboard/employer/tasks/new"
              className="inline-block px-6 py-3 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              Create Your First Task
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/employer/tasks/${task.id}`}
                className="block p-4 border border-gray-200 rounded-xl hover:border-black transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        task.status === "open" ? "bg-green-100 text-green-700" :
                        task.status === "closed" ? "bg-gray-100 text-gray-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {task.status}
                      </span>
                      {task.currency && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                          {task.currency === "USD" ? "💵 USD" : "🔐 USDT"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} />
                        {task.currency === "USDT_TRC20" ? "₮" : "$"}{task.reward} per completion
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {task.submissionCount || 0} submissions
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
