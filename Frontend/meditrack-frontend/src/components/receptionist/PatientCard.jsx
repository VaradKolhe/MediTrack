import React, { useState } from "react";
import {
  UserRound,
  Phone,
  MapPin,
  Activity,
  MoveRight,
  CheckCircle2,
  Loader2,
  LogIn,
  AlertCircle,
  BedDouble,
} from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function PatientCard({
  patient,
  rooms,
  onDischarge,
  onReassign,
  actionLoading,
}) {
  const [selectedNewRoom, setSelectedNewRoom] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const isLoading = actionLoading[patient.patientId];

  // Normalize status check
  const isDischarged = patient.status?.toLowerCase() === "discharged";

  // Safely get current room ID.
  const currentRoomId = patient.room?.roomId || patient.roomId;

  // Filter Logic:
  // 1. Must have available beds
  // 2. Must NOT be the room the patient is currently in
  const targetRooms = rooms.filter(
    (room) =>
      (room.availableBeds ?? 0) > 0 &&
      (!currentRoomId || room.roomId !== currentRoomId)
  );

  // Validation
  const canSubmit = isDischarged
    ? selectedNewRoom && symptoms.trim()
    : selectedNewRoom;

  // --- LOGIC UPDATE ---
  // Call parent reassign only, removing complex child logic.
  const handleReassignClick = () => {
    if (canSubmit) {
      // Pass symptoms only if discharged (Readmission scenario)
      onReassign(
        patient.patientId, 
        selectedNewRoom, 
        isDischarged ? symptoms : null
      );
      
      // Reset local state (Equivalent to setting to null/empty)
      setSelectedNewRoom("");
      setSymptoms(""); 
    }
  };

  return (
    <div
      className={`border rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col h-full relative overflow-hidden ${
        isDischarged
          ? "bg-slate-50 border-slate-200 opacity-90"
          : "bg-white border-blue-100 ring-1 ring-blue-50"
      }`}
    >
      {/* Visual Indicator Strip */}
      {!isDischarged && (
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
      )}

      {/* --- HEADER --- */}
      <div className="flex items-start justify-between mb-3 pl-2">
        <div>
          <p className="text-sm font-bold text-slate-900">{patient.name}</p>
          <p className="text-xs text-slate-500">ID: {patient.patientId}</p>
        </div>
        <StatusBadge status={patient.status} />
      </div>

      {/* --- DETAILS --- */}
      <div className="space-y-2 text-sm text-slate-600 mb-4 flex-1 pl-2">
        {/* Room Display */}
        {!isDischarged && patient.room && (
          <p className="flex items-center gap-2 font-medium text-blue-700 bg-blue-50 w-fit px-2 py-0.5 rounded-md mb-2">
            <BedDouble className="w-4 h-4" />
            Room: {patient.room.roomNumber}
          </p>
        )}

        <p className="flex items-center gap-2">
          <UserRound className="w-4 h-4 text-slate-400" />
          {patient.age} yrs • {patient.gender}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-400" />
          {patient.contactNumber}
        </p>
        {patient.address && (
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="truncate max-w-[180px]">{patient.address}</span>
          </p>
        )}
        {patient.symptoms && (
          <p className="flex items-start gap-2">
            <Activity className="w-4 h-4 text-slate-400 mt-0.5" />
            <span className="text-xs italic bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              {patient.symptoms}
            </span>
          </p>
        )}
      </div>

      {/* --- ACTIONS AREA --- */}
      <div className="mt-auto space-y-3 pt-4 border-t border-slate-200/60 pl-2">
        {/* REASSIGN / ADMIT SECTION */}
        <div>
          <label className="block text-xs text-slate-500 font-semibold mb-1">
            {isDischarged ? "Readmit to Room" : "Transfer Room"}
          </label>
          <div className="flex items-center gap-2">
            <select
              value={selectedNewRoom}
              onChange={(e) => setSelectedNewRoom(e.target.value)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition ${
                isDischarged
                  ? "bg-white border-slate-300"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <option value="">Select Room</option>
              {targetRooms.map((room) => (
                <option key={room.roomId} value={room.roomId}>
                  {room.roomNumber} ({room.availableBeds} beds)
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleReassignClick}
              disabled={isLoading === "move" || !canSubmit}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isDischarged
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isLoading === "move" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isDischarged ? (
                <>
                  <LogIn className="w-3.5 h-3.5 mr-1.5" /> Re-Admit
                </>
              ) : (
                <>
                  <MoveRight className="w-3.5 h-3.5 mr-1.5" /> Move
                </>
              )}
            </button>
          </div>
        </div>

        {/* NEW SYMPTOMS INPUT - Only shown when patient is discharged */}
        {isDischarged && (
          <div>
            <label className="block text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Readmission Symptoms
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Enter current symptoms for readmission..."
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition bg-white resize-none"
            />
            {selectedNewRoom && !symptoms.trim() && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Symptoms required for readmission
              </p>
            )}
          </div>
        )}

        {/* DISCHARGE BUTTON (Only visible if currently Admitted) */}
        {!isDischarged && (
          <button
            type="button"
            onClick={() => onDischarge(patient.patientId)}
            disabled={isLoading === "discharge"}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 hover:text-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition border border-red-100"
          >
            {isLoading === "discharge" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Discharge Patient
          </button>
        )}

        {/* If Discharged, show footer */}
        {isDischarged && (
          <div className="text-center py-2 text-xs text-slate-400 italic">
            Patient is currently discharged
          </div>
        )}
      </div>
    </div>
  );
}