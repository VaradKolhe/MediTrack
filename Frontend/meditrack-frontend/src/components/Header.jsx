import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navLinks = [
  { label: "Overview", to: "/" },
  { label: "Hospitals", to: "/home" },
  { label: "Login", to: "/login" },
];

export default function Header({ isTransparent = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath = useMemo(() => {
    if (user?.role === "ADMIN") return "/admin";
    if (user?.role === "RECEPTIONIST") return "/receptionist";
    return "/home";
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
              <>
                <button
                  type="button"
                  onClick={() => navigate(dashboardPath)}
                  className="px-4 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition text-sm font-medium cursor-pointer"
                >
                  My Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-full ${actionButtonClass} text-sm font-semibold shadow-sm hover:opacity-90 cursor-pointer`}
                >
                  Logout
                </button>
              </>
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
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate(dashboardPath);
                    }}
                    className="px-4 py-2 rounded-full border border-white/20 text-white cursor-pointer"
                  >
                    My Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className={`px-4 py-2 rounded-full ${actionButtonClass} cursor-pointer`}
                  >
                    Logout
                  </button>
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

