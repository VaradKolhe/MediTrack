import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Users,
  Plus,
  MapPin,
  BedDouble,
  Activity,
} from "lucide-react";
import PatientCard from "./PatientCard";
import { receptionistApi } from "../../api/receptionistApi";
import { motion } from "framer-motion";
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
          // Robust ID comparison
          String(p.patientId) === String(patientId)
            ? { ...p, status: "Discharged", room: null }
            : p
        )
      );
      // Background refresh to update stats silently
      receptionistApi.getHospital().then(setHospitalStats);
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

  // 3. Handle Reassign Room Action (Includes Symptom Logic)
  const handleReassign = async (patientId, newRoomId, symptoms = null) => {
    setActionLoading((prev) => ({ ...prev, [patientId]: "move" }));

    try {
      // API Call
      await receptionistApi.reassignPatient(
        patientId,
        Number(newRoomId),
        symptoms
      );

      toast.success("Patient processed successfully");

      const targetRoom = rooms.find((r) => r.roomId === Number(newRoomId));

      // Optimistic UI Update
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

      // Silent Refresh: Sync everything perfectly
      receptionistApi.getHospital().then(setHospitalStats);
      receptionistApi.getAllPatients().then(setPatients); 
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 p-6">
      <div className="space-y-6 max-w-[1600px] mx-auto">
        
        {/* Page Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">
                Patient Management
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Monitor admissions, discharges, and bed assignments
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hospital Stats Cards */}
        {hospitalStats && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {/* Bed Occupancy Card */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-lg shadow-blue-100/50 p-5 relative overflow-hidden group hover:scale-[1.02] transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-bl-full -mr-8 -mt-8" />
              <div className="relative flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                  <BedDouble size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Bed Occupancy
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <h3 className="text-3xl font-black text-slate-900">
                      {hospitalStats.occupiedBeds}
                    </h3>
                    <span className="text-sm text-slate-500 font-semibold">
                      / {hospitalStats.totalBeds}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (hospitalStats.occupiedBeds /
                            hospitalStats.totalBeds) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hospital Status Card */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-lg shadow-emerald-100/50 p-5 relative overflow-hidden group hover:scale-[1.02] transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-bl-full -mr-8 -mt-8" />
              <div className="relative flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                  <Activity size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Hospital Status
                  </p>
                  <h3 className="text-lg font-bold text-slate-900 truncate mb-1">
                    {hospitalStats.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    {hospitalStats.city}, {hospitalStats.state}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Patients Card */}
            <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-lg shadow-purple-100/50 p-5 relative overflow-hidden group hover:scale-[1.02] transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-bl-full -mr-8 -mt-8" />
              <div className="relative flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                  <Users size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Active Patients
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-slate-900">
                      {
                        filteredPatients.filter(
                          (p) => p.status?.toLowerCase() === "admitted"
                        ).length
                      }
                    </h3>
                    <span className="text-sm text-slate-500 font-semibold">
                      Admitted
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {
                      filteredPatients.filter(
                        (p) => p.status?.toLowerCase() === "discharged"
                      ).length
                    }{" "}
                    Discharged
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters & Actions Header */}
        <motion.div
          className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-100/50 p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm font-medium"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-50 border-2 border-slate-200"
                title="Refresh Data"
              >
                <RefreshCw
                  size={20}
                  className={loading ? "animate-spin" : ""}
                />
              </button>

              <div className="h-8 w-px bg-slate-200 hidden sm:block" />

              {/* Status Filter Pills */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                {[
                  { label: "All", color: "blue" },
                  { label: "Admitted", color: "emerald" },
                  { label: "Discharged", color: "slate" },
                ].map((status) => (
                  <button
                    key={status.label}
                    onClick={() => setStatusFilter(status.label)}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                      statusFilter === status.label
                        ? `bg-gradient-to-r from-${status.color}-500 to-${status.color}-600 text-white shadow-md`
                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>

              {/* New Admission Button */}
              <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-bold text-sm shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95">
                <Plus size={18} strokeWidth={3} />
                New Admission
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredPatients.length}
              </span>{" "}
              {statusFilter !== "All" ? statusFilter.toLowerCase() : ""} patient
              {filteredPatients.length !== 1 ? "s" : ""}
            </p>
          </div>
        </motion.div>

        {/* Patient Cards Grid */}
        {loading ? (
          <motion.div
            className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border-2 border-slate-200 shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-5 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-4">
              <RefreshCw className="animate-spin text-blue-600" size={40} />
            </div>
            <p className="text-lg font-bold text-slate-700">
              Loading patient records...
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Please wait a moment
            </p>
          </motion.div>
        ) : filteredPatients.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.patientId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <PatientCard
                  patient={patient}
                  rooms={rooms}
                  onDischarge={handleDischarge}
                  onReassign={handleReassign}
                  actionLoading={actionLoading}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border-2 border-slate-300 border-dashed shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-5 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-4">
              <Users size={48} className="text-slate-400" />
            </div>
            <p className="text-xl font-bold text-slate-700 mb-2">
              No patients found
            </p>
            <p className="text-sm text-slate-500">
              {searchTerm
                ? `No matches for "${searchTerm}"`
                : "Start by admitting your first patient"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}