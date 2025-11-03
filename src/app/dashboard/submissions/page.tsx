"use client";

import { useState, useEffect } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Filter,
  Calendar,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface Submission {
  id: number;
  taskId: number;
  taskTitle: string;
  submissionText: string;
  attachmentUrl: string | null;
  status: string;
  reward: number;
  submittedAt: string;
  reviewedAt: string | null;
  feedback: string | null;
}

export default function SubmissionsPage() {
  const { user } = useSupabaseUser();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = "";
        const userId = user?.id;

        if (!userId) return;

        const res = await fetch(`/api/submissions?workerId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setSubmissions(data.data);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus === "all") return true;
    return sub.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { bg: "bg-amber-100 border-amber-200", text: "text-amber-700", icon: Clock },
      approved: { bg: "bg-emerald-100 border-emerald-200", text: "text-emerald-700", icon: CheckCircle },
      rejected: { bg: "bg-slate-100 border-slate-200", text: "text-slate-700", icon: AlertCircle },
    };

    const config = configs[status as keyof typeof configs] || configs.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "pending").length,
    approved: submissions.filter(s => s.status === "approved").length,
    rejected: submissions.filter(s => s.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold mb-2">My Submissions</h1>
        <p className="text-gray-600">Track your submitted tasks and their status</p>
      </div>

      {/* Stats Cards - Enhanced with better colors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 text-sm mb-1">Total Submissions</p>
          <p className="text-3xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={18} className="text-amber-600" />
            <p className="text-gray-700 text-sm font-medium">Pending Review</p>
          </div>
          <p className="text-3xl font-semibold text-amber-700">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={18} className="text-emerald-600" />
            <p className="text-gray-700 text-sm font-medium">Approved</p>
          </div>
          <p className="text-3xl font-semibold text-emerald-700">{stats.approved}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={18} className="text-slate-600" />
            <p className="text-gray-700 text-sm font-medium">Rejected</p>
          </div>
          <p className="text-3xl font-semibold text-slate-700">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500">No submissions found</p>
            <Link
              href="/dashboard/tasks"
              className="inline-block mt-4 px-6 py-3 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              Browse Available Tasks
            </Link>
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(submission.status)}
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{submission.taskTitle}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{submission.submissionText}</p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm text-gray-600 mb-1">Reward</p>
                  <p className="text-2xl font-semibold text-gray-900">${submission.reward}</p>
                </div>
              </div>

              {submission.feedback && (
                <div className={`p-4 rounded-xl mb-4 border ${
                  submission.status === "approved" 
                    ? "bg-emerald-50 border-emerald-100" 
                    : "bg-slate-50 border-slate-200"
                }`}>
                  <p className="text-sm font-medium mb-1 text-gray-700">Feedback</p>
                  <p className="text-sm text-gray-700">{submission.feedback}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                {submission.attachmentUrl && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Eye size={16} />
                    <a
                      href={submission.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline font-medium"
                    >
                      View Attachment
                    </a>
                  </div>
                )}

                {/* View Details Button */}
                <Link
                  href={`/dashboard/tasks/${submission.taskId}`}
                  className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  View Details
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}