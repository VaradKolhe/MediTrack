import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Shield, Hash } from "lucide-react";
import PublicLayout from "../layouts/PublicLayout";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 max-w-md w-full p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">Please login first.</p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-500">Manage your account details securely</p>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">Full Name</p>
                  <p className="text-gray-900 font-semibold text-lg">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.name || user.username || "N/A"}
                  </p>
                </div>
              </div>

              {/* Username */}
              {user.username && (
                <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium mb-1">Username</p>
                    <p className="text-gray-900 font-semibold text-lg">{user.username}</p>
                  </div>
                </div>
              )}

              {/* Email */}
              {user.email && (
                <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium mb-1">Email</p>
                    <p className="text-gray-900 font-semibold text-lg">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Role */}
              <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">Role</p>
                  <p className="text-gray-900 font-semibold text-lg">
                    {user.role || "USER"}
                  </p>
                </div>
              </div>

              {/* User ID */}
              {user.id && (
                <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Hash className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium mb-1">User ID</p>
                    <p className="text-gray-900 font-semibold text-lg">{user.id}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                For security reasons, some account details can only be changed by contacting the administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

