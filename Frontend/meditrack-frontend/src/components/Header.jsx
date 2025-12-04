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
              <>
                <button
                  type="button"
                  onClick={() => navigate(dashboardPath)}
                  className={isTransparent ? "px-5 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition text-sm font-semibold cursor-pointer" : "px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-sm font-semibold cursor-pointer"}
                >
                  My Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`px-5 py-2.5 rounded-lg ${primaryButtonClass} text-sm font-semibold cursor-pointer transition`}
                >
                  Logout
                </button>
              </>
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
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate(dashboardPath);
                    }}
                    className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 cursor-pointer"
                  >
                    My Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className={`px-4 py-2 rounded-full ${primaryButtonClass} cursor-pointer`}
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

