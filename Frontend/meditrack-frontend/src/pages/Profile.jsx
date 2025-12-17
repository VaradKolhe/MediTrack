import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Building2,
  Save,
  X,
  Lock,
  Loader2,
  Edit3,
} from "lucide-react";
import toast from "react-hot-toast";
import PublicLayout from "../layouts/PublicLayout";
import { useAuth } from "../hooks/useAuth";
import { userApiInstance as instance } from "../api/axiosConfig";
import { userApi } from "../api/userApi"; // Imported the specific API service

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- States ---
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form State (Matches UserRequest DTO)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    hospitalId: "",
  });

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // --- 1. Fetch User Data on Mount ---
  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // Fetching current details
      const response = await instance.get(`/api/auth/me`);
      const data = response.data;

      setProfileData(data);

      // Initialize form with fetched data
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        username: data.username || "",
        email: data.email || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Handle Generic Profile Update ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    // Send update with null password (backend should ignore null passwords)
    await sendUpdateApi({ ...formData, password: null });
    setIsEditing(false);
  };

  // --- 3. Handle Password Change ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    // Send update with the new password + existing form data
    await sendUpdateApi({ ...formData, password: passwordForm.newPassword });

    // Reset and Close
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setIsPasswordModalOpen(false);
  };

  // --- Common API Call ---
  const sendUpdateApi = async (payload) => {
    try {
      // Ensure specific fields like hospitalId are Numbers (Long in Java)
      const apiPayload = {
        ...payload,
        hospitalId: payload.hospitalId ? Number(payload.hospitalId) : null,
      };

      // Using the specific function as requested
      await userApi.updateUserDetails(user.id, apiPayload);

      toast.success("Profile updated successfully!");
      fetchUserProfile(); // Refresh data to show latest state
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  };

  // --- Loading State ---
  if (!user) return null;

  return (
    <PublicLayout>
      <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
                {/* --- Left Sidebar: Avatar & Status --- */}
                <div className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col items-center gap-6">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white uppercase">
                    {profileData?.firstName?.[0] ||
                      profileData?.username?.[0] ||
                      "U"}
                  </div>

                  <div className="text-center space-y-1">
                    <h1 className="text-xl font-bold text-slate-900">
                      {profileData?.firstName} {profileData?.lastName}
                    </h1>
                    <p className="text-slate-500 text-sm">
                      @{profileData?.username}
                    </p>
                  </div>

                  <div className="w-full space-y-3">
                    <div className="bg-white/60 p-3 rounded-xl border border-slate-200 text-center">
                      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                        Role
                      </p>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Shield size={12} />
                        {profileData?.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* --- Right Content: Form --- */}
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                      Account Details
                    </h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition font-medium"
                      >
                        <Edit3 size={18} /> Edit Profile
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          First Name
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                          />
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                firstName: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Last Name
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                          />
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lastName: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          />
                        </div>
                      </div>

                      {/* Username */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Username
                        </label>
                        <div className="relative">
                          <Shield
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                          />
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={formData.username}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                username: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          />
                        </div>
                      </div>

                      {/* Email (Always Read-Only) */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                          />
                          <input
                            type="email"
                            disabled={true}
                            value={formData.email}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                            title="Email cannot be changed"
                          />
                        </div>
                      </div>
                      
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4 justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2"
                      >
                        <Lock size={16} /> Change Password
                      </button>

                      {isEditing && (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              fetchUserProfile(); // Reset form
                            }}
                            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md transition flex items-center gap-2"
                          >
                            <Save size={18} /> Save Changes
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Password Change Modal --- */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Change Password
              </h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Re-enter new password"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
