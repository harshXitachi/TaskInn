"use client";

import { useState, useEffect } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { createClient } from "@/lib/supabase/client";
import {
  User, 
  Mail, 
  Calendar,
  Star,
  Briefcase,
  DollarSign,
  Award,
  Edit,
  Check,
  X,
  Camera,
  MapPin,
  GraduationCap,
  Wrench
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Princess",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Midnight",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Lily",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Felix",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sasha",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Max",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka",
];

interface UserStats {
  totalEarnings: number;
  completedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  averageRating: number;
  totalReviews: number;
}

interface ProfileData {
  bio: string;
  phone: string;
  location: string;
  skills: string;
  education: string;
  experience: string;
}

export default function ProfilePage() {
  const { user } = useSupabaseUser();
  const [stats, setStats] = useState<UserStats>({
    totalEarnings: 0,
    completedSubmissions: 0,
    pendingSubmissions: 0,
    rejectedSubmissions: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "info" | "achievements">("overview");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: "",
    phone: "",
    location: "",
    skills: "",
    education: "",
    experience: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const userId = user?.id;

        if (!userId) return;

        const res = await fetch(`/api/users/${userId}/stats`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        const data = await res.json();

        if (data.success) {
          setStats(data.data);
        }

        // Fetch profile data
        const profileRes = await fetch(`/api/users/${userId}/profile`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        const profileResData = await profileRes.json();

        if (profileResData.success) {
          setProfileData({
            bio: profileResData.data.bio || "",
            phone: profileResData.data.phone || "",
            location: profileResData.data.location || "",
            skills: profileResData.data.skills || "",
            education: profileResData.data.education || "",
            experience: profileResData.data.experience || "",
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleAvatarChange = async (avatarUrl: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = user?.id;

      if (!userId) return;

      setIsSaving(true);

      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ profilePicture: avatarUrl }),
      });

      if (!res.ok) throw new Error("Failed to update avatar");

      toast.success("Profile picture updated!");
      setShowAvatarModal(false);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update profile picture");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = user?.id;

      if (!userId) return;

      setIsSaving(true);

      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully!");
      setIsEditingInfo(false);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completionRate = stats.completedSubmissions + stats.rejectedSubmissions > 0
    ? (stats.completedSubmissions / (stats.completedSubmissions + stats.rejectedSubmissions) * 100).toFixed(1)
    : "0";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information and view your statistics</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-start gap-6">
          {/* Avatar with Change Button */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0 overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
              {(user as any)?.profilePicture ? (
                <Image
                  src={(user as any).profilePicture}
                  alt={user?.name || "User"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="text-white" size={24} />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">{user?.name || "User"}</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={18} />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                <span>Member since {new Date((user as any)?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium capitalize">
                  {(user as any)?.role || "Worker"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl p-2 shadow-sm flex gap-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
            activeTab === "overview"
              ? "bg-black text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Performance Overview
        </button>
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
            activeTab === "info"
              ? "bg-black text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Personal Information
        </button>
        <button
          onClick={() => setActiveTab("achievements")}
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
            activeTab === "achievements"
              ? "bg-black text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Achievements
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Performance Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              </div>
              <p className="text-3xl font-semibold text-green-600">${stats.totalEarnings.toFixed(2)}</p>
            </div>

            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
              </div>
              <p className="text-3xl font-semibold text-blue-600">{stats.completedSubmissions}</p>
            </div>

            <div className="p-6 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                  <Star size={20} />
                </div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
              </div>
              <p className="text-3xl font-semibold text-purple-600">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
              </p>
              {stats.totalReviews > 0 && (
                <p className="text-sm text-gray-500 mt-1">{stats.totalReviews} reviews</p>
              )}
            </div>

            <div className="p-6 bg-yellow-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-600 text-white rounded-lg flex items-center justify-center">
                  <Award size={20} />
                </div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
              </div>
              <p className="text-3xl font-semibold text-yellow-600">{completionRate}%</p>
            </div>

            <div className="p-6 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-600 text-white rounded-lg flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              </div>
              <p className="text-3xl font-semibold text-orange-600">{stats.pendingSubmissions}</p>
            </div>

            <div className="p-6 bg-red-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <p className="text-sm font-medium text-gray-600">Rejected Tasks</p>
              </div>
              <p className="text-3xl font-semibold text-red-600">{stats.rejectedSubmissions}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "info" && (
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Personal Information</h2>
            {!isEditingInfo ? (
              <Button
                onClick={() => setIsEditingInfo(true)}
                variant="outline"
                className="rounded-full"
              >
                <Edit size={18} className="mr-2" />
                Edit Information
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleProfileSave}
                  disabled={isSaving}
                  className="bg-black text-white rounded-full"
                >
                  <Check size={18} className="mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={() => setIsEditingInfo(false)}
                  variant="outline"
                  className="rounded-full"
                  disabled={isSaving}
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Bio */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User size={18} />
                Bio
              </label>
              {isEditingInfo ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:ring-2 focus:ring-black/10 transition-all outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-600 p-4 bg-gray-50 rounded-xl">
                  {profileData.bio || "No bio provided"}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail size={18} />
                Phone Number
              </label>
              {isEditingInfo ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:ring-2 focus:ring-black/10 transition-all outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              ) : (
                <p className="text-gray-600 p-4 bg-gray-50 rounded-xl">
                  {profileData.phone || "No phone number provided"}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin size={18} />
                Location
              </label>
              {isEditingInfo ? (
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:ring-2 focus:ring-black/10 transition-all outline-none"
                  placeholder="City, Country"
                />
              ) : (
                <p className="text-gray-600 p-4 bg-gray-50 rounded-xl">
                  {profileData.location || "No location provided"}
                </p>
              )}
            </div>

            {/* Skills */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Wrench size={18} />
                Skills
              </label>
              {isEditingInfo ? (
                <textarea
                  value={profileData.skills}
                  onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:ring-2 focus:ring-black/10 transition-all outline-none resize-none"
                  placeholder="List your skills (e.g., Data Entry, Content Writing, Design)"
                />
              ) : (
                <p className="text-gray-600 p-4 bg-gray-50 rounded-xl">
                  {profileData.skills || "No skills listed"}
                </p>
              )}
            </div>

            {/* Education */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <GraduationCap size={18} />
                Education
              </label>
              {isEditingInfo ? (
                <textarea
                  value={profileData.education}
                  onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:ring-2 focus:ring-black/10 transition-all outline-none resize-none"
                  placeholder="Your educational background"
                />
              ) : (
                <p className="text-gray-600 p-4 bg-gray-50 rounded-xl">
                  {profileData.education || "No education information provided"}
                </p>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Briefcase size={18} />
                Work Experience
              </label>
              {isEditingInfo ? (
                <textarea
                  value={profileData.experience}
                  onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:ring-2 focus:ring-black/10 transition-all outline-none resize-none"
                  placeholder="Your work experience and relevant background"
                />
              ) : (
                <p className="text-gray-600 p-4 bg-gray-50 rounded-xl">
                  {profileData.experience || "No work experience provided"}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Achievements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 border-2 rounded-xl ${
              stats.completedSubmissions >= 1 ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stats.completedSubmissions >= 1 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"
                }`}>
                  🎯
                </div>
                <div>
                  <p className="font-semibold">First Task Complete</p>
                  <p className="text-sm text-gray-600">Complete your first task</p>
                </div>
              </div>
            </div>

            <div className={`p-4 border-2 rounded-xl ${
              stats.completedSubmissions >= 10 ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stats.completedSubmissions >= 10 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"
                }`}>
                  🏆
                </div>
                <div>
                  <p className="font-semibold">Task Master</p>
                  <p className="text-sm text-gray-600">Complete 10 tasks</p>
                </div>
              </div>
            </div>

            <div className={`p-4 border-2 rounded-xl ${
              stats.totalEarnings >= 100 ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stats.totalEarnings >= 100 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"
                }`}>
                  💰
                </div>
                <div>
                  <p className="font-semibold">Money Maker</p>
                  <p className="text-sm text-gray-600">Earn $100</p>
                </div>
              </div>
            </div>

            <div className={`p-4 border-2 rounded-xl ${
              stats.averageRating >= 4.5 ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stats.averageRating >= 4.5 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"
                }`}>
                  ⭐
                </div>
                <div>
                  <p className="font-semibold">Top Rated</p>
                  <p className="text-sm text-gray-600">Maintain 4.5+ rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">Choose Profile Picture</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {PRESET_AVATARS.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => handleAvatarChange(avatar)}
                  disabled={isSaving}
                  className="aspect-square rounded-2xl overflow-hidden border-4 border-gray-200 hover:border-black transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Image
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
