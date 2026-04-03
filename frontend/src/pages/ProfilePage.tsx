import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Camera, User, Lock, Eye, EyeOff, Save, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { updateProfile } from "../services/api";
import Navbar from "../components/Navbar";

const ProfilePage = () => {
  const { user, token, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Display name state
  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [savingName, setSavingName] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile || !token) return;
    setSavingAvatar(true);
    try {
      const updated = await updateProfile(token, { avatar: avatarFile });
      updateUser({ ...user!, ...updated });
      setAvatarFile(null);
      showToast("success", "Profile", "Avatar updated!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update avatar";
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        logout();
        navigate("/login");
        return;
      }
      showToast("danger", "Error", msg);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSaveName = async () => {
    if (!token) return;
    setSavingName(true);
    try {
      const updated = await updateProfile(token, { display_name: displayName });
      updateUser({ ...user!, ...updated });
      showToast("success", "Profile", "Display name updated!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update name";
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        logout();
        navigate("/login");
        return;
      }
      showToast("danger", "Error", msg);
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async () => {
    if (!token) return;
    if (newPassword !== confirmPassword) {
      showToast("danger", "Error", "Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      showToast("danger", "Error", "New password must be at least 6 characters");
      return;
    }
    setSavingPassword(true);
    try {
      await updateProfile(token, { current_password: currentPassword, new_password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("success", "Profile", "Password changed successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        logout();
        navigate("/login");
        return;
      }
      showToast("danger", "Error", msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const initial = (user?.display_name || user?.username || "?")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition dark:text-gray-400 dark:hover:text-green-400"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>

        {/* Avatar Card */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-5">
            <Camera className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Profile Photo</h2>
          </div>

          <div className="flex flex-col items-center gap-5 sm:flex-row">
            {/* Avatar display */}
            <div className="relative shrink-0">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-green-100 dark:ring-green-900"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-teal-500 text-3xl font-bold text-white ring-4 ring-green-100 dark:ring-green-900">
                  {initial}
                </div>
              )}
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-md hover:bg-green-600 transition"
                title="Change photo"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                JPG, PNG, GIF or WebP. Max 5MB recommended.
              </p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Choose Photo
                </button>
                {avatarFile && (
                  <button
                    onClick={handleSaveAvatar}
                    disabled={savingAvatar}
                    className="flex items-center gap-1.5 rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-60 transition"
                  >
                    {savingAvatar ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Save Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Display Name Card */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-5">
            <User className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Display Name</h2>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Username: <span className="font-medium text-gray-700 dark:text-gray-300">@{user?.username}</span>
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user?.username ?? "Your display name"}
                maxLength={60}
                className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60 transition"
              >
                {savingName ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Password Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Change Password</h2>
          </div>

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="current-password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 pr-11 text-sm text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-purple-500 dark:focus:ring-purple-900"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 pr-11 text-sm text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-purple-500 dark:focus:ring-purple-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm text-gray-800 outline-none focus:ring-2 dark:text-white ${
                    confirmPassword && newPassword !== confirmPassword
                      ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:border-red-500 dark:bg-red-950 dark:focus:ring-red-900"
                      : "border-gray-300 bg-gray-50 focus:border-purple-400 focus:ring-purple-100 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-purple-500 dark:focus:ring-purple-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <button
              onClick={handleSavePassword}
              disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-1.5 rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-60 transition"
            >
              {savingPassword ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
