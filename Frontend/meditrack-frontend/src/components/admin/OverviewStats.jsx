import { useMemo } from "react";
import {
  Building2,
  BedDouble,
  Activity,
  Users2,
  ShieldCheck,
  ClipboardPlus,
} from "lucide-react";
import { motion } from "framer-motion";

// --- CUSTOM COLOR SCHEME ---
const primaryColor = "text-teal-600"; // Used for Total/Core Metrics (Teal)
const secondaryColor = "text-violet-600"; // Used for Structural Metrics (Violet)
const occupiedColor = "text-rose-500"; // Used for Active/Negative Metrics (Rose)
const peopleColor = "text-emerald-500"; // Used for People/User Metrics (Emerald)

// Framer Motion Animation Variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Slightly tighter stagger
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 18,
    },
  },
};

// Animation for individual list items inside the tables
const tableItem = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

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
        color: secondaryColor,
      },
      {
        label: "Total Beds",
        value: totalBeds,
        icon: BedDouble,
        desc: "Across all hospitals",
        color: primaryColor,
      },
      {
        label: "Occupied Beds",
        value: occupiedBeds,
        icon: Activity,
        desc: "Reported usage",
        color: occupiedColor, // Using Rose
      },
      {
        label: "Receptionists",
        value: data.receptionists.length,
        icon: Users2,
        desc: "Contact points",
        color: peopleColor, // Using Emerald
      },
    ];
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Stat Cards Grid (Animated Container) */}
      <motion.div
        className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            whileHover={{
              scale: 1.05,
              y: -8,
              transition: { type: "spring", stiffness: 400, damping: 15 },
            }}
            className={`relative overflow-hidden bg-white rounded-2xl border-2 p-6 shadow-lg cursor-pointer transition-shadow duration-300
    ${
      stat.label === "Hospitals"
        ? "border-violet-100 hover:shadow-violet-500/20"
        : ""
    }
    ${
      stat.label === "Total Beds"
        ? "border-teal-100 hover:shadow-teal-500/20"
        : ""
    }
    ${
      stat.label === "Occupied Beds"
        ? "border-rose-100 hover:shadow-rose-500/20"
        : ""
    }
    ${
      stat.label === "Receptionists"
        ? "border-emerald-100 hover:shadow-emerald-500/20"
        : ""
    }
  `}
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 opacity-40 pointer-events-none
    ${
      stat.label === "Hospitals"
        ? "bg-gradient-to-br from-violet-50 to-transparent"
        : ""
    }
    ${
      stat.label === "Total Beds"
        ? "bg-gradient-to-br from-teal-50 to-transparent"
        : ""
    }
    ${
      stat.label === "Occupied Beds"
        ? "bg-gradient-to-br from-rose-50 to-transparent"
        : ""
    }
    ${
      stat.label === "Receptionists"
        ? "bg-gradient-to-br from-emerald-50 to-transparent"
        : ""
    }
  `}
            ></div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
                  {stat.label}
                </p>
                {/* Icon with matching color background */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 
                    ${
                      stat.label === "Hospitals"
                        ? "bg-violet-100 text-violet-600"
                        : ""
                    }
                    ${
                      stat.label === "Total Beds"
                        ? "bg-teal-100 text-teal-600"
                        : ""
                    }
                    ${
                      stat.label === "Occupied Beds"
                        ? "bg-rose-100 text-rose-600"
                        : ""
                    }
                    ${
                      stat.label === "Receptionists"
                        ? "bg-emerald-100 text-emerald-600"
                        : ""
                    }
                  `}
                >
                  <stat.icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-5xl font-extrabold text-slate-900 mb-2">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-sm text-slate-500 font-medium">{stat.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tables Row (Animated Entrance) */}
      <motion.div
        className="grid lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 50, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 15 }}
      >
        {/* Top Hospitals */}
        <div className="relative overflow-hidden bg-white rounded-2xl border-2 border-violet-100 p-6 shadow-xl">
          {/* Header with gradient background */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-violet-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
              <Building2 className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Top Hospitals
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                By bed capacity
              </p>
            </div>
          </div>

          <motion.div
            className="space-y-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {[...data.hospitals]
              .sort((a, b) => (b.totalBeds || 0) - (a.totalBeds || 0))
              .slice(0, 4)
              .map((h, index) => (
                <motion.div
                  key={h.id}
                  className="flex justify-between items-center bg-gradient-to-r from-violet-50/50 to-transparent border-2 border-violet-100 p-4 rounded-xl transition-all duration-50 hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/10 cursor-pointer group"
                  variants={tableItem}
                  whileHover={{
                    x: 5,
                    transition: { type: "spring", stiffness: 400, damping: 20 },
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/30">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                        {h.name}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        📍 {h.city}, {h.state}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold text-violet-600">
                      {h.totalBeds}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold uppercase">
                      beds
                    </p>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>

        {/* Recent Receptionists */}
        <div className="relative overflow-hidden bg-white rounded-2xl border-2 border-emerald-100 p-6 shadow-xl">
          {/* Header with gradient background */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Users2 className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recent Receptionists
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Latest additions
              </p>
            </div>
          </div>

          <motion.div
            className="space-y-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {[...data.receptionists]
              .slice(-4)
              .reverse()
              .map((r, index) => (
                <motion.div
                  key={r.id}
                  className="flex justify-between items-center bg-gradient-to-r from-emerald-50/50 to-transparent border-2 border-emerald-100 p-4 rounded-xl transition-all duration-50 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/10 cursor-pointer group"
                  variants={tableItem}
                  whileHover={{
                    x: 5,
                    transition: { type: "spring", stiffness: 400, damping: 20 },
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                      <Users2 className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="font-bold capitalize text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {r.firstName} {r.lastName}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        ✉️ {r.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      {hospitalLookup.get(r.hospitalId)?.name || "N/A"}
                    </p>
                  </div>
                </motion.div>
              ))}
            {data.receptionists.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 font-medium">
                  No receptionists found
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
