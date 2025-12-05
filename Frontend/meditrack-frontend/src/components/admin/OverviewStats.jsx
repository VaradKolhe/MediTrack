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
}


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
              boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.2)", // More pronounced shadow
              y: -5 // Lift slightly more
            }} 
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xl shadow-slate-200/50 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest font-medium text-slate-500">
                {stat.label}
              </p>
              {/* Icon with color accent and light background */}
              <div className={`w-8 h-8 ${stat.color} flex items-center justify-center p-1 rounded-full bg-opacity-10`} style={{ backgroundColor: `${stat.color.replace('text-', 'bg-').replace('-600', '-50').replace('-500', '-50')}` }}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-5xl font-extrabold text-slate-900">
              {stat.value.toLocaleString()} {/* Add thousand separators */}
            </p>
            <p className="text-sm text-slate-500 mt-2">{stat.desc}</p>
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
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xl shadow-slate-100/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className={`w-5 h-5 ${secondaryColor}`} />
              Top Hospitals (Beds)
            </h2>
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
                  className="flex justify-between items-center border border-slate-200 p-4 rounded-xl transition hover:bg-slate-50/50 cursor-pointer" // Added cursor-pointer
                  variants={tableItem}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -2,
                    boxShadow: "0 5px 15px -3px rgba(0, 0, 0, 0.1)" // Hover shadow
                  }} 
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-extrabold ${primaryColor}`}>{index + 1}</span>
                    <div>
                      <p className="font-semibold text-slate-800">{h.name}</p>
                      <p className="text-xs text-slate-500">
                        {h.city}, {h.state}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${primaryColor}`}>{h.totalBeds}</p>
                    <p className="text-xs text-slate-500">beds</p>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>

        {/* Recent Receptionists */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xl shadow-slate-100/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users2 className={`w-5 h-5 ${peopleColor}`} />
              Recent Receptionists
            </h2>
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
                  className="flex justify-between items-center border border-slate-200 p-4 rounded-xl transition hover:bg-slate-50/50 cursor-pointer" // Added cursor-pointer
                  variants={tableItem}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -2,
                    boxShadow: "0 5px 15px -3px rgba(0, 0, 0, 0.1)" // Hover shadow
                  }} 
                >
                  <div>
                    <p className="font-semibold capitalize text-slate-800">
                      {r.firstName} {r.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{r.email}</p>
                  </div>
                  <div className='text-right'>
                    <p className={`text-xs text-slate-500 uppercase font-medium bg-indigo-50 px-2 py-0.5 rounded-full`}>
                      {hospitalLookup.get(r.hospitalId)?.name || "N/A"}
                    </p>
                  </div>
                </motion.div>
              ))}
            {data.receptionists.length === 0 && (
              <p className="text-slate-400 py-6 text-center">No data.</p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}