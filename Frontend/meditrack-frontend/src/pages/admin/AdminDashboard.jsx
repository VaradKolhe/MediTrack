import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Users2,
  Loader2,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAdminData } from "../../hooks/useAdminData";
import { useAuth } from "../../hooks/useAuth";

import OverviewStats from "../../components/admin/OverviewStats";
import HospitalsManager from "../../components/admin/HospitalsManager";
import RoomsManager from "../../components/admin/RoomsManager";
import ReceptionistsManager from "../../components/admin/ReceptionistsManager";

const sections = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "hospitals", label: "Hospitals", icon: Building2 },
  { key: "rooms", label: "Rooms", icon: BedDouble },
  { key: "receptionists", label: "Receptionists", icon: Users2 },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const { data, isLoading, hospitalLookup, refreshData } = useAdminData();
  const [isSidebarShrunk, setIsSidebarShrunk] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarShrunk((prev) => !prev);

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewStats data={data} hospitalLookup={hospitalLookup} />;
      case "hospitals":
        return (
          <HospitalsManager
            hospitals={data.hospitals}
            onRefresh={refreshData}
          />
        );
      case "rooms":
        return (
          <RoomsManager
            rooms={data.rooms}
            hospitals={data.hospitals}
            hospitalLookup={hospitalLookup}
            onRefresh={refreshData}
          />
        );
      case "receptionists":
        return (
          <ReceptionistsManager
            receptionists={data.receptionists}
            hospitals={data.hospitals}
            hospitalLookup={hospitalLookup}
            onRefresh={refreshData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Bed Availability Control Center"
      subtitle="National hospital network"
      sidebarItems={sections}
      activeKey={activeSection}
      onSelect={setActiveSection}
      user={user}
      onLogout={() => {
        logout();
        navigate("/login", { replace: true });
      }}
    >
      <div className="bg-gradient-to-b from-white via-slate-50 to-white rounded-3xl border border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.08)] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
              Admin dashboard
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              {sections.find((s) => s.key === activeSection)?.label}
            </h2>
            <p className="text-slate-500 mt-1">
              Manage network data with a unified, light, and responsive layout.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => {
              const Icon = s.icon;
              const active = s.key === activeSection;
              return (
                <span
                  key={s.key}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border transition ${
                    active
                      ? "bg-gradient-to-r from-sky-500/10 to-cyan-500/10 text-sky-700 border-sky-200 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-sky-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="pt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
              <p className="text-sm">Fetching the latest hospital data...</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6">
              <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      Active view
                    </p>
                    <p className="font-semibold text-slate-900">
                      {sections.find((s) => s.key === activeSection)?.label}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4 space-y-4">
                <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-200 p-4 shadow-inner">
                  <p className="text-sm text-slate-600">
                    Data-driven cards and tables support sticky headers and
                    hover affordances for clarity on all views.
                  </p>
                </div>
                {renderContent()}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
