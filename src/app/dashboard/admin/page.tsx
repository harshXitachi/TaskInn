"use client";

import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useEffect, useState } from "react";
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  AlertCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalWorkers: number;
  totalEmployers: number;
  totalTasks: number;
  totalSubmissions: number;
  pendingDisputes: number;
  totalRevenue: number;
  activeUsers: number;
}

export default function AdminDashboardPage() {
  const { user } = useSupabaseUser();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalWorkers: 0,
    totalEmployers: 0,
    totalTasks: 0,
    totalSubmissions: 0,
    pendingDisputes: 0,
    totalRevenue: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = "";

        // Fetch all necessary data
        const [usersRes, tasksRes, submissionsRes, disputesRes, paymentsRes] = await Promise.all([
          fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/tasks", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/submissions", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/disputes", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/payments", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const [usersData, tasksData, submissionsData, disputesData, paymentsData] = await Promise.all([
          usersRes.json(),
          tasksRes.json(),
          submissionsRes.json(),
          disputesRes.json(),
          paymentsRes.json(),
        ]);

        if (usersData.success) {
          const users = usersData.data;
          setStats(prev => ({
            ...prev,
            totalUsers: users.length,
            totalWorkers: users.filter((u: any) => u.role === "worker").length,
            totalEmployers: users.filter((u: any) => u.role === "employer").length,
          }));
        }

        if (tasksData.success) {
          setStats(prev => ({ ...prev, totalTasks: tasksData.data.length }));
        }

        if (submissionsData.success) {
          setStats(prev => ({ ...prev, totalSubmissions: submissionsData.data.length }));
        }

        if (disputesData.success) {
          const pending = disputesData.data.filter((d: any) => d.status === "pending").length;
          setStats(prev => ({ ...prev, pendingDisputes: pending }));
        }

        if (paymentsData.success) {
          const revenue = paymentsData.data
            .filter((p: any) => p.type === "earning")
            .reduce((sum: number, p: any) => sum + p.amount, 0);
          setStats(prev => ({ ...prev, totalRevenue: revenue }));
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
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
      title: "Total Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      trend: `${stats.totalWorkers} workers, ${stats.totalEmployers} employers`,
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks.toString(),
      icon: Briefcase,
      color: "bg-purple-50 text-purple-600",
      trend: "Platform-wide",
    },
    {
      title: "Total Submissions",
      value: stats.totalSubmissions.toString(),
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
      trend: "All time",
    },
    {
      title: "Pending Disputes",
      value: stats.pendingDisputes.toString(),
      icon: AlertCircle,
      color: "bg-red-50 text-red-600",
      trend: "Requires attention",
    },
    {
      title: "Platform Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
      trend: "Total earnings",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Platform Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="font-medium">Active Tasks</p>
                  <p className="text-sm text-gray-600">Tasks currently available</p>
                </div>
              </div>
              <p className="text-2xl font-semibold">{stats.totalTasks}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <p className="font-medium">Active Workers</p>
                  <p className="text-sm text-gray-600">Workers on platform</p>
                </div>
              </div>
              <p className="text-2xl font-semibold">{stats.totalWorkers}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="font-medium">Active Employers</p>
                  <p className="text-sm text-gray-600">Employers on platform</p>
                </div>
              </div>
              <p className="text-2xl font-semibold">{stats.totalEmployers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="font-medium">Platform Growing</p>
                <p className="text-sm text-gray-600">
                  {stats.totalUsers} total users registered
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="font-medium">Submissions Processed</p>
                <p className="text-sm text-gray-600">
                  {stats.totalSubmissions} submissions reviewed
                </p>
              </div>
            </div>

            {stats.pendingDisputes > 0 && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="font-medium">Disputes Pending</p>
                  <p className="text-sm text-gray-600">
                    {stats.pendingDisputes} disputes need resolution
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
