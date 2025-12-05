import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Users2,
  Loader2,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAdminData } from "../../hooks/useAdminData";

// Sub-components
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
      user={null}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p>Fetching the latest hospital data...</p>
        </div>
      ) : (
        renderContent()
      )}
    </DashboardLayout>
  );
}
