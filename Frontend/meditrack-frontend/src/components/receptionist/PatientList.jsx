import React, { useState, useMemo } from "react";
import { RefreshCw, Loader2, Search } from "lucide-react";
import PatientCard from "./PatientCard";

export default function PatientList({
  patients,
  loading,
  selectedRoom,
  allRooms,
  onRefresh,
  onDischarge,
  onReassign,
  actionLoading,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Filter by Status (ADMITTED only)
  // 2. Filter by Search Query (Name)
  const filteredPatients = useMemo(() => {
    if (!patients) return [];

    return patients
      .filter((patient) => patient.status === "ADMITTED")
      .filter((patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [patients, searchQuery]);

  // Helper to check if list is empty just because of search, or because room is actually empty
  const hasPatientsInRoom = patients.some((p) => p.status === "ADMITTED");

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Patients in Room
          </p>
          <h3 className="text-lg font-semibold text-slate-900">
            {selectedRoom ? `Room ${selectedRoom.roomNumber}` : "Select a room"}
          </h3>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!selectedRoom}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <div className="hidden md:block text-xs text-slate-500 whitespace-nowrap px-2">
            Admitted only
          </div>

          {selectedRoom && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-slate-500 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading patients...
        </div>
      ) : !selectedRoom ? (
        <div className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
          Select a room to view its admitted patients.
        </div>
      ) : !hasPatientsInRoom ? (
        <div className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
          No admitted patients in this room.
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
          No patients found matching "{searchQuery}".
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.patientId}
              patient={patient}
              rooms={allRooms}
              onDischarge={onDischarge}
              onReassign={onReassign}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
