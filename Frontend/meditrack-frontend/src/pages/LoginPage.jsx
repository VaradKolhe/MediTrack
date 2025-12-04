import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Lock,
  Mail,
  Shield,
  User,
  KeyRound, // Added for OTP input
  ArrowLeft, // Added for back button
} from "lucide-react";
import instance, { USER_SERVICE } from "../api/axiosConfig";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const highlights = [
  "HIPAA-grade encryption and audit trails",
  "Role-based controls for admins & receptionists",
  "Instant access to live bed dashboards",
];

const LoginPage = () => {
  const { login, user } = useAuth();
  console.log(login + " " + user);
  
  // modes: 'login', 'register', 'verify'
  const [mode, setMode] = useState("login");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    otp: "", // Added OTP field
  });

  useEffect(() => {
    if (!user) return;
    if (user.role === "ADMIN") {
      navigate("/admin", { replace: true });
    } else if (user.role === "RECEPTIONIST") {
      navigate("/receptionist", { replace: true });
    } else {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    const authPromise = (async () => {
      try {
        if (mode === "login") {
          const res = await instance.post(`${USER_SERVICE}/api/auth/login`, {
            username: form.username,
            password: form.password,
          });

          login(res.data.token, res.data.user);
          return res.data.user?.role;
        }

        if (mode === "register") {
          await instance.post(`${USER_SERVICE}/api/auth/register`, {
            username: form.username,
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName,
          });

          setMode("verify");
          return "REGISTER_SUCCESS";
        }

        if (mode === "verify") {
          await instance.post(`${USER_SERVICE}/api/auth/verify`, {
            email: form.email,
            verificationCode: form.otp,
          });

          // ⭐ AUTO-LOGIN HERE ⭐
          const loginRes = await instance.post(
            `${USER_SERVICE}/api/auth/login`,
            {
              username: form.username,
              password: form.password,
            }
          );

          login(loginRes.data.token, loginRes.data.user);
          return loginRes.data.user?.role;
        }
      } catch (err) {
        const message =
          err.response?.data?.message ||
          "Something went wrong during the process.";
        throw new Error(message);
      }
    })();

    toast.promise(authPromise, {
      loading:
        mode === "login"
          ? "Logging you in securely..."
          : mode === "register"
          ? "Creating new account..."
          : "Verifying OTP...",

      success: (result) => {
        if (result === "REGISTER_SUCCESS") {
          return "Account created! Please check your email for the OTP.";
        }

        if (result === "ADMIN") {
          navigate("/admin");
        } else if (result === "RECEPTIONIST") {
          navigate("/receptionist");
        } else {
          navigate("/home");
        }

        return "Login successful! Redirecting...";
      },

      error: (error) => error.message,
    });
  };

  // Helper title based on mode
  const getTitle = () => {
    if (mode === "login") return "Welcome back";
    if (mode === "register") return "Create an account";
    return "Verify Account";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl shadow-[0_30px_120px_rgba(2,6,23,0.7)] overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-cyan-500 via-blue-600 to-slate-900 p-10 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/80">
                    Trusted access
                  </p>
                  <p className="text-xl font-semibold">MediTrack Control</p>
                </div>
              </div>
              <h2 className="text-3xl font-semibold leading-tight">
                Synchronize every bed update with military-grade security.
              </h2>
              <p className="text-white/80 mt-4">
                Sign in to broadcast capacity, manage rooms, and coordinate
                admissions in real-time.
              </p>
              <div className="mt-8 space-y-4">
                {highlights.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    <p className="text-sm text-white/90">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">
              ISO 27001 | SOC2 | HIPAA
            </p>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white text-slate-900 p-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Access center
                </p>
                <h1 className="text-2xl font-semibold mt-1">{getTitle()}</h1>
              </div>
              <Activity className="w-7 h-7 text-cyan-500" />
            </div>

            {/* Hide Tabs when in Verify Mode */}
            {mode !== "verify" && (
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
                <button
                  type="button"
                  className={`flex-1 py-2.5 text-sm font-medium rounded-2xl transition-all cursor-pointer ${
                    mode === "login"
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setMode("login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2.5 text-sm font-medium rounded-2xl transition-all cursor-pointer ${
                    mode === "register"
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setMode("register")}
                >
                  Register
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* --- VERIFY MODE UI --- */}
              {mode === "verify" && (
                <div className="animate-fade-in space-y-4">
                  <div className="p-4 bg-cyan-50 text-cyan-900 rounded-xl text-sm mb-4">
                    Please enter the OTP sent to <strong>{form.email}</strong>.
                    It expires in 15 minutes.
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter OTP Code"
                      value={form.otp}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition placeholder:text-slate-400 text-slate-700 font-mono tracking-widest text-center text-lg"
                    />
                  </div>
                </div>
              )}

              {/* --- LOGIN/REGISTER UI --- */}
              {mode !== "verify" && (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      placeholder="Username / Medical ID"
                      value={form.username}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition placeholder:text-slate-400 text-slate-700"
                    />
                  </div>

                  {mode === "register" && (
                    <div className="relative animate-fade-in">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition placeholder:text-slate-400 text-slate-700"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition placeholder:text-slate-400 text-slate-700"
                    />
                  </div>

                  {mode === "register" && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition text-slate-700"
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition text-slate-700"
                      />
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-2xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {mode === "login"
                  ? "Secure Login"
                  : mode === "register"
                  ? "Create Account"
                  : "Verify Code"}
              </button>

              {/* Back button only visible in Verify Mode */}
              {mode === "verify" && (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="w-full mt-2 text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              )}
            </form>

            <p className="text-center text-slate-400 text-xs mt-8">
              Multi-factor authentication enforced for staff and admin access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
