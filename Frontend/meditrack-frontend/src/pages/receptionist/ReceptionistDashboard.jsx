import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BedDouble,
  ClipboardList,
  LayoutDashboard,
  Loader2,
  MapPin,
  MoveRight,
  Phone,
  PlusCircle,
  RefreshCw,
  Stethoscope,
  UserRound,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { receptionistApi } from "../../api/receptionistApi";

const sections = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "queue", label: "Admissions Queue", icon: ClipboardList },
];

const genders = ["Male", "Female", "Other"];

const initialForm = {
  name: "",
  age: "",
  gender: genders[0],
  contactNumber: "",
  address: "",
  symptoms: "",
  roomId: "",
};

const statusStyles = {
  ADMITTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DISCHARGED: "bg-slate-100 text-slate-600 border-slate-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border ${
      statusStyles[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
    }`}
  >
    <span
      className={`h-2 w-2 rounded-full ${
        status === "ADMITTED" ? "bg-emerald-500" : "bg-slate-400"
      }`}
    />
    {status ?? "UNKNOWN"}
  </span>
);

const RoomCard = ({ room, isActive, onSelect }) => {
  const available = room.availableBeds ?? 0;
  const total = room.totalBeds ?? 0;
  const occupied = total - available;
  const occupancyPercent = total > 0 ? Math.min(100, Math.round((occupied / total) * 100)) : 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(room.roomId)}
      className={`w-full text-left rounded-2xl border transition-all bg-white p-4 shadow-sm hover:shadow-md ${
        isActive ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Room</p>
          <p className="text-lg font-semibold text-slate-900">{room.roomNumber}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <BedDouble className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-900">
            {occupied}/{total}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Occupancy</span>
          <span>{occupancyPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full ${
              occupancyPercent < 80 ? "bg-emerald-500" : occupancyPercent < 100 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-slate-600">
          Available beds:{" "}
          <strong className={`font-semibold ${available > 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {Math.max(available, 0)}
          </strong>
        </span>
      </div>
    </button>
  );
};

export default function ReceptionistDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [reassignSelections, setReassignSelections] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role !== "RECEPTIONIST") {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

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
    const availableBeds = rooms.reduce((acc, r) => acc + (r.availableBeds ?? 0), 0);
    const occupiedBeds = totalBeds - availableBeds;
    return { totalRooms, totalBeds, availableBeds, occupiedBeds };
  }, [rooms]);

  useEffect(() => {
    if (!form.roomId && availableRooms.length > 0) {
      setForm((prev) => ({ ...prev, roomId: availableRooms[0].roomId.toString() }));
    }
  }, [availableRooms, form.roomId]);

  const loadPatients = useCallback(
    async (roomIdToLoad) => {
      if (!roomIdToLoad) {
        setPatients([]);
        return;
      }
      setPatientsLoading(true);
      try {
        const data = await receptionistApi.getPatientsByRoom(roomIdToLoad);
        setPatients(data || []);
      } catch (err) {
        const message = err.response?.data?.message || "Unable to load patients for this room.";
        toast.error(message);
        setPatients([]);
      } finally {
        setPatientsLoading(false);
      }
    },
    []
  );

  const loadRooms = useCallback(async (keepSelection = true) => {
    setRoomsLoading(true);
    try {
      const data = await receptionistApi.getRooms();
      setRooms(data || []);

      const preferredRoomId = (keepSelection && selectedRoomId) || data?.[0]?.roomId || null;
      setSelectedRoomId(preferredRoomId);

      if (preferredRoomId) {
        await loadPatients(preferredRoomId);
      } else {
        setPatients([]);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load rooms.";
      toast.error(message);
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  }, [selectedRoomId, loadPatients]);

  useEffect(() => {
    if (user?.role === "RECEPTIONIST") {
      loadRooms();
    }
  }, [user, loadRooms]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    
    if (!form.roomId) {
      toast.error("Please select an available room.");
      return;
    }

    // Validate required fields
    if (!form.name.trim() || !form.age || !form.contactNumber.trim()) {
      toast.error("Please fill in all required fields (Name, Age, Contact Number).");
      return;
    }

    const payload = {
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      contactNumber: form.contactNumber.trim(),
      address: form.address.trim() || null,
      symptoms: form.symptoms.trim() || null,
      entryDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
    };

    setSubmitting(true);
    try {
      // Step 1: Create patient
      const patient = await receptionistApi.createPatient(payload);
      if (!patient?.patientId) {
        throw new Error("Patient creation failed");
      }

      // Step 2: Assign patient to selected room (initial assignment)
      await receptionistApi.assignPatientToRoom(patient.patientId, Number(form.roomId));

      toast.success("Patient admitted successfully!");
      setForm(initialForm);
      setReassignSelections({});
      
      // Refresh data
      await loadRooms(false);
      setSelectedRoomId(Number(form.roomId));
      await loadPatients(Number(form.roomId));
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to admit patient. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
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
      if (selectedRoomId) {
        await loadPatients(selectedRoomId);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Unable to discharge patient.";
      toast.error(message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [patientId]: undefined }));
    }
  };

  const handleReassign = async (patientId) => {
    const newRoomId = reassignSelections[patientId];
    if (!newRoomId) {
      toast.error("Please select a target room before reassigning.");
      return;
    }
    setActionLoading((prev) => ({ ...prev, [patientId]: "move" }));
    try {
      await receptionistApi.reassignPatient(patientId, Number(newRoomId));
      toast.success("Patient moved to new room successfully");
      await loadRooms();
      if (selectedRoomId) {
        await loadPatients(selectedRoomId);
      }
      setReassignSelections((prev) => ({ ...prev, [patientId]: "" }));
    } catch (err) {
      const message = err.response?.data?.message || "Unable to reassign patient.";
      toast.error(message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [patientId]: undefined }));
    }
  };

  if (!user || user.role !== "RECEPTIONIST") {
    return null;
  }

  const admittedPatients = patients.filter((patient) => patient.status === "ADMITTED");

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
        {/* Summary Stats */}
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Hospital</p>
              <p className="text-lg font-semibold text-slate-900">
                {user.hospitalId ? `#${user.hospitalId}` : "Not assigned"}
              </p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Rooms</p>
              <p className="text-lg font-semibold text-slate-900">{summary.totalRooms}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Available Beds</p>
              <p className="text-lg font-semibold text-slate-900">{summary.availableBeds}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Occupied Beds</p>
              <p className="text-lg font-semibold text-slate-900">{summary.occupiedBeds}</p>
            </div>
          </div>
        </div>

        {/* Patient Admission Form */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">New Admission</p>
              <h3 className="text-lg font-semibold text-slate-900">Register patient</h3>
            </div>
            <PlusCircle className="w-5 h-5 text-blue-600" />
          </div>

          <form onSubmit={handleCreatePatient} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-700 font-medium">
                Full Name *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="Patient name"
                />
              </label>
              <label className="text-sm text-slate-700 font-medium">
                Age *
                <input
                  name="age"
                  type="number"
                  min="0"
                  max="150"
                  value={form.age}
                  onChange={handleFormChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-700 font-medium">
                Gender *
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleFormChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
                >
                  {genders.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-slate-700 font-medium">
                Contact Number *
                <input
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleFormChange}
                  required
                  pattern="[0-9]{10,15}"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="10-15 digits"
                />
              </label>
            </div>

            <label className="text-sm text-slate-700 font-medium">
              Address
              <input
                name="address"
                value={form.address}
                onChange={handleFormChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                placeholder="Street, City"
              />
            </label>

            <label className="text-sm text-slate-700 font-medium">
              Symptoms / Notes
              <textarea
                name="symptoms"
                value={form.symptoms}
                onChange={handleFormChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                placeholder="Short clinical notes"
              />
            </label>

            <label className="text-sm text-slate-700 font-medium">
              Assign to Room *
              <select
                name="roomId"
                value={form.roomId}
                onChange={handleFormChange}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
              >
                <option value="">Select an available room</option>
                {availableRooms.map((room) => (
                  <option key={room.roomId} value={room.roomId}>
                    {room.roomNumber} — {room.availableBeds} bed(s) free
                  </option>
                ))}
              </select>
              {availableRooms.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No free beds available. Please refresh or reassign patients.
                </p>
              )}
            </label>

            <button
              type="submit"
              disabled={submitting || availableRooms.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4" />
                  Admit Patient
                </>
              )}
            </button>
          </form>
        </div>

        {/* Rooms Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Room Management</p>
              <h3 className="text-lg font-semibold text-slate-900">Available Rooms</h3>
            </div>
            <button
              type="button"
              onClick={() => loadRooms()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {roomsLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-500 gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading rooms...
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-slate-500 text-center py-8">
              No rooms available for this hospital.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <RoomCard
                  key={room.roomId}
                  room={room}
                  isActive={selectedRoomId === room.roomId}
                  onSelect={handleSelectRoom}
                />
              ))}
            </div>
          )}
        </div>

        {/* Patients in Selected Room */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Patients in Room</p>
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedRoom ? `Room ${selectedRoom.roomNumber}` : "Select a room"}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-500">
                Showing admitted patients only.
              </div>
              {selectedRoomId && (
                <button
                  type="button"
                  onClick={() => loadPatients(selectedRoomId)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              )}
            </div>
          </div>

          {patientsLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-500 gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading patients...
            </div>
          ) : !selectedRoomId ? (
            <div className="text-slate-500 text-center py-8">
              Select a room to view its admitted patients.
            </div>
          ) : admittedPatients.length === 0 ? (
            <div className="text-slate-500 text-center py-8">
              No admitted patients in this room.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admittedPatients.map((patient) => (
                <div
                  key={patient.patientId}
                  className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
                      <p className="text-xs text-slate-500">ID: {patient.patientId}</p>
                    </div>
                    <StatusBadge status={patient.status} />
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <p className="flex items-center gap-2">
                      <UserRound className="w-4 h-4 text-slate-500" />
                      {patient.age} yrs • {patient.gender}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-500" />
                      {patient.contactNumber}
                    </p>
                    {patient.address && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="truncate">{patient.address}</span>
                      </p>
                    )}
                    {patient.symptoms && (
                      <p className="flex items-start gap-2">
                        <Activity className="w-4 h-4 text-slate-500 mt-0.5" />
                        <span className="text-xs">{patient.symptoms}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className="block text-xs text-slate-500 font-semibold">
                      Reassign room
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={reassignSelections[patient.patientId] || ""}
                        onChange={(e) =>
                          setReassignSelections((prev) => ({
                            ...prev,
                            [patient.patientId]: e.target.value,
                          }))
                        }
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white text-sm"
                      >
                        <option value="">Choose new room</option>
                        {rooms
                          .filter(
                            (room) =>
                              room.roomId !== patient.room?.id &&
                              (room.availableBeds ?? 0) > 0
                          )
                          .map((room) => (
                            <option key={room.roomId} value={room.roomId}>
                              {room.roomNumber} — {room.availableBeds} free
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleReassign(patient.patientId)}
                        disabled={actionLoading[patient.patientId] === "move" || !reassignSelections[patient.patientId]}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
                      >
                        {actionLoading[patient.patientId] === "move" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MoveRight className="w-4 h-4" />
                        )}
                        Move
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      Entry: {patient.entryDate || "N/A"}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDischarge(patient.patientId)}
                      disabled={actionLoading[patient.patientId] === "discharge"}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      {actionLoading[patient.patientId] === "discharge" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Discharge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
