"use client";

import { useState, useEffect } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Users,
  Eye
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  description: string;
  reward: number;
  timeEstimate: string;
  status: string;
  categoryId: number;
  category: string;
  createdAt: string;
  submissionCount: number;
}

export default function EmployerTasksPage() {
  const { user } = useSupabaseUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = "";
        const userId = user?.id;

        if (!userId) return;

        const res = await fetch(`/api/tasks?employerId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          // Fetch categories to join with tasks
          const categoriesRes = await fetch("/api/categories", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const categoriesData = await categoriesRes.json();
          
          const categoriesMap = new Map();
          if (categoriesData.success && Array.isArray(categoriesData.data)) {
            categoriesData.data.forEach((cat: any) => {
              categoriesMap.set(cat.id, cat.name);
            });
          }

          // Map category names to tasks
          const tasksWithCategories = data.data.map((task: any) => ({
            ...task,
            category: categoriesMap.get(task.categoryId) || "Uncategorized",
          }));

          setTasks(tasksWithCategories);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const token = "";
      const res = await fetch(`/api/tasks?id=${taskId}&employerId=${user?.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Task deleted successfully");
        setTasks(tasks.filter(t => t.id !== taskId));
      } else {
        toast.error(data.message || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === "all") return true;
    return task.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = {
    total: tasks.length,
    open: tasks.filter(t => t.status === "open").length,
    closed: tasks.filter(t => t.status === "closed").length,
    paused: tasks.filter(t => t.status === "paused").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold mb-2">My Tasks</h1>
          <p className="text-gray-600">Manage your posted tasks</p>
        </div>
        <Link
          href="/dashboard/employer/tasks/new"
          className="px-6 py-3 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Task
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm mb-1">Total Tasks</p>
          <p className="text-3xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-6">
          <p className="text-gray-600 text-sm mb-1">Open</p>
          <p className="text-3xl font-semibold text-green-700">{stats.open}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6">
          <p className="text-gray-600 text-sm mb-1">Closed</p>
          <p className="text-3xl font-semibold text-gray-700">{stats.closed}</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-6">
          <p className="text-gray-600 text-sm mb-1">Paused</p>
          <p className="text-3xl font-semibold text-yellow-700">{stats.paused}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
        >
          <option value="all">All Tasks</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-500 mb-4">No tasks found</p>
            <Link
              href="/dashboard/employer/tasks/new"
              className="inline-block px-6 py-3 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              Create Your First Task
            </Link>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      task.status === "open" ? "bg-green-100 text-green-700" :
                      task.status === "closed" ? "bg-gray-100 text-gray-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {task.status}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium">
                      {task.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <DollarSign size={18} />
                      <span>${task.reward}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={18} />
                      <span>{task.submissionCount || 0} submissions</span>
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex items-center gap-2">
                  <Link
                    href={`/dashboard/employer/tasks/${task.id}`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View details"
                  >
                    <Eye size={20} />
                  </Link>
                  <Link
                    href={`/dashboard/employer/tasks/${task.id}/edit`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit task"
                  >
                    <Edit size={20} />
                  </Link>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
