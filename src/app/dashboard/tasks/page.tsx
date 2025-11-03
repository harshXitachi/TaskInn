"use client";

import { useState, useEffect } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { 
  Search, 
  Filter, 
  DollarSign, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Users
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: number;
  title: string;
  description: string;
  reward: number;
  price: number;
  timeEstimate: string;
  categoryId: number;
  category: string;
  status: string;
  createdAt: string;
  slots: number;
  slotsFilled: number;
}

interface Category {
  id: number;
  name: string;
}

export default function TasksPage() {
  const { user } = useSupabaseUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = "";

        // Fetch tasks and categories in parallel
        const [tasksRes, categoriesRes] = await Promise.all([
          fetch("/api/tasks?status=open", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const tasksData = await tasksRes.json();
        const categoriesData = await categoriesRes.json();

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }

        if (tasksData.success) {
          // Create a map of category IDs to names
          const categoriesMap = new Map();
          if (categoriesData.success && Array.isArray(categoriesData.data)) {
            categoriesData.data.forEach((cat: any) => {
              categoriesMap.set(cat.id, cat.name);
            });
          }

          // Map category names to tasks
          const tasksWithCategories = tasksData.data.map((task: any) => ({
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

    fetchData();
  }, []);

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "highest") return (b.price || b.reward) - (a.price || a.reward);
      if (sortBy === "lowest") return (a.price || a.reward) - (b.price || b.reward);
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const availableTasks = filteredTasks.filter(t => (t.slots - t.slotsFilled) > 0);
  const totalReward = availableTasks.reduce((sum, t) => sum + (t.price || t.reward), 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats - Redesigned */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Available Tasks</p>
              <p className="text-4xl font-bold text-black">{availableTasks.length}</p>
            </div>
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={28} className="text-gray-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Rewards</p>
              <p className="text-4xl font-bold text-black">${totalReward.toFixed(0)}</p>
            </div>
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
              <DollarSign size={28} className="text-gray-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Categories</p>
              <p className="text-4xl font-bold text-black">{categories.length}</p>
            </div>
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
              <Filter size={28} className="text-gray-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for tasks you're interested in..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Pay</option>
              <option value="lowest">Lowest Pay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-black">{filteredTasks.length}</span> tasks
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const slotsAvailable = task.slots - task.slotsFilled;
            const isLimited = slotsAvailable <= 3;
            const reward = task.price || task.reward;

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-black/10 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    {/* Category & Date */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                        {task.category}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                      {isLimited && (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 animate-pulse">
                          Only {slotsAvailable} spots left!
                        </Badge>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                    
                    {/* Task Meta */}
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <DollarSign size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Reward</p>
                          <p className="font-semibold text-green-600">${reward}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-semibold text-blue-600">{task.timeEstimate || "Flexible"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Spots</p>
                          <p className="font-semibold text-purple-600">{slotsAvailable} available</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex lg:flex-col items-center gap-3">
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="w-full lg:w-auto px-6 py-3 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group-hover:bg-blue-600"
                    >
                      View Details
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
