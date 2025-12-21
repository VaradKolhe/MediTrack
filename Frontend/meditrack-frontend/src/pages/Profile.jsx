import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Save,
  X,
  Lock,
  Loader2,
  Edit3,
  Building2,
  CheckCircle2,
  KeyRound,
  Calendar, // Added Calendar icon
} from "lucide-react";
import toast from "react-hot-toast";
import PublicLayout from "../layouts/PublicLayout";
import { useAuth } from "../hooks/useAuth";
import { userApiInstance as instance } from "../api/axiosConfig";
import { userApi } from "../api/userApi";
import { receptionistApi } from "../api/receptionistApi";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- States ---
  const [profileData, setProfileData] = useState(null);
  const [hospitalData, setHospitalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form State
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

  // --- Helper: Format Date ---
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // --- 1. Fetch User Data on Mount ---
  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await instance.get(`/api/auth/me`);
      const data = response.data;

      setProfileData(data);
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        username: data.username || "",
        email: data.email || "",
      });

      if (data.role === "RECEPTIONIST") {
        try {
          const hospRes = await receptionistApi.getHospital();
          setHospitalData(hospRes);
        } catch (err) {
          console.error("Could not fetch hospital info", err);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Update Profile ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await sendUpdateApi({ ...formData, password: null });
    setIsEditing(false);
  };

  // --- 3. Change Password ---
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
    await sendUpdateApi({ ...formData, password: passwordForm.newPassword });
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setIsPasswordModalOpen(false);
  };

  // --- Common API Call ---
  const sendUpdateApi = async (payload) => {
    try {
      const apiPayload = {
        ...payload,
        hospitalId: payload.hospitalId ? Number(payload.hospitalId) : null,
      };
      await userApi.updateUserDetails(user.id, apiPayload);
      toast.success("Profile updated successfully!");
      fetchUserProfile();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  };

  if (!user) return null;

  return (
    <PublicLayout fullBleed={true}>
      {/* 1. Inject Animation Styles Locally */}
      <style>{`
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* 2. Main Container with Responsive Height */}
      <div className="relative w-full min-h-[calc(100vh-85px)] py-12 px-4 overflow-hidden flex justify-center">
        {/* Animated Gradient Background (Fixed z-index) */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(-45deg, #f0fdfa, #cffafe, #e0f2fe, #f1f5f9)",
            backgroundSize: "400% 400%",
            animation: "gradient-flow 15s ease infinite",
          }}
        />

        <div className="relative z-10 w-full max-w-5xl space-y-6">
          {/* Back Button */}
          <div>
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors px-3 py-2 rounded-lg hover:bg-white/60 backdrop-blur-sm"
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 min-h-[400px]">
              <Loader2 className="animate-spin text-teal-600" size={48} />
              <p className="text-slate-400 mt-4 font-medium animate-pulse">
                Loading profile...
              </p>
            </div>
          ) : (
            // Flex container without fixed height to solve the "huge gap" issue
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
              {/* --- Left Sidebar --- */}
              <div className="lg:w-[360px] bg-gradient-to-br from-teal-600 to-cyan-700 p-8 lg:p-10 text-white relative overflow-hidden flex flex-col items-center text-center shrink-0">
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-900/20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center w-full h-full">
                  <div className="w-36 h-36 rounded-full bg-white/20 backdrop-blur-md p-1.5 mb-6 shadow-2xl ring-4 ring-white/10">
                    <div className="w-full h-full rounded-full bg-white text-teal-700 flex items-center justify-center text-6xl font-black uppercase shadow-inner">
                      {profileData?.firstName?.[0] ||
                        profileData?.username?.[0] ||
                        "U"}
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight mb-2">
                    {profileData?.firstName} {profileData?.lastName}
                  </h1>
                  <p className="text-teal-100 font-medium text-base mb-6 opacity-90">
                    @{profileData?.username}
                  </p>

                  <div className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 mb-4">
                    <p className="text-xs uppercase tracking-widest text-teal-200 font-bold mb-3">
                      Role & Access
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-teal-800 font-bold text-sm shadow-sm">
                      <Shield size={16} className="text-teal-600" />
                      {profileData?.role}
                    </div>
                  </div>

                  {/* Member Since Section */}
                  {profileData?.createdAt && (
                    <div className="flex items-center gap-2 text-teal-100 text-sm font-medium opacity-80 mb-auto">
                      <Calendar size={14} />
                      <span>
                        Member since {formatDate(profileData.createdAt)}
                      </span>
                    </div>
                  )}

                  {/* Spacer if no date */}
                  {!profileData?.createdAt && <div className="flex-1"></div>}

                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="w-full mt-8 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-3 text-sm font-bold group"
                  >
                    <KeyRound
                      size={18}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    Change Password
                  </button>
                </div>
              </div>

              {/* --- Right Content: Form --- */}
              <div className="flex-1 p-8 lg:p-12 bg-white relative flex flex-col">
                <div className="flex flex-wrap justify-between items-center mb-8 border-b border-slate-100 pb-6 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800">
                      Profile Settings
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                      View and update your personal information
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-5 py-2.5 rounded-xl transition font-semibold text-sm border border-transparent hover:border-teal-100"
                    >
                      <Edit3 size={18} /> Edit Details
                    </button>
                  )}
                </div>

                <form
                  onSubmit={handleProfileUpdate}
                  className="space-y-8 flex-1 flex flex-col"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* First Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                        First Name
                      </label>
                      <div className="relative group">
                        <User
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={20}
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
                          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 disabled:bg-slate-50 disabled:text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                        Last Name
                      </label>
                      <div className="relative group">
                        <User
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={20}
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
                          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 disabled:bg-slate-50 disabled:text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                        Username
                      </label>
                      <div className="relative group">
                        <Shield
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={20}
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
                          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 disabled:bg-slate-50 disabled:text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={20}
                        />
                        <input
                          type="email"
                          disabled
                          value={formData.email}
                          className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Lock size={16} className="text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- HOSPITAL SECTION (Receptionist Only) --- */}
                  {profileData?.role === "RECEPTIONIST" && (
                    <div className="mt-8 pt-8 border-t border-slate-100">
                      <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm text-teal-600">
                          <Building2 size={28} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Assigned Hospital
                          </p>
                          {hospitalData ? (
                            <div>
                              <h4 className="text-xl font-bold text-slate-800">
                                {hospitalData.name}
                              </h4>
                              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                {hospitalData.city}, {hospitalData.state}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400 italic">
                              No hospital assigned or loading...
                            </p>
                          )}
                        </div>
                        <div className="ml-auto">
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200 tracking-wide uppercase">
                            Read-Only
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {isEditing && (
                    <div className="pt-8 flex justify-end gap-4 animate-in fade-in slide-in-from-bottom-2 mt-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          fetchUserProfile();
                        }}
                        className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold hover:shadow-lg hover:shadow-teal-500/25 transition flex items-center gap-2 transform hover:-translate-y-0.5"
                      >
                        <Save size={20} /> Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Password Modal --- */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Change Password
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  Secure your account
                </p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition font-medium"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition font-medium"
                  placeholder="Re-enter password"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/20 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
