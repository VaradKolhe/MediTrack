import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
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

  // Header Container
  const headerClasses =
    "sticky top-0 left-0 w-full z-50 transition-all duration-300 border-b " +
    (isTransparent
      ? "bg-white/50 backdrop-blur-md border-slate-200/50"
      : "bg-white/60 backdrop-blur-md border-slate-200 shadow-sm");

  const loginButtonClass =
    "bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow transition-all duration-200";

  return (
    <header className={headerClasses} role="banner">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-3">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-15 h-15 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200 overflow-hidden">
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
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-1">
                Real-Time Care
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV - IMPROVED BUTTONS */}
          <nav className="hidden md:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/60">
            {navLinks.map((l) => {
              const isActive = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`
                    relative px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-out
                    flex items-center justify-center
                    ${
                      isActive
                        ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                    }
                  `}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE ACTIONS */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 pl-4 pr-2 py-1.5 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200 group"
                >
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-xs text-slate-500 font-medium">
                      Welcome back
                    </span>
                    <span className="text-sm font-bold text-slate-800 leading-none">
                      {getUsersname()}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <User size={16} />
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* DROPDOWN */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">
                        {getUsersname()}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={handleProfileClick}
                        className="w-full px-3 py-2.5 rounded-xl text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-3 font-medium"
                      >
                        <User size={16} className="text-slate-400" />
                        My Profile
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-3 py-2.5 rounded-xl text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 font-medium"
                      >
                        <LogOut size={16} />
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
                className={`px-6 py-2.5 rounded-full ${loginButtonClass} text-sm font-semibold tracking-wide cursor-pointer`}
              >
                Login
              </button>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white pb-6 shadow-xl animate-in slide-in-from-top-5">
            <nav className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base font-semibold flex items-center justify-between ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 pt-2 border-t border-slate-100">
              {user ? (
                <div className="flex flex-col gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/login");
                  }}
                  className={`w-full mt-4 py-3 rounded-xl ${loginButtonClass} text-base font-semibold`}
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
