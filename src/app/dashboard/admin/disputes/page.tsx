"use client";

import { useState, useEffect } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";

interface Dispute {
  id: number;
  submissionId: number;
  taskTitle: string;
  workerId: number;
  workerName: string;
  employerId: number;
  employerName: string;
  reason: string;
  description: string;
  status: string;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export default function AdminDisputesPage() {
  const { user } = useSupabaseUser();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const token = "";
        const res = await fetch("/api/disputes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setDisputes(data.data);
        }
      } catch (error) {
        console.error("Error fetching disputes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDisputes();
    }
  }, [user]);

  const handleResolveDispute = async (disputeId: number, status: "resolved" | "rejected") => {
    if (!resolution.trim()) {
      toast.error("Please provide a resolution note");
      return;
    }

    try {
      const token = "";
      const res = await fetch(`/api/disputes/${disputeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          resolution,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Dispute ${status} successfully!`);
        setDisputes(disputes.map(d => 
          d.id === disputeId 
            ? { ...d, status, resolution, resolvedAt: new Date().toISOString() }
            : d
        ));
        setResolvingId(null);
        setResolution("");
      } else {
        toast.error(data.message || "Failed to resolve dispute");
      }
    } catch (error) {
      console.error("Error resolving dispute:", error);
      toast.error("Failed to resolve dispute");
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    if (filterStatus === "all") return true;
    return dispute.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = {
    total: disputes.length,
    pending: disputes.filter(d => d.status === "pending").length,
    resolved: disputes.filter(d => d.status === "resolved").length,
    rejected: disputes.filter(d => d.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold mb-2">Dispute Management</h1>
        <p className="text-gray-600">Resolve conflicts between workers and employers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm mb-1">Total Disputes</p>
          <p className="text-3xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-6">
          <p className="text-gray-600 text-sm mb-1">Pending</p>
          <p className="text-3xl font-semibold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-6">
          <p className="text-gray-600 text-sm mb-1">Resolved</p>
          <p className="text-3xl font-semibold text-green-700">{stats.resolved}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-6">
          <p className="text-gray-600 text-sm mb-1">Rejected</p>
          <p className="text-3xl font-semibold text-red-700">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
        >
          <option value="all">All Disputes</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-500">No disputes found</p>
          </div>
        ) : (
          filteredDisputes.map((dispute) => (
            <div
              key={dispute.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        dispute.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        dispute.status === "resolved" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {dispute.status === "pending" && <Clock size={14} className="inline mr-1" />}
                        {dispute.status === "resolved" && <CheckCircle size={14} className="inline mr-1" />}
                        {dispute.status === "rejected" && <XCircle size={14} className="inline mr-1" />}
                        {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold mb-3">{dispute.taskTitle}</h3>

                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={18} />
                        <div>
                          <p className="text-sm font-medium">Worker</p>
                          <p className="text-sm">{dispute.workerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase size={18} />
                        <div>
                          <p className="text-sm font-medium">Employer</p>
                          <p className="text-sm">{dispute.employerName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dispute Details */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Reason: {dispute.reason}</p>
                      <p className="text-sm text-gray-700">{dispute.description}</p>
                    </div>
                  </div>
                </div>

                {/* Resolution */}
                {dispute.resolution && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm font-medium mb-1">Admin Resolution</p>
                    <p className="text-sm text-gray-700">{dispute.resolution}</p>
                    {dispute.resolvedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Resolved on {new Date(dispute.resolvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Resolution Form */}
                {dispute.status === "pending" && (
                  <div className="border-t pt-4">
                    {resolvingId === dispute.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Resolution Note *
                          </label>
                          <textarea
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            placeholder="Explain your decision and any actions taken..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all resize-none"
                            required
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleResolveDispute(dispute.id, "resolved")}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={18} />
                            Resolve in Favor
                          </button>
                          <button
                            onClick={() => handleResolveDispute(dispute.id, "rejected")}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={18} />
                            Reject Dispute
                          </button>
                          <button
                            onClick={() => {
                              setResolvingId(null);
                              setResolution("");
                            }}
                            className="px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-black transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResolvingId(dispute.id)}
                        className="w-full px-6 py-3 bg-black text-white rounded-xl font-medium hover:shadow-lg transition-all hover:-translate-y-0.5"
                      >
                        Review Dispute
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
