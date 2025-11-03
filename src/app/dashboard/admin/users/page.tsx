"use client";

import { useState, useEffect } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { 
  Search, 
  Filter,
  Mail,
  Calendar,
  Shield,
  Ban,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  banned: boolean;
}

export default function AdminUsersPage() {
  const { user } = useSupabaseUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = "";
        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setUsers(data.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  const handleBanUser = async (userId: number, banned: boolean) => {
    try {
      const token = "";
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ banned }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`User ${banned ? "banned" : "unbanned"} successfully`);
        setUsers(users.map(u => u.id === userId ? { ...u, banned } : u));
      } else {
        toast.error(data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      return matchesSearch && matchesRole;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = {
    total: users.length,
    workers: users.filter(u => u.role === "worker").length,
    employers: users.filter(u => u.role === "employer").length,
    admins: users.filter(u => u.role === "admin").length,
    banned: users.filter(u => u.banned).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold mb-2">User Management</h1>
        <p className="text-gray-600">Manage all platform users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm mb-1">Total Users</p>
          <p className="text-3xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-6">
          <p className="text-gray-600 text-sm mb-1">Workers</p>
          <p className="text-3xl font-semibold text-blue-700">{stats.workers}</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-6">
          <p className="text-gray-600 text-sm mb-1">Employers</p>
          <p className="text-3xl font-semibold text-purple-700">{stats.employers}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-6">
          <p className="text-gray-600 text-sm mb-1">Admins</p>
          <p className="text-3xl font-semibold text-green-700">{stats.admins}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-6">
          <p className="text-gray-600 text-sm mb-1">Banned</p>
          <p className="text-3xl font-semibold text-red-700">{stats.banned}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
          >
            <option value="all">All Roles</option>
            <option value="worker">Workers</option>
            <option value="employer">Employers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${
                        user.role === "admin" ? "bg-green-100 text-green-700" :
                        user.role === "employer" ? "bg-purple-100 text-purple-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {user.role}
                      </span>
                      {user.banned && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                          Banned
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-2">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleBanUser(user.id, !user.banned)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        user.banned
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {user.banned ? (
                        <>
                          <CheckCircle size={16} />
                          Unban
                        </>
                      ) : (
                        <>
                          <Ban size={16} />
                          Ban
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
