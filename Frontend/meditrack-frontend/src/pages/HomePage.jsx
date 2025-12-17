import React, { useEffect, useMemo, useState } from "react";
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

// --- FRAMER MOTION VARIANTS ---

// Container for staggered elements (used for the hospital grid)
const listContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Subtle stagger for cards
      delayChildren: 0.1,
    },
  },
};

// Individual item variant (used for the hospital cards, metrics, and summary cards)
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

// // Data remains the same
// const headlineMetrics = [
//   { label: "Hospitals connected", value: "120+", tone: "text-sky-600", bg: "bg-sky-50" },
//   { label: "Beds tracked", value: "18.4k", tone: "text-emerald-600", bg: "bg-emerald-50" },
//   { label: "Regions covered", value: "42", tone: "text-indigo-600", bg: "bg-indigo-50" },
// ];

const HomePage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadHospitals = async () => {
      try {
        const res = await instancehospital.get("/public/hospitals");
        const data = res.data.data ?? [];
        if (!ignore) {
          setHospitals(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadHospitals();
    return () => {
      ignore = true;
    };
  }, []);

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="h-48 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
        />
      ))}
    </div>
  );

  return (
    <motion.div
      className="space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* HEADER SECTION: Single, high-impact entrance animation for the whole block
       */}
      <motion.div
        className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-[#ECFEFF] to-white shadow-xl"
        initial={{ y: -50, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.1 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.08),transparent_30%)]" />
          <div className="relative px-6 py-12 lg:px-12">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
              <div className="space-y-4 flex-1 max-w-3xl">
                {/* Tagline */}
                <motion.span
                  className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1D4ED8] shadow-sm border border-[#BFDBFE]"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  Live availability network
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </motion.span>

                {/* Headline */}
                <motion.h1
                  className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  Locate hospitals with ready beds and real-time contact info.
                </motion.h1>

                {/* Subheading */}
                <motion.p
                  className="text-lg text-slate-600 leading-relaxed"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  Filter by city, scan live bed capacity, and drill into
                  hospital details—all within a crisp, distraction-free
                  workspace.
                </motion.p>

                {/* Feature Chips */}
                <motion.div
                  className="flex flex-wrap gap-3"
                  initial="hidden"
                  animate="visible"
                  variants={listContainer}
                >
                  {[
                    "Instant search",
                    "City filters",
                    "Live occupancy",
                    "Verified contacts",
                  ].map((chip, index) => (
                    <motion.span
                      key={chip}
                      className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-200"
                      variants={listItem}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      {chip}
                    </motion.span>
                  ))}
                </motion.div>
              </div>

              {/* Status Box */}
              <motion.div
                className="w-full max-w-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, type: "spring", stiffness: 100 }}
              >
                <div className="rounded-2xl border border-[#BFDBFE] bg-white shadow-md px-6 py-5 flex items-center gap-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-[#1D4ED8] animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">
                      Network synced
                    </p>
                    <p className="font-bold text-slate-900 text-lg">
                      {new Intl.DateTimeFormat(undefined, {
                        hour: "numeric",
                        minute: "numeric",
                      }).format(new Date())}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Refreshes automatically with latest bed counts
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Search and Filters Block */}
            <motion.div
              className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by hospital name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#1D4ED8]/30 focus:border-[#1D4ED8] focus:outline-none shadow-sm transition"
                />
              </div>
              <motion.div
                className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1"
                initial="hidden"
                animate="visible"
                variants={listContainer}
              >
                {/* City Filter Buttons - Pop in with a slight stagger */}
                {[
                  { city: "ALL", label: "All cities" },
                  ...cities.map((c) => ({ city: c, label: c })),
                ].map((item, index) => (
                  <motion.button
                    key={item.city}
                    className={`px-6 py-3 rounded-2xl border text-sm font-semibold transition whitespace-nowrap ${
                      selectedCity === item.city
                        ? "bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-md"
                        : "bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedCity(item.city)}
                    variants={{
                      // Custom variant for delay
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

      {/* HEADLINE METRICS SECTION: Pop in with enhanced hover effects
       */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {headlineMetrics.map((m, index) => (
          <motion.div
            key={m.label}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              rotateZ: index % 2 === 0 ? 0.2 : -0.2 // subtle rotation
            }}
          >
            <div className={`h-14 w-14 rounded-2xl ${m.bg} flex items-center justify-center shadow-inner`}>
              <span className={`text-2xl font-bold ${m.tone}`}>{m.value}</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold">
                {m.label}
              </p>
              <p className="text-sm text-slate-600">Data-backed live network</p>
            </div>
          </motion.div>
        ))}
      </div> */}

      <div className="space-y-10">
        {hasActiveFilters && (
          <>
            {/* Filtered Results Header */}
            <motion.div
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-slate-900">
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

            {/* Filtered Hospitals List */}
            {isLoading ? (
              renderSkeleton()
            ) : filteredHospitals.length ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={listContainer}
              >
                {filteredHospitals.map((hospital) => (
                  <motion.div key={hospital.id} variants={listItem}>
                    <HospitalCard
                      hospital={hospital}
                      onClick={(h) => setSelectedHospital(h)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-16 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-xl font-semibold text-slate-900">
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

        {/* SUMMARY CARDS (When no filters are active) */}
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
                color: "text-blue-600",
                bgColor: "bg-blue-50",
              },
              {
                label: "Total Beds",
                value: summary.totalBeds,
                icon: BedDouble,
                sub: "Across all facilities",
                color: "text-emerald-600",
                bgColor: "bg-emerald-50",
              },
              {
                label: "Occupied",
                value: summary.occupiedBeds,
                icon: Activity,
                sub: "Currently in use",
                color: "text-rose-600",
                bgColor: "bg-rose-50",
              },
              {
                label: "Free Beds",
                value: summary.freeBeds,
                icon: AlertTriangle,
                sub: "Immediately available",
                color: "text-amber-600",
                bgColor: "bg-amber-50",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
                  variants={listItem} // Staggered bounce-in
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
                  }} // Enhanced hover
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${card.bgColor} ${card.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {card.value}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">{card.sub}</p>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* DEFAULT HOSPITAL LIST (When no filters are active) */}
        {!hasActiveFilters && (
          <>
            {/* Header */}
            <motion.div
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-slate-900">
                Hospitals across the network
              </h2>
              <p className="text-slate-600 text-lg">
                {filteredHospitals.length} location
                {filteredHospitals.length === 1 ? "" : "s"} available.
              </p>
            </motion.div>

            {/* Hospital Cards Grid */}
            {isLoading ? (
              renderSkeleton()
            ) : filteredHospitals.length ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={listContainer}
              >
                {filteredHospitals.map((hospital) => (
                  <motion.div key={hospital.id} variants={listItem}>
                    <HospitalCard
                      hospital={hospital}
                      onClick={(h) => setSelectedHospital(h)}
                      /* --- ADD THIS PROP --- */
                      onNavigate={(h) => {
                        // Check if coordinates exist before navigating
                        if (h.latitude && h.longitude) {
                          navigate(
                            `/user/map?lat=${h.latitude}&lng=${
                              h.longitude
                            }&name=${encodeURIComponent(h.name)}`
                          );
                        } else {
                          // Optional: Handle missing coordinates
                          toast.error(
                            "Location data not available for this hospital"
                          );
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-16 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-xl font-semibold text-slate-900">
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
