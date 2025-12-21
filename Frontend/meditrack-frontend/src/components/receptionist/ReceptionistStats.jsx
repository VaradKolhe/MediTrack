import React, { useState, useMemo } from "react";
import {
  Activity,
  BedDouble,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Search,
  Waves,
} from "lucide-react";

// ReceptionistStats Component
export default function ReceptionistStats({ user, summary, hospital }) {
  return (
    <div className="grid lg:grid-cols-4 gap-4">
      <StatCard
        icon={Activity}
        gradientFrom="from-cyan-500"
        gradientTo="to-blue-600"
        label="Hospital"
        value={
          hospital?.name ||
          (user.hospitalId ? `#${user.hospitalId}` : "Not assigned")
        }
      />
      <StatCard
        icon={BedDouble}
        gradientFrom="from-teal-500"
        gradientTo="to-emerald-600"
        label="Total Rooms"
        value={summary.totalRooms}
      />
      <StatCard
        icon={CheckCircle2}
        gradientFrom="from-emerald-500"
        gradientTo="to-green-600"
        label="Available Beds"
        value={summary.availableBeds}
      />
      <StatCard
        icon={XCircle}
        gradientFrom="from-rose-500"
        gradientTo="to-pink-600"
        label="Occupied Beds"
        value={summary.occupiedBeds}
      />
    </div>
  );
}

function StatCard({ icon: Icon, gradientFrom, gradientTo, label, value }) {
  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-5 group-hover:opacity-10 transition-opacity`}
      ></div>

      {/* Decorative Circle */}
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-10 rounded-full blur-2xl`}
      ></div>

      <div className="relative p-6 flex items-center gap-4">
        <div
          className={`p-4 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {label}
          </p>
          <p
            className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate max-w-[150px]"
            title={value}
          >
            {value}
          </p>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div
        className={`h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
      ></div>
    </div>
  );
}
