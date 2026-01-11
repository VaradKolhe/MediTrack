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
    <div className="relative bg-white border-2 border-slate-200 rounded-3xl shadow-xl overflow-hidden">
      {/* Decorative Header Background */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 opacity-60"></div>
      
      <div className="relative p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Room Management
              </p>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Available Rooms
            </h3>
            {rooms && rooms.length > 0 && (
              <p className="text-sm text-slate-500 mt-1">
                {filteredRooms.length} of {rooms.length} rooms
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search room number or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm font-medium border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 transition-all bg-white shadow-sm"
              />
            </div>

            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
              <div className="absolute inset-0 w-12 h-12 rounded-full bg-cyan-500 opacity-20 animate-ping"></div>
            </div>
            <p className="text-lg font-medium">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 border-dashed">
            <BedDouble className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-lg">No rooms available for this hospital.</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 border-dashed">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-lg mb-2">No rooms found</p>
            <p className="text-slate-500 text-sm">Try searching for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
