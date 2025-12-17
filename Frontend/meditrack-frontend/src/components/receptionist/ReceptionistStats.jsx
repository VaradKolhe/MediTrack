import React from "react";
import { Activity, BedDouble, CheckCircle2, XCircle } from "lucide-react";

export default function ReceptionistStats({ user, summary, hospital }) {
  return (
    <div className="grid lg:grid-cols-4 gap-4">
      <StatCard
        icon={Activity}
        colorClass="bg-blue-50 text-blue-700"
        label="Hospital"
        value={
          hospital?.name ||
          (user.hospitalId ? `#${user.hospitalId}` : "Not assigned")
        }
      />
      <StatCard
        icon={BedDouble}
        colorClass="bg-indigo-50 text-indigo-700"
        label="Total Rooms"
        value={summary.totalRooms}
      />
      <StatCard
        icon={CheckCircle2}
        colorClass="bg-emerald-50 text-emerald-700"
        label="Available Beds"
        value={summary.availableBeds}
      />
      <StatCard
        icon={XCircle}
        colorClass="bg-rose-50 text-rose-700"
        label="Occupied Beds"
        value={summary.occupiedBeds}
      />
    </div>
  );
}

function StatCard({ icon: Icon, colorClass, label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p
          className="text-lg font-semibold text-slate-900 truncate max-w-[150px]"
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
