"use client";

import { useState, useEffect } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Star,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface Submission {
  id: number;
  taskId: number;
  taskTitle: string;
  workerId: number;
  workerName: string;
  submissionText: string;
  attachmentUrl: string | null;
  status: string;
  reward: number;
  submittedAt: string;
}

export default function EmployerSubmissionsPage() {
  const { user } = useSupabaseUser();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = "";
        const userId = user?.id;

        if (!userId) return;

        const res = await fetch(`/api/submissions?employerId=${userId}`, {
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

  const handleReview = async (submissionId: number, status: "approved" | "rejected") => {
    if (!feedback.trim() && status === "rejected") {
      toast.error("Please provide feedback for rejection");
      return;
    }

    if (!user?.id) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    setProcessing(true);

    try {
      const token = "";
      
      // Call the correct approve/reject endpoint
      if (status === "approved") {
        const res = await fetch(`/api/submissions/${submissionId}/approve`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employerId: user.id,
            reviewerNotes: feedback || "Approved",
          }),
        });

        const data = await res.json();
        console.log('Approval response:', data);

        if (res.ok) {
          // Check payment status
          if (data.paymentStatus) {
            console.log('Payment status:', data.paymentStatus);
            if (data.paymentStatus === 'failed') {
              toast.error(`Payment failed: ${data.transactionDetails?.error || 'Unknown error'}`);
            } else if (data.paymentStatus === 'success') {
              toast.success('Payment processed successfully!');
            }
          }
          
          // Create review after approval
          const submission = submissions.find(s => s.id === submissionId);
          if (submission) {
            await fetch("/api/reviews", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                taskId: submission.taskId,
                workerId: submission.workerId,
                rating,
                comment: feedback || "Good work!",
              }),
            });
          }

          toast.success("Submission approved and payment processed!");
          
          // Refresh submissions
          const refreshRes = await fetch(`/api/submissions?employerId=${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const refreshData = await refreshRes.json();
          if (refreshData.success) {
            setSubmissions(refreshData.data);
          }
          
          // Trigger a page reload to refresh wallet balance
          // This is a temporary solution - ideally use a state management solution
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          
          setReviewingId(null);
          setFeedback("");
          setRating(5);
        } else {
          toast.error(data.error || "Failed to approve submission");
        }
      } else {
        // Reject submission
        const res = await fetch(`/api/submissions/${submissionId}/reject`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employerId: user.id,
            reviewerNotes: feedback,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success("Submission rejected with feedback sent to worker");
          
          // Refresh submissions
          const refreshRes = await fetch(`/api/submissions?employerId=${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const refreshData = await refreshRes.json();
          if (refreshData.success) {
            setSubmissions(refreshData.data);
          }
          
          setReviewingId(null);
          setFeedback("");
          setRating(5);
        } else {
          toast.error(data.error || "Failed to reject submission");
        }
      }
    } catch (error) {
      console.error("Error reviewing submission:", error);
      toast.error("Failed to review submission. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filterStatus === "all") return true;
    return sub.status === filterStatus;
  });

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
        <h1 className="text-4xl font-semibold mb-2">Review Submissions</h1>
        <p className="text-gray-600">Approve or reject worker submissions</p>
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

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500">No submissions found</p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                        submission.status === "pending" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                        submission.status === "approved" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                        "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {submission.status === "pending" && <Clock size={14} />}
                        {submission.status === "approved" && <CheckCircle size={14} />}
                        {submission.status === "rejected" && <AlertCircle size={14} />}
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{submission.taskTitle}</h3>
                    <p className="text-gray-600">Submitted by: <span className="font-medium text-gray-900">{submission.workerName}</span></p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm text-gray-600 mb-1">Reward</p>
                    <p className="text-2xl font-semibold text-gray-900">${submission.reward}</p>
                  </div>
                </div>

                {/* Submission Content */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm font-medium mb-2 text-gray-700">Submission</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{submission.submissionText}</p>
                  {submission.attachmentUrl && (
                    <div className="mt-3">
                      <a
                        href={submission.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                      >
                        <Eye size={16} />
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>

                {/* Review Actions */}
                {submission.status === "pending" && (
                  <div className="border-t pt-4">
                    {reviewingId === submission.id ? (
                      <div className="space-y-4">
                        {/* Rating */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Rating</label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="transition-all hover:scale-110"
                                type="button"
                              >
                                <Star
                                  size={28}
                                  className={star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-200"}
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
                          </div>
                        </div>

                        {/* Feedback */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Feedback {feedback.trim() && <span className="text-gray-500">(Optional)</span>}
                          </label>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Provide feedback to the worker..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all resize-none"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleReview(submission.id, "approved")}
                            disabled={processing}
                            className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5"
                          >
                            <ThumbsUp size={18} />
                            {processing ? "Processing..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleReview(submission.id, "rejected")}
                            disabled={processing}
                            className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-xl font-medium hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5"
                          >
                            <ThumbsDown size={18} />
                            {processing ? "Processing..." : "Reject"}
                          </button>
                          <button
                            onClick={() => {
                              setReviewingId(null);
                              setFeedback("");
                              setRating(5);
                            }}
                            disabled={processing}
                            className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-black hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewingId(submission.id)}
                        className="w-full px-6 py-3 bg-black text-white rounded-xl font-medium hover:shadow-lg transition-all hover:-translate-y-0.5"
                      >
                        Review Submission
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
