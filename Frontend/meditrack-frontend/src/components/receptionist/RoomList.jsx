import React, { useState, useMemo } from "react";
import { RefreshCw, Loader2, Search } from "lucide-react";
import RoomCard from "./RoomCard";

export default function RoomList({
  rooms,
  loading,
  selectedRoomId,
  onSelect,
  onRefresh,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logic: Checks Room Number or Room Type
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    return rooms.filter(
      (room) =>
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rooms, searchQuery]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Room Management
          </p>
          <h3 className="text-lg font-semibold text-slate-900">
            Available Rooms
          </h3>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-slate-500 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading rooms...
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
          No rooms available for this hospital.
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
          No rooms found matching "{searchQuery}".
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.roomId}
              room={room}
              isActive={selectedRoomId === room.roomId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
