import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Users } from "lucide-react"; // 1. Added Users Icon
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { receptionistApi } from "../../api/receptionistApi";

// Components
import ReceptionistStats from "../../components/receptionist/ReceptionistStats";
import AdmissionForm from "../../components/receptionist/AdmissionForm";
import RoomList from "../../components/receptionist/RoomList";
import PatientList from "../../components/receptionist/PatientList";
import PatientManagement from "../../components/receptionist/PatientManagement";

// 3. Update Navigation Items
const sections = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "patients", label: "Patient Management", icon: Users },
];

export default function ReceptionistDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 4. State for controlling the active sidebar tab
  const [activeView, setActiveView] = useState("overview");

  // --- EXISTING STATE FOR OVERVIEW ---
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [hospital, setHospital] = useState(null);

  // ... inside loadRooms or a new useEffect
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const data = await receptionistApi.getHospital();
        setHospital(data);
      } catch (e) {
        console.error("Could not fetch hospital details");
      }
    };
    fetchHospital();
  }, []);

  // Auth Check
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role !== "RECEPTIONIST") {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  // Derived State (Only needed for Overview)
  const availableRooms = useMemo(
    () => rooms.filter((room) => (room.availableBeds ?? 0) > 0),
    [rooms]
  );

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.roomId === selectedRoomId) ?? null,
    [rooms, selectedRoomId]
  );

  const summary = useMemo(() => {
    const totalRooms = rooms.length;
    const totalBeds = rooms.reduce((acc, r) => acc + (r.totalBeds ?? 0), 0);
    const availableBeds = rooms.reduce(
      (acc, r) => acc + (r.availableBeds ?? 0),
      0
    );
    const occupiedBeds = totalBeds - availableBeds;
    return { totalRooms, totalBeds, availableBeds, occupiedBeds };
  }, [rooms]);

  // Data Loading
  const loadPatients = useCallback(async (roomIdToLoad) => {
    if (!roomIdToLoad) {
      setPatients([]);
      return;
    }
    setPatientsLoading(true);
    try {
      const data = await receptionistApi.getPatientsByRoom(roomIdToLoad);
      setPatients(data || []);
    } catch (err) {
      toast.error("Unable to load patients for this room.");
      setPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  }, []);

  const loadRooms = useCallback(
    async (keepSelection = true) => {
      setRoomsLoading(true);
      try {
        const data = await receptionistApi.getRooms();
        setRooms(data || []);

        const preferredRoomId =
          (keepSelection && selectedRoomId) || data?.[0]?.roomId || null;
        setSelectedRoomId(preferredRoomId);

        if (preferredRoomId) {
          await loadPatients(preferredRoomId);
        } else {
          setPatients([]);
        }
      } catch (err) {
        toast.error("Unable to load rooms.");
        setRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    },
    [selectedRoomId, loadPatients]
  );

  // Initial Load (Only if on Overview)
  useEffect(() => {
    if (user?.role === "RECEPTIONIST" && activeView === "overview") {
      loadRooms();
    }
  }, [user, loadRooms, activeView]);

  // Handlers
  const handleAdmissionSuccess = async (roomId) => {
    await loadRooms(false);
    setSelectedRoomId(roomId);
    await loadPatients(roomId);
  };

  const handleSelectRoom = async (roomId) => {
    setSelectedRoomId(roomId);
    await loadPatients(roomId);
  };

  const handleDischarge = async (patientId) => {
    setActionLoading((prev) => ({ ...prev, [patientId]: "discharge" }));
    try {
      await receptionistApi.dischargePatient(patientId);
      toast.success("Patient discharged successfully");
      await loadRooms();
      if (selectedRoomId) await loadPatients(selectedRoomId);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to discharge patient."
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [patientId]: undefined }));
    }
  };

  const handleReassign = async (patientId, newRoomId) => {
    setActionLoading((prev) => ({ ...prev, [patientId]: "move" }));
    try {
      await receptionistApi.reassignPatient(patientId, Number(newRoomId));
      toast.success("Patient moved successfully");
      await loadRooms();
      if (selectedRoomId) await loadPatients(selectedRoomId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to reassign patient.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [patientId]: undefined }));
    }
  };

  if (!user || user.role !== "RECEPTIONIST") return null;

  return (
    <DashboardLayout
      sidebarItems={sections}
      // 5. Connect Layout props to our activeView state
      activeKey={activeView}
      onSelect={setActiveView}
    >
      {/* 6. Conditional Rendering based on activeView */}
      {activeView === "overview" ? (
        <div className="space-y-6">
          <ReceptionistStats
            user={user}
            summary={summary}
            hospital={hospital}
          />

          <AdmissionForm
            availableRooms={availableRooms}
            onSuccess={handleAdmissionSuccess}
          />

          <RoomList
            rooms={rooms}
            loading={roomsLoading}
            selectedRoomId={selectedRoomId}
            onSelect={handleSelectRoom}
            onRefresh={() => loadRooms()}
          />

          <PatientList
            patients={patients}
            loading={patientsLoading}
            selectedRoom={selectedRoom}
            allRooms={rooms}
            onRefresh={() => loadPatients(selectedRoomId)}
            onDischarge={handleDischarge}
            onReassign={handleReassign}
            actionLoading={actionLoading}
          />
        </div>
      ) : (
        // Render the new Component when "patients" key is active
        <PatientManagement />
      )}
    </DashboardLayout>
  );
}
