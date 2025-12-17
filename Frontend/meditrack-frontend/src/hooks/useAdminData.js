import { useState, useCallback, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../api/adminApi";

export function useAdminData() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    hospitals: [],
    rooms: [],
    receptionists: [],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      // Don't set loading true on background refreshes if you want smoother UX
      // but for this example, we keep it simple
      const [hospitals, rooms, receptionists] = await Promise.all([
        adminApi.getHospitals(),
        adminApi.getRooms(),
        adminApi.getReceptionists(),
      ]);
      setData({ hospitals, rooms, receptionists });
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load data.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derived State (Memoized)
  const hospitalLookup = useMemo(() => {
    const lookup = new Map();
    data.hospitals.forEach((h) => lookup.set(h.id, h));
    return lookup;
  }, [data.hospitals]);

  return {
    isLoading,
    data,
    hospitalLookup,
    refreshData: fetchDashboardData,
  };
}
