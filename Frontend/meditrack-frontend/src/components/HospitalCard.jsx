import React from "react";
import {
  Activity,
  MapPin,
  Phone,
  Navigation,
  Building2,
  ArrowRight,
  Star,
  X,
} from "lucide-react";
import HospitalMap from "./HospitalMap"; // Ensure this file exists

const HospitalCard = ({ hospital, onClick, onExpand, isExpanded }) => {
  const totalBeds = hospital.totalBeds ?? 0;
  const occupiedBeds = hospital.occupiedBeds ?? 0;
  const freeBeds = Math.max(totalBeds - occupiedBeds, 0);
  const totalRooms = hospital.totalRooms ?? hospital.rooms?.length ?? 0;

  // Rating logic
  const rating = hospital.averageRating ?? 0;
  const reviewCount = hospital.totalReviews ?? 0;

  // Determine availability status color
  const isFull = freeBeds === 0 && totalBeds > 0;
  const availabilityColor = isFull ? "bg-rose-500" : "bg-emerald-500";
  const availabilityText = isFull ? "text-rose-600" : "text-emerald-600";
  const availabilityBg = isFull ? "bg-rose-50" : "bg-emerald-50";

  return (
    <div
      onClick={() => !isExpanded && onClick(hospital)}
      className={`
        group relative bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-500 overflow-hidden flex flex-col
        ${
          isExpanded
            ? "ring-2 ring-blue-500 shadow-2xl scale-[1.01] z-30"
            : "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        }
      `}
    >
      {/* Status Accent Line (Left Border) */}
      {/* FIX: Increased z-index to z-20 so it sits ON TOP of the white background */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${availabilityColor} z-20`}
      />

      <div className="p-5 flex flex-col h-full bg-white relative z-10">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4 pl-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Hospital ID: #{hospital.id}
              </span>
              {isFull && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                  Full Capacity
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
              {hospital.name}
            </h2>

            {/* Location & Rating Row */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <p className="line-clamp-1">
                  {hospital.city}, {hospital.state}
                </p>
              </div>

              {/* Rating Badge */}
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-700">
                  {rating.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">({reviewCount})</span>
              </div>
            </div>
          </div>

          {/* Toggle between Building Icon and Close Button */}
          {isExpanded ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpand(null); // Close map
              }}
              className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-full transition shrink-0"
            >
              <X size={20} />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
              <Building2 size={20} />
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-auto space-y-3 pl-2">
          {/* Availability Pill */}
          <div
            className={`flex items-center justify-between px-3 py-2 rounded-lg ${availabilityBg}`}
          >
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Availability
            </span>
            <div className="flex items-center gap-1.5">
              <Activity className={`w-4 h-4 ${availabilityText}`} />
              <span className={`text-sm font-bold ${availabilityText}`}>
                {freeBeds}{" "}
                <span className="text-slate-500 font-medium">
                  / {totalBeds} Beds Free
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Rooms Stat */}
            <div className="flex items-center gap-2 px-2">
              <div className="text-slate-400">
                <Building2 size={16} />
              </div>
              <div className="text-xs">
                <span className="block font-bold text-slate-700 text-sm">
                  {totalRooms}
                </span>
                <span className="text-slate-500">Total Rooms</span>
              </div>
            </div>

            {/* Contact Stat */}
            {hospital.contactNumber && (
              <div className="flex items-center gap-2 px-2 border-l border-slate-100">
                <div className="text-slate-400">
                  <Phone size={16} />
                </div>
                <div className="text-xs">
                  <span className="block font-bold text-slate-700 text-sm">
                    Call
                  </span>
                  <span className="text-slate-500">
                    {hospital.contactNumber}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3 pl-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              // Toggle Expansion Mode
              onExpand(isExpanded ? null : hospital.id);
            }}
            className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all shadow-md active:scale-95
              ${
                isExpanded
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
              }
            `}
          >
            <Navigation className="w-4 h-4" />
            {isExpanded ? "Close Map" : "Locate on Map"}
          </button>

          <button
            type="button"
            className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- EXPANDED MAP AREA --- */}
      <div
        className={`transition-[max-height, opacity] duration-500 ease-in-out overflow-hidden bg-slate-50
           ${
             isExpanded
               ? "max-h-[500px] opacity-100 border-t border-slate-200"
               : "max-h-0 opacity-0"
           }
        `}
      >
        {isExpanded && (
          <div className="h-[400px] w-full p-2">
            <HospitalMap
              hospitals={[hospital]}
              center={[hospital.latitude || 18.52, hospital.longitude || 73.85]}
              zoom={15}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalCard;
