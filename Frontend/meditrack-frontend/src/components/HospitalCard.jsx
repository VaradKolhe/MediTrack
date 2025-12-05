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
      className="text-left bg-white rounded-3xl border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all p-6 flex flex-col gap-4"
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold">
          Hospital
        </p>
        <h2 className="text-xl font-semibold text-gray-900">
          {hospital.name}
        </h2>
        <p className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-500" />
          {hospital.city}, {hospital.state}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-blue-50 p-3 border border-blue-100">
          <p className="text-xs text-gray-600 uppercase font-medium">Total beds</p>
          <p className="text-lg font-semibold text-gray-900">{totalBeds}</p>
        </div>
        <div className="rounded-2xl bg-rose-50 p-3 border border-rose-100">
          <p className="text-xs text-gray-600 uppercase font-medium">Occupied</p>
          <p className="text-lg font-semibold text-rose-600">
            {occupiedBeds}
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 border border-emerald-100">
          <p className="text-xs text-gray-600 uppercase font-medium">Rooms</p>
          <p className="text-lg font-semibold text-emerald-600">
            {totalRooms}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
        <span className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          Free beds: <strong className="text-gray-900">{freeBeds}</strong>
        </span>
        {hospital.contactNumber && (
          <span className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            {hospital.contactNumber}
          </span>
        )}
      </div>
    </button>
  );
};

export default HospitalCard;
