import React from "react";
import { Activity, MapPin, Phone } from "lucide-react";

const HospitalCard = ({ hospital, onClick }) => {
  const totalBeds = hospital.totalBeds ?? 0;
  const occupiedBeds = hospital.occupiedBeds ?? 0;
  const freeBeds = Math.max(totalBeds - occupiedBeds, 0);
  const totalRooms = hospital.totalRooms ?? hospital.rooms?.length ?? "—";

  return (
    <button
      type="button"
      onClick={() => onClick(hospital)}
      className="text-left bg-slate-900/80 rounded-3xl border border-white/10 shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all p-6 flex flex-col gap-4"
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Hospital
        </p>
        <h2 className="text-xl font-semibold text-white">
          {hospital.name}
        </h2>
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <MapPin className="w-4 h-4 text-slate-500" />
          {hospital.city}, {hospital.state}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="text-xs text-slate-400 uppercase">Total beds</p>
          <p className="text-lg font-semibold text-white">{totalBeds}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="text-xs text-slate-400 uppercase">Occupied</p>
          <p className="text-lg font-semibold text-rose-400">
            {occupiedBeds}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="text-xs text-slate-400 uppercase">Rooms</p>
          <p className="text-lg font-semibold text-emerald-300">
            {totalRooms}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-400 pt-2 border-t border-white/10">
        <span className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-300" />
          Free beds: <strong className="text-white">{freeBeds}</strong>
        </span>
        {hospital.contactNumber && (
          <span className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-500" />
            {hospital.contactNumber}
          </span>
        )}
      </div>
    </button>
  );
};

export default HospitalCard;
