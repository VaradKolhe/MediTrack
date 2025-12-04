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

  const headerClasses = isTransparent
    ? "absolute top-0 left-0 w-full text-white"
    : "bg-slate-950/90 backdrop-blur border-b border-white/10 text-white sticky top-0";

  const desktopLinkClass = (path) =>
    `text-sm font-medium transition ${
      location.pathname === path
        ? "text-white"
        : "text-white/70 hover:text-white"
    }`;

  const actionButtonClass =
    "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950";

  return (
    <header className={`${headerClasses} z-40`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950">
              MT
            </div>
            <div className="text-base leading-tight">
              MediTrack
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Real-time care
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
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

          <div className="hidden md:flex items-center gap-3">
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
                className={`px-4 py-2 rounded-full ${actionButtonClass} text-sm font-semibold shadow-sm hover:opacity-90 cursor-pointer`}
              >
                Login
              </button>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg border border-white/30 text-white cursor-pointer"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 pb-4">
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
                  className={`px-4 py-2 rounded-full ${actionButtonClass} cursor-pointer`}
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
