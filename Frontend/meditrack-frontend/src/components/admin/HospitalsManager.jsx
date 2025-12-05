import { useState, useMemo } from "react";
import { Search, Pencil, Trash2, Loader2, Building2, MapPin, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { motion } from "framer-motion";

// Aligned with Hospital.java Entity
const initialForm = {
  name: "",
  contactNumber: "", // Matches Entity 'contactNumber'
  address: "",
  city: "",
  state: "",
};

const primaryColor = "bg-indigo-600 hover:bg-indigo-700";
const primaryRing = "focus:ring-indigo-300";

// --- ANIMATION VARIANTS ---

// Staggered list items
const listVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04, // Slightly faster stagger
      duration: 0.4,
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  }),
};

// Form input entrance animation
const formInputVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.3,
        }
    })
}

// Main column entrance variants
const columnSpring = {
    type: "spring",
    stiffness: 100,
    damping: 15,
    delay: 0.1
}


export default function HospitalsManager({ hospitals, onRefresh }) {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const filteredHospitals = useMemo(() => {
    if (!search.trim()) return hospitals;
    return hospitals.filter((h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase())
    );
  }, [hospitals, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare payload matching Hospital.java
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
    // Map backend data to form state
    setForm({
      name: hospital.name,
      contactNumber: hospital.contactNumber,
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
    });
    // Also select it for the details view
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

  return (
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
            <h2 className="text-2xl font-bold text-slate-900">Hospital Directory</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <motion.input
              className={`pl-10 pr-3 py-2 border rounded-xl text-sm bg-slate-50 w-full focus:outline-none focus:ring-2 ${primaryRing}`}
              placeholder="Search by name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            />
          </div>
        </div>

        {/* Hospital List */}
        <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredHospitals.map((h, index) => (
            <motion.div
              key={h.id}
              onClick={() => setSelectedHospital(h)}
              className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                selectedHospital?.id === h.id
                  ? "bg-indigo-50 border-indigo-300 shadow-lg ring-4 ring-indigo-100" // More pronounced selected state
                  : "hover:bg-slate-50 border-slate-100 hover:shadow-md"
              }`}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={listVariants}
              whileHover={{ 
                scale: 1.015, 
                x: 5, // Subtle shift right on hover
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" // Lift effect
              }}
            >
              <div>
                <div className="font-semibold text-slate-900">{h.name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  {h.city}, {h.state}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 5 }} // More aggressive hover
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(h);
                  }}
                  className="p-2 rounded-full hover:bg-indigo-100/50 transition duration-150"
                >
                  <Pencil className="w-4 h-4 text-indigo-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: -5 }} // More aggressive hover
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(h);
                  }}
                  className="p-2 rounded-full hover:bg-red-100/50 transition duration-150"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </motion.button>
              </div>
            </motion.div>
          ))}
          {filteredHospitals.length === 0 && (
            <p className="text-center text-slate-400 py-10">No hospitals found matching "{search}".</p>
          )}
        </div>
      </motion.div>

      {/* Right Column: Form & Details (Animated Entrance) */}
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
              { key: 'name', placeholder: 'Hospital Name' },
              { key: 'contactNumber', placeholder: 'Contact Number' },
              { key: 'address', placeholder: 'Address' },
            ].map((field, index) => (
              <motion.input
                key={field.key}
                className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 ${primaryRing} transition`}
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                required
                custom={index}
                initial="hidden"
                animate="visible"
                variants={formInputVariants}
              />
            ))}

            <div className="grid grid-cols-2 gap-3">
              <motion.input
                className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 ${primaryRing} transition`}
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
                custom={3}
                initial="hidden"
                animate="visible"
                variants={formInputVariants}
              />
              <motion.input
                className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 ${primaryRing} transition`}
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                required
                custom={4}
                initial="hidden"
                animate="visible"
                variants={formInputVariants}
              />
            </div>

            <div className="flex gap-3 pt-3">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 ${primaryColor} text-white py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-md hover:shadow-lg`}
                whileHover={{ scale: 1.03 }} // Increased hover scale
                whileTap={{ scale: 0.95 }} // Increased tap scale
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  editingId ? "Update Hospital" : "Create Hospital"
                )}
              </motion.button>
              {editingId && (
                <motion.button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-100 transition"
                  whileHover={{ scale: 1.03 }} // Increased hover scale
                  whileTap={{ scale: 0.95 }} // Increased tap scale
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </form>
        </div>

        {/* Selected Hospital Details Card */}
        {selectedHospital ? (
          <motion.div 
            key={selectedHospital.id}
            className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6"
            initial={{ opacity: 0, y: -20, scale: 0.95 }} // Entry from top with slight scale
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 150 }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4">
              Selected Hospital Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-xl text-slate-900">{selectedHospital.name}</h4>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {selectedHospital.address}, {selectedHospital.city}, {selectedHospital.state}
                </p>
              </div>

              <div className="flex items-center gap-3 text-base text-slate-600 border-t pt-4 border-slate-100">
                <Phone className="w-4 h-4 text-indigo-600" />
                <span>{selectedHospital.contactNumber}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {/* Stat Cards with subtle entry/hover effect */}
                <motion.div 
                  className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 5px 10px rgba(0,0,0,0.1)" }}
                >
                  <p className="text-xs text-indigo-500 uppercase font-medium">Total Beds</p>
                  <p className="text-2xl font-extrabold text-indigo-900">{selectedHospital.totalBeds || 0}</p>
                </motion.div>
                <motion.div 
                  className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 5px 10px rgba(0,0,0,0.1)" }}
                >
                  <p className="text-xs text-orange-500 uppercase font-medium">Occupied</p>
                  <p className="text-2xl font-extrabold text-orange-900">{selectedHospital.occupiedBeds || 0}</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="bg-slate-50 border-2 border-slate-200 border-dashed rounded-3xl p-10 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Select a hospital from the list to view or edit details.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}