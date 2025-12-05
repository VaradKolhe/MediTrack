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
        <div className="min-h-screen flex items-center justify-center px-4">
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
      <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-5xl mx-auto space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
              <div className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col items-center gap-6">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">
                  {user.firstName?.[0]?.toUpperCase() ||
                    user.username?.[0]?.toUpperCase() ||
                    "U"}
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                    Profile
                  </p>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.name || user.username || "My Profile"}
                  </h1>
                  <p className="text-slate-600 text-sm">
                    Manage your account details securely.
                  </p>
                </div>
                <div className="w-full space-y-2">
                  <div className="rounded-2xl bg-white/70 border border-slate-200 px-4 py-3 text-center shadow-sm">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      Status
                    </p>
                    <p className="text-sm font-semibold text-slate-900">Active</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 border border-slate-200 px-4 py-3 text-center shadow-sm">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      Role
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {user.role || "USER"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex items-start gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        Full Name
                      </p>
                      <p className="text-slate-900 font-semibold text-lg">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.name || user.username || "N/A"}
                      </p>
                    </div>
                  </div>

                  {user.username && (
                    <div className="flex items-start gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 font-medium mb-1">
                          Username
                        </p>
                        <p className="text-slate-900 font-semibold text-lg">
                          {user.username}
                        </p>
                      </div>
                    </div>
                  )}

                  {user.email && (
                    <div className="flex items-start gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 font-medium mb-1">
                          Email
                        </p>
                        <p className="text-slate-900 font-semibold text-lg">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        Role
                      </p>
                      <p className="text-slate-900 font-semibold text-lg">
                        {user.role || "USER"}
                      </p>
                    </div>
                  </div>

                  {user.id && (
                    <div className="flex items-start gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Hash className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 font-medium mb-1">
                          User ID
                        </p>
                        <p className="text-slate-900 font-semibold text-lg">
                          {user.id}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-sm text-slate-500">
                    For security reasons, some account details can only be changed
                    by contacting the administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

