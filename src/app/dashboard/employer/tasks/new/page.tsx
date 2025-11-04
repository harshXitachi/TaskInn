"use client";

import { useState, useEffect } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft,
  DollarSign,
  Clock,
  FileText,
  Tag,
  Users,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
}

export default function CreateTaskPage() {
  const { user } = useSupabaseUser();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    reward: "",
    timeEstimate: "",
    categoryId: "",
    slots: "1",
    currency: "USD",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = "";
        const res = await fetch("/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log('Categories API response:', res.status, data);

        if (res.ok && Array.isArray(data)) {
          console.log('Setting categories:', data.length, 'items');
          setCategories(data);
        } else {
          console.error('Failed to fetch categories:', data);
          toast.error('Failed to load categories');
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const reward = parseFloat(formData.reward);
    if (isNaN(reward) || reward <= 0) {
      toast.error("Please enter a valid reward amount");
      return;
    }

    const slots = parseInt(formData.slots);
    if (isNaN(slots) || slots <= 0) {
      toast.error("Please enter a valid number of workers needed");
      return;
    }

    setLoading(true);

    try {
      const token = "";
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          requirements: formData.instructions || null,
          price: reward,
          timeEstimate: formData.timeEstimate ? parseInt(formData.timeEstimate) : null,
          categoryId: parseInt(formData.categoryId) || categories[0]?.id || 1,
          employerId: user?.id,
          slots: slots,
          status: "open",
          currency: formData.currency,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Task created successfully!");
        router.push("/dashboard/employer/tasks");
      } else {
        toast.error(data.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/employer/tasks"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Tasks
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold mb-2">Create New Task</h1>
        <p className="text-gray-600">Post a micro-task for workers to complete</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <label className="block text-lg font-semibold mb-2">
            Task Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Classify 100 images as indoor/outdoor"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
            required
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <label className="block text-lg font-semibold mb-2">
            Task Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide a clear description of what workers need to do..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all resize-none"
            required
          />
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <FileText className="text-blue-600 mt-1" size={24} />
            <div className="flex-1">
              <label className="block text-lg font-semibold mb-2">
                Detailed Instructions (Optional)
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Add step-by-step instructions, examples, or guidelines..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Task Details */}
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold">Task Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Currency Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Currency *
              </label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all appearance-none bg-white"
                  required
                >
                  <option value="USD">💵 USD (PayPal)</option>
                  <option value="USDT">🔐 USDT (TRC-20)</option>
                </select>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formData.currency === "USD" 
                  ? "Workers will be paid via PayPal" 
                  : "Workers will be paid via USDT TRC-20 wallet"}
              </p>
            </div>

            {/* Reward */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Reward per Completion *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Amount in {formData.currency === "USD" ? "USD" : "USDT"}
              </p>
            </div>

            {/* Time Estimate */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Estimated Time (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  min="1"
                  value={formData.timeEstimate}
                  onChange={(e) => setFormData({ ...formData, timeEstimate: e.target.value })}
                  placeholder="e.g., 30"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                How long will this task take to complete?
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Category * {categories.length > 0 && `(${categories.length} available)`}
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all appearance-none bg-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {categories.length === 0 && (
                <p className="text-sm text-red-500 mt-2">
                  ⚠️ No categories found. Please contact support.
                </p>
              )}
            </div>

            {/* Number of Workers Needed */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Number of Workers Needed *
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  min="1"
                  value={formData.slots}
                  onChange={(e) => setFormData({ ...formData, slots: e.target.value })}
                  placeholder="1"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                How many workers do you need for this task?
              </p>
            </div>
          </div>

          {/* Total Cost Preview */}
          {formData.reward && formData.slots && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Task Budget:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formData.currency === "USD" ? "$" : "₮"}{(parseFloat(formData.reward || "0") * parseInt(formData.slots || "1")).toFixed(2)} {formData.currency === "USD" ? "USD" : "USDT"}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {formData.reward} {formData.currency === "USD" ? "USD" : "USDT"} × {formData.slots} worker{parseInt(formData.slots) > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Link
            href="/dashboard/employer/tasks"
            className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-full font-medium hover:border-black transition-all text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-4 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}