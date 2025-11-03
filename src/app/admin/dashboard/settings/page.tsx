"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Lock, Save, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import bcrypt from "bcryptjs";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<any>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [usernameForm, setUsernameForm] = useState({
    newUsername: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (!session) {
      router.push("/admin");
      return;
    }

    const parsedSession = JSON.parse(session);
    setAdminSession(parsedSession);
    setUsernameForm({ newUsername: parsedSession.username });
    setIsLoading(false);
  }, [router]);

  const handleUpdateUsername = async () => {
    if (!usernameForm.newUsername || usernameForm.newUsername.trim() === "") {
      toast.error("Username cannot be empty");
      return;
    }

    if (usernameForm.newUsername === adminSession.username) {
      toast.error("New username is the same as current");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/settings?id=${adminSession.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameForm.newUsername,
        }),
      });

      if (!response.ok) throw new Error("Failed to update username");

      // Update local session
      const updatedSession = { ...adminSession, username: usernameForm.newUsername };
      localStorage.setItem("admin_session", JSON.stringify(updatedSession));
      setAdminSession(updatedSession);

      toast.success("Username updated successfully");
    } catch (error) {
      toast.error("Failed to update username");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setIsSaving(true);

    try {
      // First, verify current password
      const settingsRes = await fetch("/api/admin/settings");
      const settings = await settingsRes.json();
      const adminSettings = settings[0];

      const passwordMatch = await bcrypt.compare(passwordForm.currentPassword, adminSettings.passwordHash);
      
      if (!passwordMatch) {
        toast.error("Current password is incorrect");
        setIsSaving(false);
        return;
      }

      // Update password
      const response = await fetch(`/api/admin/settings?id=${adminSession.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: passwordForm.newPassword,
        }),
      });

      if (!response.ok) throw new Error("Failed to update password");

      toast.success("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !adminSession) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/modern-minimalist-logo-for-taskinn-a-pro-7f90acf1-20251031063352.jpg"
                alt="TaskInn Logo"
                width={120}
                height={40}
                className="h-8 w-auto brightness-0 invert"
              />
              <h1 className="text-xl font-medium text-white">Admin Settings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Update Username */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-medium text-white">Update Username</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Current Username</label>
              <div className="px-4 py-3 bg-gray-700/50 rounded-xl text-gray-300">
                {adminSession.username}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">New Username</label>
              <input
                type="text"
                value={usernameForm.newUsername}
                onChange={(e) => setUsernameForm({ newUsername: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="Enter new username"
              />
            </div>

            <Button
              onClick={handleUpdateUsername}
              disabled={isSaving || usernameForm.newUsername === adminSession.username}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Update Username"}
            </Button>
          </div>
        </div>

        {/* Update Password */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-orange-400" />
            <h3 className="text-lg font-medium text-white">Change Password</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                  placeholder="Enter current password"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                  placeholder="Enter new password"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                placeholder="Confirm new password"
                autoComplete="off"
              />
            </div>

            <Button
              onClick={handleUpdatePassword}
              disabled={isSaving}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
