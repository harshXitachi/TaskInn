"use client";

import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useEffect, useState } from "react";
import { Star, MessageSquare, User } from "lucide-react";

interface Review {
  id: number;
  taskId: number;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
  taskTitle?: string;
  reviewerName?: string;
}

export default function EmployerReviewsPage() {
  const { user } = useSupabaseUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = "";
        const userId = user?.id;

        if (!userId) return;

        const res = await fetch(`/api/reviews?revieweeId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setReviews(data.data);

          // Calculate average rating
          if (data.data.length > 0) {
            const avg =
              data.data.reduce((sum: number, review: Review) => sum + review.rating, 0) /
              data.data.length;
            setAverageRating(avg);
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReviews();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold">Reviews & Ratings</h1>
        <p className="text-gray-600 mt-2">See what workers think about your tasks</p>
      </div>

      {/* Rating Overview */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-6xl font-bold mb-2">
              {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
            </p>
            {averageRating > 0 && renderStars(Math.round(averageRating))}
            <p className="text-sm text-gray-500 mt-2">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((r) => r.rating === rating).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-12">{rating} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">All Reviews</h2>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
            <p className="text-gray-500">
              Reviews from workers will appear here after they complete your tasks
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={24} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold">{review.reviewerName || "Anonymous"}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {review.taskTitle && (
                  <p className="text-sm text-gray-600 mb-2">
                    Task: <span className="font-medium">{review.taskTitle}</span>
                  </p>
                )}

                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
