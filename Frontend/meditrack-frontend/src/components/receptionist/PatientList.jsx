import React, { useState, useMemo } from "react";
import { RefreshCw, Loader2, Search, UserRound } from "lucide-react";
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
    <div className="relative bg-white border-2 border-slate-200 rounded-3xl shadow-xl overflow-hidden">
      {/* Decorative Header Background (Matches RoomList) */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 opacity-60"></div>

      <div className="relative p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Patients in Room
              </p>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {selectedRoom
                ? `Room ${selectedRoom.roomNumber}`
                : "Select a Room"}
            </h3>
            {selectedRoom && hasPatientsInRoom && (
              <p className="text-sm text-slate-500 mt-1">
                {filteredPatients.length} admitted patient
                {filteredPatients.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!selectedRoom}
                className="w-full pl-12 pr-4 py-3 text-sm font-medium border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 transition-all bg-white shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            {selectedRoom && (
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
              <div className="absolute inset-0 w-12 h-12 rounded-full bg-cyan-500 opacity-20 animate-ping"></div>
            </div>
            <p className="text-lg font-medium">Loading patients...</p>
          </div>
        ) : !selectedRoom ? (
          <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 border-dashed">
            <UserRound className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-lg">
              Select a room to view its admitted patients.
            </p>
          </div>
        ) : !hasPatientsInRoom ? (
          <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 border-dashed">
            <UserRound className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-lg">
              No admitted patients in this room.
            </p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 border-dashed">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-lg mb-2">
              No patients found
            </p>
            <p className="text-slate-500 text-sm">
              Try searching for "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
