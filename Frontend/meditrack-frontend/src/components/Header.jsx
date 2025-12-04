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

  // Get username for display
  const getUsername = () => {
    if (!user) return "";
    return user.username || user.firstName || "User";
  };

  // Respect the `isTransparent` prop: on the opening page we use subtle transparency
  // with dark text; on other pages use clean white header with professional styling
  const headerClasses = isTransparent
    ? "absolute top-0 left-0 w-full z-50 text-gray-900"
    : "sticky top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-slate-200 text-slate-900";

  const desktopLinkClass = (path) =>
    isTransparent
      ? `text-sm font-medium transition ${
          location.pathname === path ? "text-gray-900 font-semibold" : "text-gray-600 hover:text-gray-900"
        }`
      : `text-sm font-semibold transition ${
          location.pathname === path ? "text-[#1D4ED8]" : "text-slate-600 hover:text-slate-900"
        }`;

  const primaryButtonClass = isTransparent
    ? "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600"
    : "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] shadow-sm";

  const loginButtonClass = "bg-[#F97316] text-white hover:bg-[#EA580C] shadow-sm";

  return (
    <header className={`${headerClasses}`} role="banner" aria-label="Main header">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-4 md:py-5">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold tracking-tight hover:opacity-80 transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-md">
              <span className="font-bold text-lg">MT</span>
            </div>
            <div className="ml-1">
              <div className={isTransparent ? "text-gray-900 font-bold text-lg" : "text-slate-900 font-bold text-lg"}>MediTrack</div>
              <p className={isTransparent ? "text-xs uppercase tracking-widest text-gray-600 font-semibold" : "text-xs uppercase tracking-widest text-slate-500 font-semibold"}>Real-Time Care</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={desktopLinkClass(link.to)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white/90">
                    Welcome {getUsername()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="px-4 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    Profile
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        profileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                    <button
                      type="button"
                      onClick={handleProfileClick}
                      className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition flex items-center gap-3 cursor-pointer"
                    >
                      <User size={16} />
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition flex items-center gap-3 cursor-pointer border-t border-white/10"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={`px-5 py-2.5 rounded-lg ${loginButtonClass} text-sm font-semibold cursor-pointer transition`}
              >
                Login
              </button>
            )}
          </div>

          <button
            type="button"
            className={isTransparent ? "md:hidden p-2 rounded-lg border border-white/30 text-white cursor-pointer hover:bg-white/10 transition" : "md:hidden p-2 rounded-lg border border-slate-300 text-slate-700 cursor-pointer hover:bg-slate-50 transition"}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white pb-4">
            <nav className="flex flex-col gap-3 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={desktopLinkClass(link.to)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-white/90">
                    Welcome {getUsername()}
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="w-full px-4 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition text-sm font-medium cursor-pointer flex items-center justify-between"
                    >
                      Profile
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          profileDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {profileDropdownOpen && (
                      <div className="mt-2 w-full bg-slate-900/95 backdrop-blur border border-white/10 rounded-xl shadow-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileOpen(false);
                            setProfileDropdownOpen(false);
                            navigate("/profile");
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition flex items-center gap-3 cursor-pointer"
                        >
                          <User size={16} />
                          Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileOpen(false);
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition flex items-center gap-3 cursor-pointer border-t border-white/10"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/login");
                  }}
                  className={`px-4 py-2 rounded-full ${loginButtonClass} cursor-pointer`}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
