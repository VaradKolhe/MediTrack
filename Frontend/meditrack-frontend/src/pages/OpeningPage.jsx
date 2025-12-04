import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, MapPin, ShieldCheck } from "lucide-react";

const heroStats = [
  { label: "Hospitals Connected", value: "120+", icon: ShieldCheck },
  { label: "Beds Monitored", value: "18,400", icon: Activity },
  { label: "Cities Covered", value: "42", icon: MapPin },
];

export default function OpeningPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-900/40" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_55%)]" />
      <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-16 flex flex-col gap-12 top-[60px]">

        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm text-cyan-200 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live nationwide availability
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
                Shape faster care decisions with live bed intelligence.
              </h1>
              <p className="text-lg text-slate-300 mt-4 leading-relaxed">
                BedTracker unifies every facility, room, and bed into a single,
                dynamic view so your teams can coordinate transfers in seconds.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/home")}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/60 transition cursor-pointer"
              >
                Explore Availability
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 rounded-2xl border border-white/30 text-white flex items-center gap-2 hover:bg-white/10 transition cursor-pointer"
              >
                Login Portal <ArrowRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {heroStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4"
                  >
                    <Icon className="text-cyan-300 mb-3 w-5 h-5" />
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-300">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/30 blur-3xl" />
            <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-900/60 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(15,23,42,0.6)]">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Live feed
                </p>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200">
                  Synced 2s ago
                </span>
              </div>
              <div className="space-y-4">
                {[
                  { name: "City Heart Center", beds: "12 / 80", city: "Delhi" },
                  { name: "Unity Health Central", beds: "03 / 40", city: "Mumbai" },
                  { name: "Pacific Care Hub", beds: "27 / 120", city: "Bengaluru" },
                ].map((hospital) => (
                  <div
                    key={hospital.name}
                    className="rounded-2xl border border-white/5 bg-white/5 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{hospital.name}</p>
                      <p className="text-sm text-slate-300">{hospital.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{hospital.beds}</p>
                      <p className="text-xs text-slate-400">Beds free</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl border border-white/5 bg-white/10 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
                  Smart alerts
                </p>
                <p className="text-2xl font-semibold mt-2">
                  4 facilities nearing capacity
                </p>
                <p className="text-sm text-slate-300 mt-2">
                  Login to dispatch available beds or reroute patients in one tap.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
