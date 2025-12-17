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

  const handleReassignClick = () => {
    if (selectedNewRoom) {
      onReassign(patient.patientId, selectedNewRoom);
      setSelectedNewRoom("");
    }
  };

  const isLoading = actionLoading[patient.patientId];

  // Normalize status check
  const isDischarged = patient.status?.toLowerCase() === "discharged";

  // Safely get current room ID. If discharged, this is likely null/undefined.
  const currentRoomId = patient.room?.roomId || patient.roomId;

  // Filter Logic:
  // 1. Must have available beds
  // 2. Must NOT be the room the patient is currently in (if they are assigned one)
  const targetRooms = rooms.filter(
    (room) =>
      (room.availableBeds ?? 0) > 0 &&
      (!currentRoomId || room.roomId !== currentRoomId)
  );

  return (
    <div
      className={`border rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col h-full relative overflow-hidden ${
        isDischarged
          ? "bg-slate-50 border-slate-200 opacity-90"
          : "bg-white border-blue-100 ring-1 ring-blue-50"
      }`}
    >
      {/* Visual Indicator Strip for Admitted Patients */}
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
              disabled={isLoading === "move" || !selectedNewRoom}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isDischarged
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm" // Blue for Readmit
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50" // Neutral for Move
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
