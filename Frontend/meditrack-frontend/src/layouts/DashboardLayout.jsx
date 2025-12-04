import { useMemo, useState } from "react";
import { LogOut, Menu } from "lucide-react";

const baseSidebarWidth = {
  expanded: "w-72",
  collapsed: "w-20",
};

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

  const initials = useMemo(() => {
    if (!user) return "??";
    const first = user.firstName?.[0] ?? "";
    const last = user.lastName?.[0] ?? "";
    return (first + last || user.username?.slice(0, 2) || "??").toUpperCase();
  }, [user]);

  return (
    <div className="min-h-screen flex bg-[#F3F6FC] text-slate-900">
      <aside
        className={`hidden lg:flex flex-col bg-white text-slate-900 border-r border-slate-200 transition-all duration-300 ${
          isCollapsed ? baseSidebarWidth.collapsed : baseSidebarWidth.expanded
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div
            className={`text-lg font-semibold tracking-tight ${
              isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            MediTrack Admin
          </div>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-600"
            onClick={() => setIsCollapsed((prev) => !prev)}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect?.(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-[#1D4ED8]/10 text-[#1D4ED8]"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {Icon && <Icon size={18} />}
                <span
                  className={`truncate ${
                    isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="px-5 py-6 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-sm font-semibold mt-1 text-slate-900">
            {user?.hospital?.name ?? "National Network"}
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-slate-200 px-6 lg:px-10 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {subtitle}
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setIsCollapsed((prev) => !prev)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
              >
                <Menu size={20} />
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {user
                  ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                    user.username
                  : "Guest"}
              </p>
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                {user?.role ?? "UNAUTHENTICATED"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-semibold">
              {initials}
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-slate-600"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}


