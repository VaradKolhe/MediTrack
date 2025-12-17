import React from "react";
import { BedDouble } from "lucide-react";

export default function RoomCard({ room, isActive, onSelect }) {
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
}