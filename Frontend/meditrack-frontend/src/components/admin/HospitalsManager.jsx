import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Pencil,
  Trash2,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Maximize2,
  X,
  Check,
  Plus,
  Hospital,
  BedDouble,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi"; // Ensure path is correct
import { motion, AnimatePresence } from "framer-motion";
import LocationPicker from "../../components/map/LocationPicker"; // Ensure path is correct

// Initial Form State
const initialForm = {
  name: "",
  contactNumber: "",
  address: "",
  city: "",
  state: "",
  latitude: 21.1458,
  longitude: 79.0882,
};

// Animation Variants
const listVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.4 },
  }),
};

export default function HospitalsManager({ hospitals = [], onRefresh }) {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Filter Logic
  const filteredHospitals = useMemo(() => {
    if (!search.trim()) return hospitals;
    return hospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.city.toLowerCase().includes(search.toLowerCase())
    );
  }, [hospitals, search]);

  // Form Handlers
  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Handle both button click and form submit
    setIsSubmitting(true);
    const payload = form;

    try {
      if (editingId) {
        await adminApi.updateHospital(editingId, payload);
        toast.success("Hospital updated successfully");
      } else {
        await adminApi.createHospital(payload);
        toast.success("Hospital created successfully");
      }
      resetForm();
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save hospital");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (hospital) => {
    setEditingId(hospital.id);
    setForm({
      name: hospital.name,
      contactNumber: hospital.contactNumber,
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
      latitude: hospital.latitude || 21.1458,
      longitude: hospital.longitude || 79.0882,
    });
    setSelectedHospital(hospital);
  };

  const handleDelete = async (hospital) => {
    if (!confirm(`Delete ${hospital.name}? This action cannot be undone.`))
      return;
    try {
      await adminApi.deleteHospital(hospital.id);
      toast.success("Hospital deleted");
      if (selectedHospital?.id === hospital.id) setSelectedHospital(null);
      onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to delete hospital.");
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  // Location Handler
  const handleLocationSelect = useCallback((lat, lng) => {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  }, []);

  return (
    <div className="w-full">
      {/* Header Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl shadow-lg shadow-teal-500/20">
            <Hospital className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Hospital Directory
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage network data with a unified, modern layout.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        {/* Left Column: Hospital List */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-4 border border-slate-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all text-slate-700 placeholder:text-slate-400"
                placeholder="Search by name or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List Container */}
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-6 border border-slate-100 min-h-[500px]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                All Hospitals{" "}
                <span className="text-slate-400 font-normal">
                  ({filteredHospitals.length})
                </span>
              </h2>
            </div>

            <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {filteredHospitals.map((h, index) => (
                  <motion.div
                    key={h.id}
                    onClick={() => setSelectedHospital(h)}
                    className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedHospital?.id === h.id
                        ? "bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-400 shadow-md scale-[1.01]"
                        : "bg-slate-50 border-2 border-slate-100 hover:border-teal-200 hover:shadow-md"
                    }`}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={listVariants}
                    layout
                  >
                    {/* Hover Gradient Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity ${
                        selectedHospital?.id === h.id ? "opacity-100" : ""
                      }`}
                    />

                    <div className="relative p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-lg mb-1 flex items-center gap-2">
                          {h.name}
                          {selectedHospital?.id === h.id && (
                            <span className="px-2 py-0.5 bg-teal-500 text-white text-[10px] uppercase font-bold tracking-wider rounded-full">
                              Active
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-teal-500" />
                          <span>
                            {h.city}, {h.state}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-lg border border-slate-200/60">
                            <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-xs font-semibold text-slate-600">
                              {h.totalBeds || 0} Beds
                            </span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-lg border border-slate-200/60">
                            <Users className="w-3.5 h-3.5 text-orange-600" />
                            <span className="text-xs font-semibold text-slate-600">
                              {h.occupiedBeds || 0} Used
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(h);
                          }}
                          className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all hover:scale-110 border border-blue-100"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(h);
                          }}
                          className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all hover:scale-110 border border-red-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredHospitals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Hospital className="w-12 h-12 mb-3 opacity-20" />
                  <p>No hospitals found matching "{search}"</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Form & Details */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 p-6 border border-blue-100/50">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div
                className={`p-2 rounded-xl ${
                  editingId ? "bg-orange-100" : "bg-teal-100"
                }`}
              >
                {editingId ? (
                  <Pencil className="w-5 h-5 text-orange-600" />
                ) : (
                  <Plus className="w-5 h-5 text-teal-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? "Edit Hospital" : "Add New Hospital"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Hospital Name
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-400 text-slate-700"
                  placeholder="Enter hospital name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Contact Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-400 text-slate-700"
                    placeholder="Enter contact number"
                    value={form.contactNumber}
                    onChange={(e) =>
                      setForm({ ...form, contactNumber: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Address
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-400 text-slate-700"
                  placeholder="Enter address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    City
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-400 text-slate-700"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    State
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-400 text-slate-700"
                    placeholder="State"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Map Trigger */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Location Coordinates
                </label>
                <button
                  type="button"
                  onClick={() => setIsMapOpen(true)}
                  className="w-full h-20 rounded-xl border-2 border-dashed border-teal-300 bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 transition-all flex items-center justify-between px-5 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-200 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                      <MapPin className="w-5 h-5 text-teal-800" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-teal-900">
                        Select on Map
                      </p>
                      <p className="text-xs text-teal-700 font-mono">
                        {form.latitude?.toFixed(4)},{" "}
                        {form.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <Maximize2 className="w-5 h-5 text-teal-500" />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 ${
                    editingId
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/25"
                      : "bg-gradient-to-r from-teal-500 to-cyan-500 shadow-teal-500/25"
                  } text-white py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : editingId ? (
                    <>
                      <Pencil className="w-4 h-4" /> Update
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Create
                    </>
                  )}
                </button>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="px-6 py-3.5 border-2 border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all text-slate-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Selected Hospital Detail Card */}
          <AnimatePresence mode="wait">
            {selectedHospital ? (
              <motion.div
                key={selectedHospital.id}
                className="bg-gradient-to-br from-white to-teal-50/30 border-2 border-teal-100 rounded-2xl shadow-lg p-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                {/* Decorative background circle */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-100 rounded-full blur-3xl opacity-50" />

                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-teal-700">
                    Selected Overview
                  </h3>
                </div>

                <div className="space-y-4 relative z-10">
                  <div>
                    <h4 className="font-black text-2xl text-slate-900 mb-2 leading-tight">
                      {selectedHospital.name}
                    </h4>
                    <div className="flex items-start gap-2 text-sm text-slate-600 mb-2">
                      <MapPin className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                      <span>
                        {selectedHospital.address}, {selectedHospital.city},{" "}
                        {selectedHospital.state}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      {selectedHospital.latitude?.toFixed(4)},{" "}
                      {selectedHospital.longitude?.toFixed(4)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-base text-slate-700 border-t pt-4 border-teal-100/50">
                    <Phone className="w-4 h-4 text-teal-600" />
                    <span className="font-semibold">
                      {selectedHospital.contactNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200 text-center hover:scale-105 transition-all shadow-sm">
                      <BedDouble className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-[10px] text-blue-700 uppercase font-bold mb-1">
                        Total Beds
                      </p>
                      <p className="text-2xl font-black text-blue-900">
                        {selectedHospital.totalBeds || 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-200 text-center hover:scale-105 transition-all shadow-sm">
                      <Users className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-[10px] text-orange-700 uppercase font-bold mb-1">
                        Occupied
                      </p>
                      <p className="text-2xl font-black text-orange-900">
                        {selectedHospital.occupiedBeds || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-sm font-medium">
                  Select a hospital to view details
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Map Modal */}
      <AnimatePresence>
        {isMapOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMapOpen(false)}
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col border-4 border-teal-200 overflow-hidden"
            >
              <div className="px-6 py-5 border-b flex justify-between items-center bg-gradient-to-r from-teal-50 to-cyan-50 z-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-teal-600" />
                    Pin Location
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Drag marker to set location
                  </p>
                </div>
                <button
                  onClick={() => setIsMapOpen(false)}
                  className="p-3 rounded-xl hover:bg-white transition-all border border-transparent hover:border-slate-200 text-slate-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Functional Map Component */}
              <div className="flex-1 relative bg-slate-100">
                <LocationPicker
                  key={editingId || "new-map"}
                  initialLat={form.latitude}
                  initialLng={form.longitude}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              <div className="px-6 py-5 border-t bg-gradient-to-r from-teal-50 to-cyan-50 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
                  <div className="text-sm font-mono font-bold text-slate-700 bg-white px-4 py-2 rounded-lg border-2 border-teal-200">
                    {form.latitude?.toFixed(5)}, {form.longitude?.toFixed(5)}
                  </div>
                </div>
                <button
                  onClick={() => setIsMapOpen(false)}
                  className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                >
                  <Check className="w-5 h-5" />
                  Confirm Location
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
