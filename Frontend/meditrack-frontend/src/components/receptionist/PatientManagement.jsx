import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Users,
  Plus,
  BedDouble,
  Activity,
} from "lucide-react";
import PatientCard from "./PatientCard";
import { receptionistApi } from "../../api/receptionistApi";
import toast from "react-hot-toast";

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [hospitalStats, setHospitalStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Loading state specific to PatientCard actions
  const [actionLoading, setActionLoading] = useState({});

  // 1. Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [patientsData, roomsData, hospitalData] = await Promise.all([
        receptionistApi.getAllPatients(),
        receptionistApi.getRooms(),
        receptionistApi.getHospital(),
      ]);

      setPatients(patientsData || []);
      setRooms(roomsData || []);
      setHospitalStats(hospitalData || null);
    } catch (error) {
      console.error("Error fetching management data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Handle Discharge Action
  const handleDischarge = async (patientId) => {
    setActionLoading((prev) => ({ ...prev, [patientId]: "discharge" }));

    try {
      await receptionistApi.dischargePatient(patientId);
      toast.success("Patient discharged");

      setPatients((prev) =>
        prev.map((p) =>
          p.patientId === patientId
            ? { ...p, status: "Discharged", room: null }
            : p
        )
      );
      fetchData();
    } catch (error) {
      console.error("Discharge failed", error);
      toast.error(
        error.response?.data?.message || "Failed to discharge patient"
      );
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[patientId];
        return newState;
      });
    }
  };

  // 3. Handle Reassign Room Action
  const handleReassign = async (patientId, newRoomId) => {
    setActionLoading((prev) => ({ ...prev, [patientId]: "move" }));

    try {
      await receptionistApi.reassignPatient(patientId, Number(newRoomId));
      toast.success("Patient moved successfully");

      const targetRoom = rooms.find((r) => r.roomId === Number(newRoomId));

      setPatients((prev) =>
        prev.map((p) =>
          p.patientId === patientId ? { ...p, room: targetRoom } : p
        )
      );

      setRooms((prev) =>
        prev.map((r) => {
          if (r.roomId === Number(newRoomId)) {
            return { ...r, availableBeds: (r.availableBeds || 1) - 1 };
          }
          return r;
        })
      );
    } catch (error) {
      console.error("Reassign failed", error);
      toast.error(error.response?.data?.message || "Failed to move patient");
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[patientId];
        return newState;
      });
    }
  };

  // 4. Filter Logic
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Status Filter
      const matchesStatus =
        statusFilter === "All" ||
        patient.status?.toLowerCase() === statusFilter.toLowerCase();

      // Search Filter
      const searchLower = searchTerm.toLowerCase();
      const patientIdString = String(patient.patientId || "");
      const patientNameString = patient.name?.toLowerCase() || "";

      const matchesSearch =
        patientNameString.includes(searchLower) ||
        patientIdString.includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [patients, statusFilter, searchTerm]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* 5. Hospital Stats Header */}
      {hospitalStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <BedDouble size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Bed Occupancy
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-slate-900">
                  {hospitalStats.occupiedBeds}
                </h3>
                <span className="text-sm text-slate-400">
                  / {hospitalStats.totalBeds} Total
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Hospital Status
              </p>
              <h3 className="text-lg font-bold text-slate-900 truncate">
                {hospitalStats.name}
              </h3>
              <p className="text-xs text-slate-400">
                {hospitalStats.city}, {hospitalStats.state}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* REFRESH BUTTON ADDED HERE */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {["All", "Admitted", "Discharged"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  statusFilter === status
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
            <Plus size={16} />
            New Admission
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <RefreshCw className="animate-spin mb-2" size={32} />
          <p>Loading records...</p>
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.patientId}
              patient={patient}
              rooms={rooms}
              onDischarge={handleDischarge}
              onReassign={handleReassign}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
          <Users size={48} className="mb-4 text-slate-300" />
          <p className="text-lg font-medium text-slate-600">
            No patients found
          </p>
        </div>
      )}
    </div>
  );
}
