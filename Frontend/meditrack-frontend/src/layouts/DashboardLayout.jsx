import { useMemo, useState, useEffect } from "react";
import {
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { receptionistApi } from "../api/receptionistApi";

export default function DashboardLayout({
  title,
  subtitle,
  sidebarItems = [],
  activeKey,
  onSelect,
  user,
  onLogout,
  children,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const hospitalData = useMemo(() => {
    return receptionistApi.getHospital();
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initials = useMemo(() => {
    if (!user) return "??";
    const first = user.firstName?.[0] ?? "";
    const last = user.lastName?.[0] ?? "";
    return (first + last || user.username?.slice(0, 2) || "??").toUpperCase();
  }, [user]);

  // --- NAVIGATION COMPONENT ---
  const NavLinks = () => (
    <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              onSelect?.(item.key);
              setIsMobileOpen(false);
            }}
            title={isCollapsed ? item.label : ""}
            // --- ANIMATION CLASSES HERE ---
            className={`
              group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium 
              transition-all duration-300 ease-out
              active:scale-95 
              ${
                isActive
                  ? "bg-gradient-to-r from-blue-50 to-white text-blue-700 shadow-sm border-l-4 border-blue-600"
                  : "text-slate-500 hover:bg-blue-50/50 hover:text-blue-600 border-l-4 border-transparent"
              }
            `}
          >
            {/* ICON: Scales and rotates slightly on hover */}
            <div
              className={`
                transition-transform duration-300 
                ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-400 group-hover:text-blue-600"
                }
                group-hover:scale-110 group-hover:-rotate-3
              `}
            >
              {Icon && <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />}
            </div>

            {/* TEXT: Slides right on hover */}
            <span
              className={`
                whitespace-nowrap transition-all duration-300
                group-hover:translate-x-1
                ${
                  isCollapsed && !isMobileOpen
                    ? "opacity-0 w-0 overflow-hidden"
                    : "opacity-100 w-auto"
                }
              `}
            >
              {item.label}
            </span>

            {/* Subtle glow effect for active item */}
            {isActive && (
              <div className="absolute inset-0 rounded-xl bg-blue-400/5 pointer-events-none" />
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-[#F3F6FC] font-sans text-slate-900">
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${
          isMobileOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0"
        }
        ${isCollapsed ? "lg:w-20" : "lg:w-72"}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-[72px] border-b border-slate-100">
          <div
            className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${
              isCollapsed && !isMobileOpen
                ? "w-0 opacity-0"
                : "w-auto opacity-100"
            }`}
          >
            {/* Animated Logo Container */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-blue-200">
              <LayoutDashboard size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800 whitespace-nowrap">
              MediTrack
            </span>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <NavLinks />

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div
            className={`transition-all duration-300 ${
              isCollapsed ? "flex justify-center" : "flex items-center gap-3"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-xs font-bold font-mono">
                {new Date().getDate()}
              </span>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                isCollapsed
                  ? "w-0 opacity-0 hidden"
                  : "w-auto opacity-100 block"
              }`}
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                })}
              </p>
              <p
                className="text-sm font-semibold text-slate-700 truncate max-w-[140px]"
                title={user?.hospital?.name}
              >
                {user?.hospital?.name ?? "National Network"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300">
        <header className="sticky top-0 z-30 px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition"
            >
              <Menu size={24} />
            </button>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition duration-200"
            >
              {isCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>

            <div>
              <p className="hidden sm:block text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                {subtitle}
              </p>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-slate-800">
                {user
                  ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                    user.username
                  : "Guest User"}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {user?.role ?? "No Role"}
              </p>
            </div>

            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-200 ring-2 ring-white transition-transform group-hover:scale-105">
                {initials}
              </div>

              {/* Logout Dropdown */}
              {onLogout && (
                <div className="absolute right-0 top-full mt-2 w-32 py-1 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
