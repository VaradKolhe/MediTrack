import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BedDouble,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";
import instancehospital from "../api/axiosConfig";
import HospitalCard from "../components/HospitalCard";
import HospitalModal from "../components/HospitalModal";

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

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="h-48 rounded-2xl bg-slate-800 animate-pulse border border-white/10"
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/80 to-blue-950/40 border border-white/10 rounded-3xl">
        <div className="px-6 py-12 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                Live availability network
              </p>
              <h1 className="text-4xl font-semibold text-white leading-tight max-w-2xl">
                Quickly locate hospitals with ready beds and real-time contact
                info.
              </h1>
              <p className="text-slate-300 max-w-2xl">
                Filter by city, scan live bed capacity, and drill into hospital
                details—all without leaving this page.
              </p>
            </div>
            <div className="bg-slate-900/80 rounded-2xl border border-white/10 shadow-lg shadow-cyan-500/10 px-6 py-4 flex items-center gap-4">
              <RefreshCw className="w-5 h-5 text-cyan-300 animate-spin" />
              <div>
                <p className="text-sm text-slate-400">Network synced</p>
                <p className="font-semibold text-white">
                  {new Intl.DateTimeFormat(undefined, {
                    hour: "numeric",
                    minute: "numeric",
                  }).format(new Date())}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[240px] max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by hospital name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:outline-none shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <button
                className={`px-5 py-2 rounded-full border text-sm font-medium transition ${
                  selectedCity === "ALL"
                    ? "bg-cyan-500/90 text-slate-950 border-transparent"
                    : "bg-slate-900 border-white/10 text-white/80 hover:border-white/30"
                }`}
                onClick={() => setSelectedCity("ALL")}
              >
                All cities
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  className={`px-5 py-2 rounded-full border text-sm font-medium transition ${
                    selectedCity === city
                      ? "bg-cyan-500/90 text-slate-950 border-transparent"
                      : "bg-slate-900 border-white/10 text-white/80 hover:border-white/30"
                  }`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Hospitals",
              value: summary.total,
              icon: MapPin,
              sub: "Active on network",
            },
            {
              label: "Total Beds",
              value: summary.totalBeds,
              icon: BedDouble,
              sub: "Across all facilities",
            },
            {
              label: "Occupied",
              value: summary.occupiedBeds,
              icon: Activity,
              sub: "Currently in use",
            },
            {
              label: "Free Beds",
              value: summary.freeBeds,
              icon: AlertTriangle,
              sub: "Immediately available",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-slate-900/80 rounded-3xl border border-white/10 shadow-sm p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {card.label}
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {card.value}
                  </p>
                  <p className="text-sm text-slate-500">{card.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white">
            {selectedCity === "ALL"
              ? "Hospitals across the network"
              : `Hospitals in ${selectedCity}`}
          </h2>
          <p className="text-slate-400">
            {filteredHospitals.length} location
            {filteredHospitals.length === 1 ? "" : "s"} match your filters.
          </p>
        </div>

        {isLoading ? (
          renderSkeleton()
        ) : filteredHospitals.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                onClick={(h) => setSelectedHospital(h)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/20 bg-slate-900/60 p-10 text-center text-slate-300">
            <p className="text-lg font-semibold text-white">
              No hospitals match “{search}” in{" "}
              {selectedCity === "ALL" ? "all cities" : selectedCity}.
            </p>
            <p className="mt-2">
              Try clearing filters or checking spelling to see more facilities.
            </p>
          </div>
        )}
      </div>

      {selectedHospital && (
        <HospitalModal
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
