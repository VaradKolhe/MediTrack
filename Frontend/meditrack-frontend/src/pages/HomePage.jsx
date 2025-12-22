import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  BedDouble,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";
import { hospitalApiInstance as instancehospital } from "../api/axiosConfig";
import HospitalCard from "../components/HospitalCard";
import HospitalModal from "../components/HospitalModal";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// --- OPTIMIZED PARTICLES COMPONENT (Moved Outside) ---
const FloatingParticles = React.memo(() => {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const left = Math.random() * 100;
      // We don't need 'top' here because animation handles Y-axis,
      // but we use negative delay to simulate random vertical positions.
      const size = Math.random() < 0.3 ? 4 : 8;
      const duration = 15 + Math.random() * 20; // Between 15s and 35s

      // CRITICAL FIX: The delay must be a random value between 0 and the duration.
      // Making it negative starts the animation "in the past", putting the
      // particle in the middle of the screen immediately.
      const delay = Math.random() * duration;

      const opacity = 0.5 + Math.random() * 0.3;
      const colors = ["bg-teal-300", "bg-blue-300", "bg-sky-300"];
      const color = colors[i % 3];

      return { left, size, duration, delay, opacity, color };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden h-full w-full bg-slate-50/50">
      <style>
        {`
          @keyframes floatUp {
            0% { transform: translateY(110vh) scale(0.8); opacity: 0; }
            10% { opacity: var(--target-opacity); }
            90% { opacity: var(--target-opacity); }
            100% { transform: translateY(-10vh) scale(1.1); opacity: 0; }
          }
        `}
      </style>
      {particles.map((p, i) => (
        <div
          key={`particle-${i}`}
          className={`absolute rounded-full ${p.color} blur-[2px]`}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            "--target-opacity": p.opacity,
            // Optimized animation usage
            animationName: "floatUp",
            animationDuration: `${p.duration}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            // Negative delay makes it appear instantly at random height
            animationDelay: `-${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
});

// --- FRAMER MOTION VARIANTS ---

const listContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const listItem = {
  hidden: { y: 40, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 0.8,
    },
  },
};

const HomePage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [expandedId, setExpandedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const navigate = useNavigate();

  // --- 1. DEFINE THE REUSABLE FUNCTION (Move this outside useEffect) ---
  const fetchHospitals = useCallback(async (isBackground = false) => {
    // Determine which loading state to use
    if (isBackground) {
      setIsRefetching(true); // Small spinner
    } else {
      setIsLoading(true); // Full skeleton loader
    }

    try {
      const res = await instancehospital.get("/public/hospitals");
      const data = res.data.data ?? [];

      setHospitals(data);
      setLastSynced(new Date()); // Update the time ONLY on success
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync network");
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, []);

  // --- 2. USE THE FUNCTION (Initial Load + Interval) ---
  useEffect(() => {
    // A. Initial Load (Full skeleton)
    fetchHospitals(false);

    // B. Auto-Refresh every 5 minutes (Background spinner)
    const intervalId = setInterval(() => {
      fetchHospitals(true);
    }, 300000); // 300,000 ms = 5 minutes

    // Cleanup: Stop the timer if the user leaves the page
    return () => clearInterval(intervalId);
  }, [fetchHospitals]);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hospital) => {
      const matchesSearch = hospital.name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchesCity =
        selectedCity === "ALL" || hospital.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [hospitals, search, selectedCity]);

  const summary = useMemo(() => {
    const totalBeds = hospitals.reduce(
      (acc, h) => acc + (Number(h.totalBeds) || 0),
      0
    );
    const occupiedBeds = hospitals.reduce(
      (acc, h) => acc + (Number(h.occupiedBeds) || 0),
      0
    );
    const freeBeds = Math.max(totalBeds - occupiedBeds, 0);
    return { total: hospitals.length, totalBeds, occupiedBeds, freeBeds };
  }, [hospitals]);

  const cities = useMemo(() => {
    const unique = new Set();
    hospitals.forEach((h) => {
      if (h.city) unique.add(h.city);
    });
    return Array.from(unique);
  }, [hospitals]);

  const hasActiveFilters = search.trim() !== "" || selectedCity !== "ALL";

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="h-48 rounded-2xl bg-white/80 backdrop-blur-sm animate-pulse border border-slate-200"
        />
      ))}
    </div>
  );

  return (
    <motion.div
      className="space-y-10 relative min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <FloatingParticles />

      {/* HEADER SECTION */}
      <motion.div
        className="relative z-10 overflow-hidden rounded-3xl border-2 border-teal-200/60 bg-gradient-to-br from-white via-cyan-50/40 to-teal-50/60 backdrop-blur-xl shadow-2xl"
        initial={{ y: -50, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.1 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.15),transparent_50%)]" />

          <div className="relative px-6 py-12 lg:px-12">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
              <div className="space-y-4 flex-1 max-w-3xl">
                <motion.span
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.35em] text-white shadow-lg"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  Live availability network
                  <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse shadow-md" />
                </motion.span>

                <motion.h1
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-teal-800 to-cyan-800 bg-clip-text text-transparent leading-tight"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  Locate hospitals with ready beds and real-time contact info.
                </motion.h1>

                <motion.p
                  className="text-lg text-slate-700 leading-relaxed font-medium"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  Filter by city, scan live bed capacity, and drill into
                  hospital details—all within a crisp, distraction-free
                  workspace.
                </motion.p>

                <motion.div
                  className="flex flex-wrap gap-3"
                  initial="hidden"
                  animate="visible"
                  variants={listContainer}
                >
                  {[
                    {
                      text: "Instant search",
                      color: "from-emerald-500 to-teal-500",
                    },
                    {
                      text: "City filters",
                      color: "from-cyan-500 to-blue-500",
                    },
                    {
                      text: "Live occupancy",
                      color: "from-teal-500 to-cyan-500",
                    },
                    {
                      text: "Verified contacts",
                      color: "from-blue-500 to-indigo-500",
                    },
                  ].map((chip, index) => (
                    <motion.span
                      key={chip.text}
                      className={`rounded-full bg-gradient-to-r ${chip.color} px-5 py-2.5 text-sm font-bold text-white shadow-md border border-white/20`}
                      variants={listItem}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      {chip.text}
                    </motion.span>
                  ))}
                </motion.div>
              </div>

              {/* --- NETWORK SYNC CARD --- */}
              <motion.div
                className="w-full max-w-sm cursor-pointer group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, type: "spring", stiffness: 100 }}
                onClick={() => fetchHospitals(true)}
                title="Click to force network sync"
              >
                <div className="rounded-2xl border-2 border-teal-200/60 bg-gradient-to-br from-white to-teal-50/30 backdrop-blur-md shadow-xl px-6 py-5 flex items-center gap-4 transition-transform group-hover:scale-[1.02] active:scale-95">
                  {/* SPINNER ICON */}
                  <div
                    className={`flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg transition-all ${
                      isRefetching ? "scale-110 shadow-teal-500/50" : ""
                    }`}
                  >
                    <RefreshCw
                      className={`w-7 h-7 text-white ${
                        isRefetching || isLoading ? "animate-spin" : ""
                      }`}
                    />
                  </div>

                  {/* TEXT CONTENT */}
                  <div>
                    <p className="text-sm text-teal-700 font-bold flex items-center gap-2">
                      Network synced
                      {isRefetching && (
                        <span className="inline-flex h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                      )}
                    </p>

                    {/* THE TIME DISPLAY */}
                    {/* key=lastSynced forces this element to re-render (flash) on update */}
                    <motion.p
                      key={lastSynced?.toISOString()}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-bold text-slate-900 text-xl"
                    >
                      {lastSynced
                        ? new Intl.DateTimeFormat(undefined, {
                            hour: "numeric",
                            minute: "numeric",
                            second: "numeric", // Added seconds for better feedback
                          }).format(lastSynced)
                        : "Syncing..."}
                    </motion.p>

                    <p className="text-xs text-cyan-600 mt-1 font-medium group-hover:underline decoration-cyan-400/50 underline-offset-2">
                      Auto-updates every 5m
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by hospital name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-teal-200/50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 focus:outline-none shadow-md transition"
                />
              </div>
              <motion.div
                className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1"
                initial="hidden"
                animate="visible"
                variants={listContainer}
              >
                {[
                  { city: "ALL", label: "All cities" },
                  ...cities.map((c) => ({ city: c, label: c })),
                ].map((item, index) => (
                  <motion.button
                    key={item.city}
                    className={`px-6 py-3 rounded-2xl border-2 text-sm font-bold transition whitespace-nowrap shadow-md ${
                      selectedCity === item.city
                        ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-teal-600"
                        : "bg-white border-teal-200/60 text-slate-700 hover:border-teal-400 hover:bg-teal-50/50"
                    }`}
                    onClick={() => setSelectedCity(item.city)}
                    variants={{
                      hidden: { opacity: 0.7, scale: 0.9 },
                      visible: {
                        opacity: 1,
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 200,
                          delay: index * 0.05,
                        },
                      },
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* MAIN CONTENT AREA */}
      <div className="space-y-10 relative z-10">
        {hasActiveFilters && (
          <>
            <motion.div
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-teal-800 bg-clip-text text-transparent">
                {selectedCity === "ALL"
                  ? search.trim() !== ""
                    ? `Search results for "${search}"`
                    : "Hospitals across the network"
                  : `Hospitals in ${selectedCity}`}
              </h2>
              <p className="text-slate-600 text-lg">
                {filteredHospitals.length} location
                {filteredHospitals.length === 1 ? "" : "s"} found
                {search.trim() !== "" && ` matching "${search}"`}
                {selectedCity !== "ALL" && ` in ${selectedCity}`}.
              </p>
            </motion.div>

            {isLoading ? (
              renderSkeleton()
            ) : filteredHospitals.length ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={listContainer}
              >
                {filteredHospitals.map((hospital) => {
                  const isExpanded = expandedId === hospital.id;
                  return (
                    <motion.div
                      key={hospital.id}
                      layout
                      variants={listItem}
                      className={`transition-all duration-500 ease-in-out ${
                        isExpanded
                          ? "col-span-1 sm:col-span-2 xl:col-span-3 z-10"
                          : ""
                      }`}
                    >
                      <HospitalCard
                        hospital={hospital}
                        isExpanded={isExpanded}
                        onExpand={setExpandedId}
                        onClick={(h) => setSelectedHospital(h)}
                        onNavigate={(h) => {
                          if (h.latitude && h.longitude) {
                            navigate(
                              `/user/map?lat=${h.latitude}&lng=${
                                h.longitude
                              }&name=${encodeURIComponent(h.name)}`
                            );
                          } else {
                            toast.error(
                              "Location data not available for this hospital"
                            );
                          }
                        }}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                className="rounded-3xl border-2 border-dashed border-teal-300 bg-gradient-to-br from-white to-cyan-50/30 backdrop-blur-sm p-16 text-center shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 border-2 border-teal-300 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <AlertTriangle className="w-10 h-10 text-teal-600" />
                </div>
                <p className="text-xl font-bold text-slate-900">
                  No hospitals match {search.trim() !== "" && `"${search}"`}{" "}
                  {selectedCity !== "ALL" && `in ${selectedCity}`}.
                </p>
                <p className="text-slate-600 mt-2 text-base">
                  Try clearing filters or checking spelling to see more
                  facilities.
                </p>
              </motion.div>
            )}
          </>
        )}

        {!hasActiveFilters && (
          <motion.div
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={listContainer}
          >
            {[
              {
                label: "Hospitals",
                value: summary.total,
                icon: MapPin,
                sub: "Active on network",
                gradient: "from-blue-500 to-indigo-600",
                bgGradient: "from-blue-50/50 to-indigo-50/50",
                iconColor: "text-blue-600",
                // Blue tinted shadow
                shadowClass: "shadow-[0_10px_40px_-10px_rgba(59,130,246,0.25)]",
              },
              {
                label: "Total Beds",
                value: summary.totalBeds,
                icon: BedDouble,
                sub: "Across all facilities",
                gradient: "from-emerald-500 to-teal-600",
                bgGradient: "from-emerald-50/50 to-teal-50/50",
                iconColor: "text-emerald-600",
                // Emerald tinted shadow
                shadowClass: "shadow-[0_10px_40px_-10px_rgba(16,185,129,0.25)]",
              },
              {
                label: "Occupied",
                value: summary.occupiedBeds,
                icon: Activity,
                sub: "Currently in use",
                gradient: "from-rose-500 to-pink-600",
                bgGradient: "from-rose-50/50 to-pink-50/50",
                iconColor: "text-rose-600",
                // Rose tinted shadow
                shadowClass: "shadow-[0_10px_40px_-10px_rgba(244,63,94,0.25)]",
              },
              {
                label: "Free Beds",
                value: summary.freeBeds,
                icon: AlertTriangle,
                sub: "Immediately available",
                gradient: "from-amber-500 to-orange-600",
                bgGradient: "from-amber-50/50 to-orange-50/50",
                iconColor: "text-amber-600",
                // Amber tinted shadow
                shadowClass: "shadow-[0_10px_40px_-10px_rgba(245,158,11,0.25)]",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  // Applied the dynamic card.shadowClass here
                  className={`bg-gradient-to-br ${card.bgGradient} backdrop-blur-md rounded-3xl border border-white/60 p-6 relative overflow-hidden ${card.shadowClass}`}
                  variants={listItem}
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    // Intentionally kept standard on hover for contrast, or you can make this dynamic too
                    boxShadow: "0 20px 40px -5px rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-sm`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-xs uppercase tracking-widest text-slate-600 font-bold">
                      {card.label}
                    </p>
                    <p className={`text-4xl font-black ${card.iconColor} mt-2`}>
                      {card.value}
                    </p>
                    <p className="text-sm text-slate-700 mt-2 font-semibold">
                      {card.sub}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {!hasActiveFilters && (
          <>
            <motion.div
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-teal-800 bg-clip-text text-transparent">
                Hospitals across the network
              </h2>
              <p className="text-slate-600 text-lg">
                {filteredHospitals.length} location
                {filteredHospitals.length === 1 ? "" : "s"} available.
              </p>
            </motion.div>

            {isLoading ? (
              renderSkeleton()
            ) : filteredHospitals.length ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={listContainer}
              >
                {filteredHospitals.map((hospital) => {
                  const isExpanded = expandedId === hospital.id;
                  return (
                    <motion.div
                      key={hospital.id}
                      layout
                      variants={listItem}
                      className={`transition-all duration-500 ease-in-out ${
                        isExpanded
                          ? "col-span-1 sm:col-span-2 xl:col-span-3 z-10"
                          : ""
                      }`}
                    >
                      <HospitalCard
                        hospital={hospital}
                        isExpanded={isExpanded}
                        onExpand={setExpandedId}
                        onClick={(h) => setSelectedHospital(h)}
                        onNavigate={(h) => {
                          if (h.latitude && h.longitude) {
                            navigate(
                              `/user/map?lat=${h.latitude}&lng=${
                                h.longitude
                              }&name=${encodeURIComponent(h.name)}`
                            );
                          } else {
                            toast.error(
                              "Location data not available for this hospital"
                            );
                          }
                        }}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                className="rounded-3xl border-2 border-dashed border-teal-300 bg-gradient-to-br from-white to-cyan-50/30 backdrop-blur-sm p-16 text-center shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 border-2 border-teal-300 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <AlertTriangle className="w-10 h-10 text-teal-600" />
                </div>
                <p className="text-xl font-bold text-slate-900">
                  No hospitals available.
                </p>
                <p className="text-slate-600 mt-2 text-base">
                  Please check back later.
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {selectedHospital && (
        <HospitalModal
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </motion.div>
  );
};

export default HomePage;
