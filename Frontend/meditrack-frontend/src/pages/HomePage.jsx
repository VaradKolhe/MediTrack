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
          className="h-48 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="px-6 py-12 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="space-y-4 flex-1">
              <p className="text-sm uppercase tracking-[0.3em] text-[#1D4ED8] font-semibold">
                Live availability network
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight max-w-2xl">
                Quickly locate hospitals with ready beds and real-time contact info.
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Filter by city, scan live bed capacity, and drill into hospital
                details—all without leaving this page.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-2xl border border-[#BFDBFE] px-6 py-5 flex items-center gap-4 w-full lg:w-auto">
              <div className="flex-shrink-0">
                <RefreshCw className="w-6 h-6 text-[#1D4ED8] animate-spin" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Network synced</p>
                <p className="font-bold text-slate-900 text-lg">
                  {new Intl.DateTimeFormat(undefined, {
                    hour: "numeric",
                    minute: "numeric",
                  }).format(new Date())}
                </p>
              </div>
            </div>
          </div>

            <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by hospital name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#1D4ED8]/30 focus:border-[#1D4ED8] focus:outline-none shadow-sm transition"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                className={`px-6 py-3 rounded-xl border text-sm font-semibold transition whitespace-nowrap ${
                  selectedCity === "ALL"
                    ? "bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-md"
                    : "bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
                onClick={() => setSelectedCity("ALL")}
              >
                All cities
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  className={`px-6 py-3 rounded-xl border text-sm font-semibold transition whitespace-nowrap ${
                    selectedCity === city
                      ? "bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-md"
                      : "bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
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
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
              <div
                key={card.label}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition"
              >
                <div className={`w-14 h-14 rounded-xl ${card.bgColor} ${card.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {card.value}
                </p>
                <p className="text-sm text-slate-600 mt-2">{card.sub}</p>
              </div>
            );
          })}
        </div>

        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            {selectedCity === "ALL"
              ? "Hospitals across the network"
              : `Hospitals in ${selectedCity}`}
          </h2>
          <p className="text-slate-600 text-lg mt-2">
            {filteredHospitals.length} location{filteredHospitals.length === 1 ? "" : "s"} match
            {selectedCity !== "ALL" && ` in ${selectedCity}`}.
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
          <div className="rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-xl font-semibold text-slate-900">
              No hospitals match "{search}"{" "}
              {selectedCity !== "ALL" && `in ${selectedCity}`}.
            </p>
            <p className="text-slate-600 mt-2 text-base">
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
