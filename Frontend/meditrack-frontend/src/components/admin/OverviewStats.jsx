import { useMemo } from "react";
import {
  Building2,
  BedDouble,
  Activity,
  Users2,
  ShieldCheck,
  ClipboardPlus,
} from "lucide-react";

export default function OverviewStats({ data, hospitalLookup }) {
  const stats = useMemo(() => {
    const totalBeds = data.hospitals.reduce(
      (acc, h) => acc + (Number(h.totalBeds) || 0),
      0
    );
    const occupiedBeds = data.hospitals.reduce(
      (acc, h) => acc + (Number(h.occupiedBeds) || 0),
      0
    );

    return [
      {
        label: "Hospitals",
        value: data.hospitals.length,
        icon: Building2,
        desc: "Active facilities",
      },
      {
        label: "Total Beds",
        value: totalBeds,
        icon: BedDouble,
        desc: "Across all hospitals",
      },
      {
        label: "Occupied Beds",
        value: occupiedBeds,
        icon: Activity,
        desc: "Reported usage",
      },
      {
        label: "Receptionists",
        value: data.receptionists.length,
        icon: Users2,
        desc: "Contact points",
      },
    ];
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {stat.label}
              </p>
              <stat.icon className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">
              {stat.value}
            </p>
            <p className="text-sm text-slate-500 mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Tables Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Hospitals */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Top Hospitals (Beds)
            </h2>
            <ShieldCheck className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-4">
            {[...data.hospitals]
              .sort((a, b) => (b.totalBeds || 0) - (a.totalBeds || 0))
              .slice(0, 4)
              .map((h) => (
                <div
                  key={h.id}
                  className="flex justify-between border border-slate-100 p-4 rounded-xl"
                >
                  <div>
                    <p className="font-semibold">{h.name}</p>
                    <p className="text-sm text-slate-500">
                      {h.city}, {h.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{h.totalBeds}</p>
                    <p className="text-xs text-slate-500">beds</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Receptionists */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Recent Receptionists
            </h2>
            <ClipboardPlus className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-4">
            {[...data.receptionists]
              .slice(-4)
              .reverse()
              .map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between border border-slate-100 p-4 rounded-xl"
                >
                  <div>
                    <p className="font-semibold capitalize">
                      {r.firstName} {r.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{r.email}</p>
                  </div>
                  <p className="text-xs text-slate-500 uppercase">
                    {hospitalLookup.get(r.hospitalId)?.name || "N/A"}
                  </p>
                </div>
              ))}
            {data.receptionists.length === 0 && (
              <p className="text-slate-500">No data.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
