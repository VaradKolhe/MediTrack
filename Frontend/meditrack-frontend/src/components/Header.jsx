import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navLinks = [
  { label: "Overview", to: "/" },
  { label: "Hospitals", to: "/home" },
];

export default function Header({ isTransparent = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Check if user is Admin and NOT on admin pages
  const isAdmin = user?.role === "ADMIN";
  const isOnAdminPage = location.pathname.startsWith("/admin");

  const handleLogout = () => {
    logout();
    navigate("/login");
    setProfileDropdownOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setProfileDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const getUsersname = () => {
    if (!user) return "";
    const fullname =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.name || user.username || "User";
    return fullname;
  };

  // --- STYLES ---
  const headerClasses =
    "sticky top-0 left-0 w-full h-[85px] z-50 transition-all duration-300 border-b " +
    (isTransparent
      ? "bg-white/70 backdrop-blur-xl border-teal-100/50 shadow-sm"
      : "bg-white/90 backdrop-blur-xl border-teal-100/80 shadow-[0_4px_20px_-4px_rgba(20,184,166,0.1)]");

  const loginButtonClass =
    "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-105 transition-all duration-300";

  return (
    <header className={headerClasses} role="banner">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-teal-500/40 transition-all duration-300 overflow-hidden">
              <img
                src="/icon.png"
                alt="MediTrack Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 font-bold text-xl leading-none tracking-tight">
                MediTrack
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-teal-600 font-bold mt-1">
                Real-Time Care
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-2 bg-slate-50/80 backdrop-blur-sm p-2 rounded-2xl border border-slate-200/60 shadow-sm">
            {navLinks.map((l) => {
              const isActive = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center
                  ${
                    isActive
                      ? "bg-gradient-to-r from-teal-100 to-cyan-300 text-white shadow-lg shadow-teal-50"
                      : "text-slate-600 hover:bg-cyan-100/60 hover:text-teal-700"
                  }
                  `}>
                  {l.label}
                </Link>
              );
            })}

            {/* ADMIN DASHBOARD LINK (Desktop) */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center gap-2
                ${
                  isOnAdminPage
                    ? "bg-gradient-to-r from-amber-50 to-orange-100 text-white shadow-lg shadow-amber-50"
                    : "text-amber-600 hover:bg-amber-50/80 hover:text-amber-700"
                }
                `}
              >
                <LayoutDashboard size={16} />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* RIGHT SIDE ACTIONS */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 pl-5 pr-3 py-2 rounded-2xl border border-slate-200/80 bg-white hover:border-teal-300 hover:shadow-md hover:shadow-teal-500/10 transition-all duration-300 group"
                >
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-xs text-teal-600 font-semibold tracking-wide">
                      {user.role === "ADMIN" ? "Welcome Admin" : "Welcome"}
                    </span>
                    <span className="text-sm font-bold text-slate-800 leading-none">
                      {getUsersname()}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/50 flex items-center justify-center text-teal-600 group-hover:from-teal-500 group-hover:to-cyan-500 group-hover:text-white transition-all duration-300">
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-300 ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* DROPDOWN */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-5 py-4 bg-gradient-to-br from-teal-50 to-cyan-50 border-b border-teal-100">
                      <p className="text-sm font-bold text-slate-900">
                        {getUsersname()}
                      </p>
                      <p className="text-xs text-teal-600 font-semibold mt-0.5 uppercase tracking-wide">
                        {user.role}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={handleProfileClick}
                        className="w-full px-4 py-3 rounded-xl text-left text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-all duration-200 flex items-center gap-3 font-semibold"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                          <User size={16} />
                        </div>
                        My Profile
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-4 py-3 rounded-xl text-left text-sm text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center gap-3 font-semibold"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                          <LogOut size={16} />
                        </div>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={`px-7 py-2.5 rounded-xl ${loginButtonClass} text-sm font-bold tracking-wide cursor-pointer`}
              >
                Login
              </button>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            type="button"
            className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-all duration-200"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="md:hidden border-t border-teal-100 bg-white/95 backdrop-blur-xl pb-6 shadow-2xl shadow-slate-900/5 animate-in slide-in-from-top-5 duration-300">
            <nav className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`px-5 py-3.5 rounded-xl text-base font-semibold flex items-center justify-between transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25"
                        : "text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-white/90 shadow-sm animate-pulse"></div>
                    )}
                  </Link>
                );
              })}

              {/* ADMIN DASHBOARD LINK (Mobile) */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="px-5 py-3.5 rounded-xl text-base font-semibold flex items-center justify-between gap-2 text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all duration-200"
                >
                  <span>Admin Dashboard</span>
                  <LayoutDashboard size={18} />
                </Link>
              )}
            </nav>

            <div className="px-4 pt-3 border-t border-teal-100 mt-2">
              {user ? (
                <div className="flex flex-col gap-3 mt-3">
                  <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100">
                    <p className="text-sm font-bold text-slate-900">
                      {getUsersname()}
                    </p>
                    <p className="text-xs text-teal-600 font-semibold mt-0.5 uppercase tracking-wide">
                      {user.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center gap-3 w-full px-5 py-3.5 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-all duration-200"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/login");
                  }}
                  className={`w-full mt-4 py-3.5 rounded-xl ${loginButtonClass} text-base font-bold`}
                >
                  Login to Account
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
