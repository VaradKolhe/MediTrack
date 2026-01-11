import React from "react";
import { BedDouble } from "lucide-react";

export default function RoomCard({ room, isActive, onSelect }) {
  const available = room.availableBeds ?? 0;
  const total = room.totalBeds ?? 0;
  const occupied = total - available;
  const occupancyPercent =
    total > 0 ? Math.min(100, Math.round((occupied / total) * 100)) : 0;

  const getStatusColor = () => {
    if (occupancyPercent === 0)
      return {
        bg: "bg-slate-100",
        text: "text-slate-600",
        gradient: "from-slate-400 to-slate-500",
      };
    if (occupancyPercent < 70)
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        gradient: "from-emerald-500 to-green-500",
      };
    if (occupancyPercent < 90)
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        gradient: "from-amber-500 to-orange-500",
      };
    return {
      bg: "bg-rose-50",
      text: "text-rose-700",
      gradient: "from-rose-500 to-pink-500",
    };
  };

  const status = getStatusColor();

  return (
    <button
      type="button"
      onClick={() => onSelect(room.roomId)}
      className={`relative w-full text-left rounded-2xl border-2 transition-all duration-300 bg-white overflow-hidden group ${
        isActive
          ? "border-cyan-500 ring-4 ring-cyan-100 shadow-xl scale-[1.02]"
          : "border-slate-200 hover:border-cyan-300 hover:shadow-lg hover:scale-[1.01]"
      }`}
    >
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Room
            </p>
            <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {room.roomNumber}
            </p>
            {room.type && (
              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">
                {room.type}
              </span>
            )}
          </div>
          <div
            className={`px-3 py-2 rounded-xl ${status.bg} flex items-center gap-2`}
          >
            <BedDouble className={`w-5 h-5 ${status.text}`} />
            <span className={`text-lg font-bold ${status.text}`}>
              {occupied}/{total}
            </span>
          </div>
        </div>

        {/* Occupancy Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>Occupancy Rate</span>
            <span className={status.text}>{occupancyPercent}%</span>
          </div>
          <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
            <div
              className={`h-full bg-gradient-to-r ${status.gradient} transition-all duration-500 ease-out relative overflow-hidden`}
              style={{ width: `${occupancyPercent}%` }}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Available Beds Info */}
        <div
          className={`flex items-center justify-between p-3 rounded-xl ${
            available > 0
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-rose-50 border border-rose-200"
          }`}
        >
          <span className="text-sm font-medium text-slate-700">
            Available Beds
          </span>
          <span
            className={`text-lg font-bold ${
              available > 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {Math.max(available, 0)}
          </span>
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500"></div>
      )}
    </button>
  );
}
