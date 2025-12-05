import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Lock,
  Mail,
  Shield,
  User,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import instance, { USER_SERVICE } from "../api/axiosConfig";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

// --- FRAMER MOTION VARIANTS ---

// 1. Container for the whole Login/Register Card
const cardContainerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

// 2. Variants for the content inside the side hero panel (staggered effect)
const heroItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
};

// 3. Variants for the entire form panel (slides in from the right)
const formPanelVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut", delay: 0.2 } },
};

// 4. Variants for each input field (staggered entry)
const inputItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.3 } },
};

const highlights = [
  "HIPAA-grade encryption and audit trails",
  "Role-based controls for admins & receptionists",
  "Instant access to live bed dashboards",
];

const LoginPage = () => {
  const { login, user } = useAuth();

  const [mode, setMode] = useState("login");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    otp: "",
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

          // AuthResponse structure: {token, id, username, email, firstName, lastName, role}
          // For receptionists, hospitalId is in the JWT token (from hospitalservice)
          let hospitalId = null;
          if (res.data.role === "RECEPTIONIST" && res.data.token) {
            try {
              const decoded = jwtDecode(res.data.token);
              hospitalId = decoded.hospitalId || null;
            } catch (e) {
              console.warn("Failed to decode receptionist token", e);
            }
          }

          // Ensure role is a string (handle enum serialization)
          const role = typeof res.data.role === 'string' 
            ? res.data.role 
            : res.data.role?.name || res.data.role || 'USER';

          const userData = {
            id: res.data.id,
            username: res.data.username,
            email: res.data.email,
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            role: role,
            hospitalId: hospitalId,
          };

          login(res.data.token, userData);
          return role;
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

          const loginRes = await instance.post(
            `${USER_SERVICE}/api/auth/login`,
            {
              username: form.username,
              password: form.password,
            }
          );

          // AuthResponse structure: {token, id, username, email, firstName, lastName, role}
          // For receptionists, hospitalId is in the JWT token (from hospitalservice)
          let hospitalId = null;
          if (loginRes.data.role === "RECEPTIONIST" && loginRes.data.token) {
            try {
              const decoded = jwtDecode(loginRes.data.token);
              hospitalId = decoded.hospitalId || null;
            } catch (e) {
              console.warn("Failed to decode receptionist token", e);
            }
          }

          // Ensure role is a string (handle enum serialization)
          const role = typeof loginRes.data.role === 'string' 
            ? loginRes.data.role 
            : loginRes.data.role?.name || loginRes.data.role || 'USER';

          const userData = {
            id: loginRes.data.id,
            username: loginRes.data.username,
            email: loginRes.data.email,
            firstName: loginRes.data.firstName,
            lastName: loginRes.data.lastName,
            role: role,
            hospitalId: hospitalId,
          };

          login(loginRes.data.token, userData);
          return role;
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

        // result is the role string (e.g., "ADMIN", "RECEPTIONIST", "USER")
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

  const getTitle = () => {
    if (mode === "login") return "Welcome back";
    if (mode === "register") return "Create an account";
    return "Verify Account";
  };

  return (
    <div
      className="min-h-screen text-slate-900 flex items-center justify-center px-4 py-10 relative"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.80)), url('/images/meditrack-login-hero.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.06)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          pointerEvents: "none",
        }}
      />
      {/* 1. Main Card Animation: Fade in and Scale */}
      <motion.div
        className="relative w-full max-w-5xl bg-white/10 rounded-[32px] shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-white/20 overflow-hidden backdrop-blur"
        variants={cardContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid md:grid-cols-2">
          {/* Left Panel: Hero Content with Staggered Entrance */}
          <motion.div
            className="bg-gradient-to-br from-[#EBF8FF] via-white to-[#E0F2FE] p-12 text-slate-900 flex flex-col justify-between border-r border-slate-200"
            variants={cardContainerVariants} // Use same container variant for staggering
          >
            <div>
              {/* Logo/Header */}
              <motion.div className="flex items-center gap-3 mb-8" variants={heroItemVariants}>
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-200">
                  <Shield className="w-6 h-6 text-[#1D4ED8]" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    Trusted access
                  </p>
                  <p className="text-xl font-semibold text-slate-900">
                    MediTrack Control
                  </p>
                </div>
              </motion.div>
              {/* Headline */}
              <motion.h2 className="text-4xl font-extrabold leading-tight text-slate-900" variants={heroItemVariants}>
                Synchronize every bed update with confidence.
              </motion.h2>
              {/* Subtext */}
              <motion.p className="text-slate-600 mt-4 text-base leading-relaxed" variants={heroItemVariants}>
                Sign in to broadcast capacity, manage rooms, and coordinate
                admissions in real-time on a secure, modern interface.
              </motion.p>
              {/* Highlights */}
              <motion.div className="mt-8 space-y-4" variants={cardContainerVariants}> {/* Stagger the list */}
                {highlights.map((item, index) => (
                  <motion.div key={item} className="flex items-center gap-3" variants={heroItemVariants} transition={{ delay: 0.1 * index }}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <p className="text-sm text-slate-700">{item}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            {/* Footer Text */}
            <motion.p className="text-xs uppercase tracking-[0.3em] text-slate-500" variants={heroItemVariants}>
              ISO 27001 | SOC2 | HIPAA
            </motion.p>
          </motion.div>

          {/* Right Panel: Form Content with Slide-in */}
          <motion.div
            className="bg-white text-slate-900 p-10 flex flex-col gap-8"
            variants={formPanelVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Logo/Header */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  MediTrack
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  Secure Access
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Access center
                </p>
                {/* Title */}
                <h1 className="text-2xl font-semibold mt-1">{getTitle()}</h1>
              </div>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }} // Quick wiggle animation
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }} // Wiggle every 5 seconds
              >
                <Activity className="w-7 h-7 text-[#1D4ED8]" />
              </motion.div>
            </div>

            {/* Mode Switcher */}
            {mode !== "verify" && (
              <motion.div className="flex bg-slate-100 p-1 rounded-2xl w-full max-w-md" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, type: "spring", stiffness: 150 }}>
                <motion.button
                  type="button"
                  className={`flex-1 py-3 text-sm font-medium rounded-2xl transition-all cursor-pointer ${
                    mode === "login"
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setMode("login")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Login
                </motion.button>
                <motion.button
                  type="button"
                  className={`flex-1 py-3 text-sm font-medium rounded-2xl transition-all cursor-pointer ${
                    mode === "register"
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setMode("register")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Register
                </motion.button>
              </motion.div>
            )}

            {/* Form */}
            <motion.form
                onSubmit={handleSubmit}
                className="space-y-5"
                key={mode} // Key change causes the entire form to re-render and re-animate when mode changes
                initial="hidden"
                animate="visible"
                variants={cardContainerVariants} // Use container for staggered inputs
            >
              {/* Verify Mode */}
              {mode === "verify" && (
                <motion.div className="space-y-4" variants={inputItemVariants}>
                  <div className="p-4 bg-[#ECFEFF] text-cyan-900 rounded-xl text-sm border border-cyan-100">
                    Please enter the OTP sent to <strong>{form.email}</strong>.
                    It expires in 15 minutes.
                  </div>
                  <motion.div className="relative" whileFocus={{ scale: 1.01 }}>
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
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 focus:border-transparent transition placeholder:text-slate-400 text-slate-700 font-mono tracking-widest text-center text-lg"
                    />
                  </motion.div>
                </motion.div>
              )}

              {/* Login/Register Fields */}
              {mode !== "verify" && (
                <>
                  <motion.div className="relative" variants={inputItemVariants} whileFocus={{ scale: 1.01 }}>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      required
                      className="peer w-full px-4 pt-5 pb-2 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition placeholder-transparent"
                      placeholder="Username / Medical ID"
                    />
                    <label className="pointer-events-none absolute left-4 top-3 text-sm text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-sky-600">
                      <span className="inline-flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        Username / Medical ID
                      </span>
                    </label>
                  </motion.div>

                  {mode === "register" && (
                    <motion.div className="relative" variants={inputItemVariants} whileFocus={{ scale: 1.01 }}>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="peer w-full px-4 pt-5 pb-2 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition placeholder-transparent"
                        placeholder="Email Address"
                      />
                      <label className="pointer-events-none absolute left-4 top-3 text-sm text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-sky-600">
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          Email Address
                        </span>
                      </label>
                    </motion.div>
                  )}

                  <motion.div className="relative" variants={inputItemVariants} whileFocus={{ scale: 1.01 }}>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="peer w-full px-4 pt-5 pb-2 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition placeholder-transparent"
                      placeholder="Password"
                    />
                    <label className="pointer-events-none absolute left-4 top-3 text-sm text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-sky-600">
                      <span className="inline-flex items-center gap-2">
                        <Lock className="h-4 w-4 text-slate-400" />
                        Password
                      </span>
                    </label>
                  </motion.div>

                  {mode === "register" && (
                    <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={inputItemVariants}>
                      <motion.input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/25 focus:border-transparent transition text-slate-700"
                        whileFocus={{ scale: 1.01 }}
                      />
                      <motion.input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/25 focus:border-transparent transition text-slate-700"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </motion.div>
                  )}
                </>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="w-full bg-[#1D4ED8] text-white font-semibold py-4 rounded-2xl hover:bg-[#1B46C2] focus:ring-4 focus:ring-[#93C5FD]/70 transition flex items-center justify-center gap-2 cursor-pointer text-lg shadow-sm"
                variants={inputItemVariants} // Animate with the rest of the form
                whileHover={{ scale: 1.015, boxShadow: "0 10px 20px rgba(29, 78, 216, 0.4)" }} // Lift and shadow
                whileTap={{ scale: 0.98, boxShadow: "0 5px 15px rgba(29, 78, 216, 0.2)" }} // Press down effect
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {mode === "login"
                  ? "Secure Login"
                  : mode === "register"
                  ? "Create Account"
                  : "Verify Code"}
              </motion.button>

              {/* Back to Login Button */}
              {mode === "verify" && (
                <motion.button
                  type="button"
                  onClick={() => setMode("login")}
                  className="w-full mt-2 text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                  variants={inputItemVariants} // Animate with the rest of the form
                  whileHover={{ scale: 1.01, color: "#1E293B" }}
                  whileTap={{ scale: 0.99 }}
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </motion.button>
              )}
            </motion.form>

            <motion.p className="text-center text-slate-400 text-xs mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
              Multi-factor authentication enforced for staff and admin access.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;