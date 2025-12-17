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
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";

export default function DashboardLayout({
  sidebarItems = [],
  activeKey,
  onSelect,
  children,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();

  // FIX 1: Use state to hold the fetched hospital data
  const [hospital, setHospital] = useState(null);

  // FIX 2: Fetch data when the component mounts
  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const data = await receptionistApi.getHospital();
        setHospital(data);
      } catch (error) {
        console.error("Failed to fetch hospital info:", error);
      }
    };

    fetchHospitalData();
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <div className="min-h-screen bg-[#F3F6FC] font-sans text-slate-900">
      <Header />
      <div className="flex">
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
                {/* FIX 3: Display the fetched hospital name */}
                <p
                  className="text-sm font-semibold text-slate-700 truncate max-w-[140px]"
                  title={hospital?.name || user?.hospital?.name}
                >
                  {hospital?.name ?? user?.hospital?.name ?? "National Network"}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
