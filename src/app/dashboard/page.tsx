"use client";

import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Briefcase,
  Star
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalEarnings: number;
  completedTasks: number;
  pendingTasks: number;
  averageRating: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  reward: number;
  timeEstimate: string;
  category: string;
}

export default function DashboardPage() {
  const { user } = useSupabaseUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    completedTasks: 0,
    pendingTasks: 0,
    averageRating: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const userId = user?.id;

        if (!userId) return;

        // Fetch user stats
        const statsRes = await fetch(`/api/users/${userId}/stats`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        const statsData = await statsRes.json();
        
        if (statsData.success) {
          setStats({
            totalEarnings: statsData.data.totalEarnings || 0,
            completedTasks: statsData.data.completedSubmissions || 0,
            pendingTasks: statsData.data.pendingSubmissions || 0,
            averageRating: statsData.data.averageRating || 0,
          });
        }

        // Fetch recent tasks
        const tasksRes = await fetch("/api/tasks?limit=5&status=open", {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        const tasksData = await tasksRes.json();
        
        if (tasksData.success) {
          setRecentTasks(tasksData.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
      title: "Total Earnings",
      value: `$${stats.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
      trend: "+12% from last month",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks.toString(),
      icon: CheckCircle,
      color: "bg-blue-50 text-blue-600",
      trend: `${stats.completedTasks} tasks finished`,
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks.toString(),
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
      trend: "In review",
    },
    {
      title: "Average Rating",
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A",
      icon: Star,
      color: "bg-purple-50 text-purple-600",
      trend: "From reviews",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Welcome back, {user?.user_metadata?.name || user?.email || "Worker"}!</h1>
          <p className="text-gray-600 mt-2">Here's your TaskInn overview</p>
        </div>
        <Link
          href="/dashboard/tasks"
          className="px-6 py-3 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          Browse Tasks
        </Link>
      </div>

      {/* Stats Grid */}
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link
          href="/dashboard/tasks"
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Briefcase size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Find New Tasks</h3>
          <p className="text-gray-600">Browse available micro-tasks and start earning</p>
        </Link>

        <Link
          href="/dashboard/submissions"
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CheckCircle size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-2">My Submissions</h3>
          <p className="text-gray-600">Track your submitted tasks and their status</p>
        </Link>

        <Link
          href="/dashboard/earnings"
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-2">View Earnings</h3>
          <p className="text-gray-600">Check your income and payment history</p>
        </Link>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Available Tasks</h2>
          <Link
            href="/dashboard/tasks"
            className="text-sm font-medium hover:underline"
          >
            View all →
          </Link>
        </div>
        
        {recentTasks.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No tasks available at the moment</p>
        ) : (
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/tasks/${task.id}`}
                className="block p-4 border border-gray-200 rounded-xl hover:border-black transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <DollarSign size={14} />
                        ${task.reward}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={14} />
                        {task.timeEstimate}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium">
                      Start Task
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
