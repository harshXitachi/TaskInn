"use client";

import { useState, useEffect } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { 
  DollarSign, 
  Clock, 
  Calendar,
  ArrowLeft,
  AlertCircle,
  Upload,
  Users
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  description: string;
  requirements: string;
  price: number;
  timeEstimate: number;
  categoryId: number;
  category: string;
  status: string;
  createdAt: string;
  employerId: string;
  slots: number;
  slotsFilled: number;
}

interface Submission {
  id: number;
  taskId: number;
  workerId: string;
  status: string;
  submissionData: string | null;
  submittedAt: string;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSupabaseUser();
  const [task, setTask] = useState<Task | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  useEffect(() => {
    const fetchTaskAndSubmission = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        // Fetch task details - FIXED: Use query parameter instead of path parameter
        const taskRes = await fetch(`/api/tasks?id=${params.id}`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        const taskData = await taskRes.json();

        if (taskData.success === false || !taskData) {
          toast.error("Task not found");
          router.push("/dashboard/tasks");
          return;
        }

        // Handle both direct object response and wrapped response
        const taskObject = taskData.data ? taskData.data : taskData;
        setTask(taskObject);

        // Check if user has already applied/submitted
        const submissionsRes = await fetch(`/api/submissions?taskId=${params.id}&workerId=${user?.id}`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        const submissionsData = await submissionsRes.json();

        if (submissionsData.success && submissionsData.data.length > 0) {
          setSubmission(submissionsData.data[0]);
          if (submissionsData.data[0].submissionData) {
            try {
              const data = JSON.parse(submissionsData.data[0].submissionData);
              setSubmissionText(data.text || "");
              setAttachmentUrl(data.attachmentUrl || "");
            } catch {
              setSubmissionText(submissionsData.data[0].submissionData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load task");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTaskAndSubmission();
    }
  }, [params.id, router, user]);

  const handleApply = async () => {
    setActionLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/tasks/${params.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Successfully applied to task!");
        setSubmission(data);
      } else {
        toast.error(data.error || "Failed to apply");
      }
    } catch (error) {
      console.error("Error applying:", error);
      toast.error("An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submissionText.trim()) {
      toast.error("Please provide your submission");
      return;
    }

    setActionLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/tasks/${params.id}/submit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          workerId: user?.id,
          submissionData: {
            text: submissionText,
            attachmentUrl: attachmentUrl || null,
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Work submitted successfully! Awaiting employer review.");
        setSubmission(data);
      } else {
        toast.error(data.error || "Failed to submit work");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submissionText.trim()) {
      toast.error("Please provide your submission");
      return;
    }

    setActionLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/submissions/${submission?.id}/resubmit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          workerId: user?.id,
          submissionData: {
            text: submissionText,
            attachmentUrl: attachmentUrl || null,
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Work resubmitted successfully!");
        setSubmission(data);
      } else {
        toast.error(data.error || "Failed to resubmit");
      }
    } catch (error) {
      console.error("Error resubmitting:", error);
      toast.error("An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const slotsAvailable = task.slots - task.slotsFilled;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/tasks"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Tasks
      </Link>

      {/* Task Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium">
            {task.category}
          </span>
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
            task.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100"
          }`}>
            {task.status}
          </span>
          {slotsAvailable <= 3 && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
              Only {slotsAvailable} spots left!
            </span>
          )}
        </div>

        <h1 className="text-3xl font-semibold mb-4">{task.title}</h1>

        <div className="flex items-center gap-6 text-gray-600 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <DollarSign size={20} />
            <span className="font-semibold text-green-600">${task.price}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={20} />
            <span>{task.timeEstimate} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={20} />
            <span>{slotsAvailable} spots available</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Submission Status */}
        {submission && (
          <div className={`mt-4 p-4 rounded-xl ${
            submission.status === "applied" ? "bg-blue-50 border border-blue-200" :
            submission.status === "pending" ? "bg-yellow-50 border border-yellow-200" :
            submission.status === "approved" ? "bg-green-50 border border-green-200" :
            "bg-red-50 border border-red-200"
          }`}>
            <p className="font-medium">
              Status: <span className="capitalize">{submission.status}</span>
            </p>
            {submission.status === "applied" && (
              <p className="text-sm mt-1">You've applied to this task. Now submit your work!</p>
            )}
            {submission.status === "pending" && (
              <p className="text-sm mt-1">Your submission is awaiting employer review.</p>
            )}
            {submission.status === "approved" && (
              <p className="text-sm mt-1">Congratulations! Your submission was approved.</p>
            )}
            {submission.status === "rejected" && (
              <p className="text-sm mt-1">Your submission was rejected. You can resubmit below.</p>
            )}
          </div>
        )}
      </div>

      {/* Task Description */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Description</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
      </div>

      {/* Task Requirements */}
      {task.requirements && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h2 className="text-xl font-semibold mb-2">Requirements</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.requirements}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!submission && (
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Apply to This Task</h2>
          <p className="text-gray-600 mb-6">
            Click below to apply. Once applied, you can submit your work.
          </p>
          <button
            onClick={handleApply}
            disabled={actionLoading || slotsAvailable === 0}
            className="w-full px-6 py-4 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? "Applying..." : "Apply to Task"}
          </button>
        </div>
      )}

      {submission && (submission.status === "applied" || submission.status === "rejected") && (
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">
            {submission.status === "rejected" ? "Resubmit Your Work" : "Submit Your Work"}
          </h2>
          
          <form onSubmit={submission.status === "rejected" ? handleResubmit : handleSubmitWork} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Submission *
              </label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Describe your work or paste your completed task here..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Attachment URL (Optional)
              </label>
              <div className="relative">
                <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="https://example.com/your-file.pdf"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Provide a link to your work (Google Drive, Dropbox, etc.)
              </p>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full px-6 py-4 bg-black text-white rounded-full font-medium hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? "Submitting..." : submission.status === "rejected" ? "Resubmit Work" : "Submit Work"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}