import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Users2,
  Loader2,
  Globe, // 1. Imported Globe icon
  ArrowRight, // 1. Imported Arrow icon
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 2. Handler to go to User Page
  const handleGoToUserPage = () => {
    navigate("/"); // Redirects to root/home page
  };

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
      sidebarItems={sections}
      activeKey={activeSection}
      onSelect={setActiveSection}
    >
      <div className="space-y-6">
        {/* Header Section with Badge */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-200 rounded-full mb-3">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Admin Dashboard
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {sections.find((s) => s.key === activeSection)?.label}
          </h1>
          <p className="text-slate-600 text-base">
            Manage network data with a unified, light, and responsive layout.
          </p>
        </div>

        {/* Action Bar with Tabs */}
        <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-slate-200">
          {/* View Public Site Button */}
          <button
            onClick={handleGoToUserPage}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Globe size={16} />
            View Public Site
            <ArrowRight size={14} className="opacity-70" />
          </button>

          {/* Separator */}
          <div className="hidden sm:block w-px h-8 bg-slate-300 mx-1"></div>

          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => {
              const Icon = s.icon;
              const active = s.key === activeSection;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border-2 transition-all duration-150 ease-in-out ${
                    active
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-transparent shadow-lg shadow-teal-500/25"
                      : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-teal-500" />
                <div className="absolute inset-0 w-12 h-12 rounded-full bg-teal-500/20 animate-ping"></div>
              </div>
              <p className="text-sm font-medium">
                Fetching the latest hospital data...
              </p>
            </div>
          ) : (
            <div>
              {/* Active View Badge */}
              <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                  {(() => {
                    const ActiveIcon = sections.find(
                      (s) => s.key === activeSection
                    )?.icon;
                    return ActiveIcon ? (
                      <ActiveIcon className="w-6 h-6" />
                    ) : null;
                  })()}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-teal-600 font-bold">
                    Active View
                  </p>
                  <p className="font-bold text-slate-900 text-lg">
                    {sections.find((s) => s.key === activeSection)?.label}
                  </p>
                </div>
              </div>

              {/* Info Card */}
              <div className="rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200 p-5 mb-6 shadow-sm">
                <p className="text-sm text-slate-600 leading-relaxed">
                  💡 Data-driven cards and tables support sticky headers and
                  hover affordances for clarity on all views.
                </p>
              </div>

              {/* Render Content */}
              {renderContent()}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
