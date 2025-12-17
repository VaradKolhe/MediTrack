import React, { useEffect, useState } from "react";
import HospitalMap from "../HospitalMap";
import { receptionistApi } from "../../api/receptionistApi";

const MapPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await receptionistApi.getHospital(); // Assuming this returns a list
        // If your API returns a single hospital, wrap it in [data] or fetchAll if available
        setHospitals(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="h-[calc(100vh-80px)] w-full flex flex-col">
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Global Hospital Network
          </h1>
          <p className="text-sm text-slate-500">
            Live view of all registered facilities and bed availability
          </p>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span> Available
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span> Full
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 bg-slate-100">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            Loading Map...
          </div>
        ) : (
          <HospitalMap
            hospitals={hospitals}
            zoom={12}
            // Set center to the first hospital or a default city center
            center={
              hospitals[0]
                ? [hospitals[0].latitude, hospitals[0].longitude]
                : [18.52, 73.85]
            }
          />
        )}
      </div>
    </div>
  );
};

export default MapPage;
