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
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { motion, AnimatePresence } from "framer-motion";
import LocationPicker from "../../components/map/LocationPicker";

// Aligned with Hospital.java Entity
const initialForm = {
  name: "",
  contactNumber: "",
  address: "",
  city: "",
  state: "",
  latitude: 21.1458,
  longitude: 79.0882,
};

const primaryColor = "bg-indigo-600 hover:bg-indigo-700";
const primaryRing = "focus:ring-indigo-300";

// --- ANIMATION VARIANTS ---
const listVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.4 },
  }),
};

const columnSpring = {
  type: "spring",
  stiffness: 100,
  damping: 15,
  delay: 0.1,
};

export default function HospitalsManager({ hospitals, onRefresh }) {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // NEW: State to control the Map Modal
  const [isMapOpen, setIsMapOpen] = useState(false);

  const filteredHospitals = useMemo(() => {
    if (!search.trim()) return hospitals;
    return hospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.city.toLowerCase().includes(search.toLowerCase())
    );
  }, [hospitals, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = form;

    try {
      if (editingId) {
        await adminApi.updateHospital(editingId, payload);
        toast.success("Hospital updated");
      } else {
        await adminApi.createHospital(payload);
        toast.success("Hospital created");
      }
      resetForm();
      onRefresh();
    } catch (err) {
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
    if (!confirm(`Delete ${hospital.name}?`)) return;
    try {
      await adminApi.deleteHospital(hospital.id);
      toast.success("Deleted");
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

  // --- OPTIMIZATION: Memoize Location Handler ---
  const handleLocationSelect = useCallback((lat, lng) => {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  }, []);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left Column: List */}
        <motion.div
          className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={columnSpring}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 mb-3 sm:mb-0">
              <Building2 className={`w-6 h-6 text-indigo-600`} />
              <h2 className="text-2xl font-bold text-slate-900">
                Hospital Directory
              </h2>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                className={`pl-10 pr-3 py-2 border rounded-xl text-sm bg-slate-50 w-full focus:outline-none focus:ring-2 ${primaryRing}`}
                placeholder="Search by name or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Hospital List */}
          <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {filteredHospitals.map((h, index) => (
                <motion.div
                  key={h.id}
                  onClick={() => setSelectedHospital(h)}
                  className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedHospital?.id === h.id
                      ? "bg-indigo-50 border-indigo-300 shadow-lg ring-4 ring-indigo-100"
                      : "hover:bg-slate-50 border-slate-100 hover:shadow-md"
                  }`}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9 }}
                  variants={listVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <div>
                    <div className="font-semibold text-slate-900">{h.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      {h.city}, {h.state}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(h);
                      }}
                      className="p-2 rounded-full hover:bg-indigo-100/50 transition duration-150 text-indigo-600 hover:scale-110"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(h);
                      }}
                      className="p-2 rounded-full hover:bg-red-100/50 transition duration-150 text-red-500 hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredHospitals.length === 0 && (
              <p className="text-center text-slate-400 py-10">
                No hospitals found matching "{search}".
              </p>
            )}
          </div>
        </motion.div>

        {/* Right Column: Form & Details */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={columnSpring}
        >
          {/* Form Section */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6">
            <h3 className="text-xl font-bold mb-5 text-slate-800 border-b pb-3 border-slate-100">
              {editingId ? "Edit Hospital" : "Add New Hospital"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: "name", placeholder: "Hospital Name" },
                { key: "contactNumber", placeholder: "Contact Number" },
                { key: "address", placeholder: "Address" },
              ].map((field) => (
                <input
                  key={field.key}
                  className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 ${primaryRing} transition`}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={(e) =>
                    setForm({ ...form, [field.key]: e.target.value })
                  }
                  required
                />
              ))}

              <div className="grid grid-cols-2 gap-3">
                <input
                  className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 ${primaryRing} transition`}
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
                <input
                  className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 ${primaryRing} transition`}
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  required
                />
              </div>

              {/* --- NEW MAP TRIGGER BUTTON --- */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Location Coordinates
                </label>
                <button
                  type="button"
                  onClick={() => setIsMapOpen(true)}
                  className="w-full h-16 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 transition-all flex items-center justify-center gap-3 group"
                >
                  <div className="bg-indigo-200 p-2 rounded-full group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 text-indigo-700" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-indigo-900">
                      Select on Map
                    </p>
                    <p className="text-xs text-indigo-600 font-mono">
                      {form.latitude?.toFixed(4)}, {form.longitude?.toFixed(4)}
                    </p>
                  </div>
                  <Maximize2 className="w-4 h-4 text-indigo-400 ml-auto mr-4" />
                </button>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 ${primaryColor} text-white py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingId ? (
                    "Update Hospital"
                  ) : (
                    "Create Hospital"
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-100 transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Selected Hospital Details Card */}
          <AnimatePresence mode="wait">
            {selectedHospital ? (
              <motion.div
                key={selectedHospital.id}
                className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4">
                  Selected Hospital Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-xl text-slate-900">
                      {selectedHospital.name}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {selectedHospital.address}, {selectedHospital.city},{" "}
                      {selectedHospital.state}
                    </p>
                    <div className="mt-2 text-xs text-slate-400 font-mono bg-slate-50 inline-block px-2 py-1 rounded">
                      {selectedHospital.latitude?.toFixed(4)},{" "}
                      {selectedHospital.longitude?.toFixed(4)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-base text-slate-600 border-t pt-4 border-slate-100">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    <span>{selectedHospital.contactNumber}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center transition hover:scale-105 hover:shadow-sm">
                      <p className="text-xs text-indigo-500 uppercase font-medium">
                        Total Beds
                      </p>
                      <p className="text-2xl font-extrabold text-indigo-900">
                        {selectedHospital.totalBeds || 0}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center transition hover:scale-105 hover:shadow-sm">
                      <p className="text-xs text-orange-500 uppercase font-medium">
                        Occupied
                      </p>
                      <p className="text-2xl font-extrabold text-orange-900">
                        {selectedHospital.occupiedBeds || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="bg-slate-50 border-2 border-slate-200 border-dashed rounded-3xl p-10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">
                  Select a hospital from the list to view or edit details.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* --- BIG MAP MODAL --- */}
      <AnimatePresence>
        {isMapOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMapOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Pin Location
                  </h3>
                  <p className="text-sm text-slate-500">
                    Switch layers (top-right) for Satellite View. Drag marker to
                    set location.
                  </p>
                </div>
                <button
                  onClick={() => setIsMapOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Map Body */}
              <div className="flex-1 relative bg-slate-100">
                {/* We key by 'editingId' or 'new-map' to force a reset when switching hospitals */}
                <LocationPicker
                  key={editingId || "new-map"}
                  initialLat={form.latitude}
                  initialLng={form.longitude}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between items-center z-10">
                <div className="text-sm font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                  {form.latitude?.toFixed(5)}, {form.longitude?.toFixed(5)}
                </div>
                <button
                  onClick={() => setIsMapOpen(false)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                >
                  <Check className="w-5 h-5" />
                  Confirm Location
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
