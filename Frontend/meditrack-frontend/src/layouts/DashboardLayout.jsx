import { useState, useEffect } from "react";
import Header from "../components/Header";

export default function DashboardLayout({
  sidebarItems = [],
  activeKey,
  onSelect,
  children,
}) {
  // We keep this to close sidebar on mobile if window resizes,
  // though we primarily rely on the Header for mobile nav now.
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* 1. The Normal Header */}
      <Header />

      <div className="flex flex-1 relative">
        {/* Mobile Backdrop (Optional, if you want the sidebar to be openable on mobile) */}
        <div
          className={`fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
            isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileOpen(false)}
        />

        {/* 2. THE SIDEBAR 
          - Sticky position to stay in view while scrolling content.
          - Top-0 (relative to flex container) but practically fits under header.
          - Height is calculated to fill screen minus header.
        */}
        <aside
          className={`
            fixed lg:sticky top-[85px] z-40
            h-[calc(100vh-85px)] overflow-y-auto
            w-72 bg-white/95 backdrop-blur-xl border-r border-teal-100/60
            transition-transform duration-300 ease-in-out
            shadow-[4px_0_24px_-12px_rgba(20,184,166,0.08)]
            ${
              isMobileOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
        >
          <nav className="p-5 space-y-3">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === activeKey;

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onSelect?.(item.key);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    relative w-full flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium
                    transition-all duration-300 group
                    ${
                      isActive
                        ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25"
                        : "text-slate-600 hover:bg-teal-50/60 hover:shadow-sm"
                    }
                  `}
                >
                  {/* Icon Container with Border */}
                  <div
                    className={`
                      flex items-center justify-center w-11 h-11 rounded-lg border-2
                      transition-all duration-75
                      ${
                        isActive
                          ? "bg-white/20 border-white/30 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-teal-500 group-hover:border-teal-500 group-hover:text-white group-hover:scale-105"
                      }
                    `}
                  >
                    {Icon && (
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    )}
                  </div>

                  {/* Label */}
                  <span className="tracking-wide flex-1 text-left">
                    {item.label}
                  </span>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-white shadow-sm animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* 3. MAIN CONTENT */}
        <main className="flex-1 w-full min-w-0 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
