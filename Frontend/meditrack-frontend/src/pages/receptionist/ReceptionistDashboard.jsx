import { useEffect } from "react";
import { ClipboardList, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";

const sections = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "queue", label: "Admissions Queue", icon: ClipboardList },
];

export default function ReceptionistDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role !== "RECEPTIONIST") {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  if (!user || user.role !== "RECEPTIONIST") {
    return null;
  }

  return (
    <DashboardLayout
      title="Reception Portal"
      subtitle="Fast-track admission workflow"
      sidebarItems={sections}
      activeKey="overview"
      user={user}
      onLogout={() => {
        logout();
        navigate("/login", { replace: true });
      }}
    >
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto mt-3">
            The receptionist dashboard will soon let you admit patients, update
            bed statuses, and coordinate with the admin team. For now, please
            reach out to the administrator to manage rooms or beds.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}


