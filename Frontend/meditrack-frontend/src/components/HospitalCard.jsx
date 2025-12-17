import React from "react";
import {
  Activity,
  MapPin,
  Phone,
  Navigation,
  Building2,
  ArrowRight,
} from "lucide-react";

const HospitalCard = ({ hospital, onClick, onNavigate }) => {
  const totalBeds = hospital.totalBeds ?? 0;
  const occupiedBeds = hospital.occupiedBeds ?? 0;
  const freeBeds = Math.max(totalBeds - occupiedBeds, 0);
  const totalRooms = hospital.totalRooms ?? hospital.rooms?.length ?? 0;

  // Determine availability status color
  const isFull = freeBeds === 0 && totalBeds > 0;
  const availabilityColor = isFull ? "bg-rose-500" : "bg-emerald-500";
  const availabilityText = isFull ? "text-rose-600" : "text-emerald-600";
  const availabilityBg = isFull ? "bg-rose-50" : "bg-emerald-50";

  return (
    <div
      onClick={() => onClick(hospital)}
      className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Status Accent Line (Left Border) */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${availabilityColor}`}
      />

      <div className="p-5 flex flex-col h-full">
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
            <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <p className="line-clamp-1">
                {hospital.city}, {hospital.state}
              </p>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
            <Building2 size={20} />
          </div>
        </div>

        {/* Stats Section - Clean & Informative */}
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
              e.stopPropagation(); // Prevents opening details
              onNavigate(hospital);
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-blue-200 hover:shadow-lg active:scale-95"
          >
            <Navigation className="w-4 h-4" />
            Locate on Map
          </button>

          <button
            type="button"
            className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;
