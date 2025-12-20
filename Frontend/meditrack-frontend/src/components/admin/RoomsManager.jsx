import { useState } from "react";
import {
  BedDouble,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Building2,
  Hash,
  Activity,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { motion, AnimatePresence } from "framer-motion";

const initialForm = {
  hospitalId: "",
  roomNumber: "",
  totalBeds: "",
};

const primaryColor = "bg-indigo-600 hover:bg-indigo-700";
const primaryRing = "focus:ring-indigo-300";

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export default function RoomsManager({
  rooms,
  hospitals,
  hospitalLookup,
  onRefresh,
}) {
  const [form, setForm] = useState(initialForm);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchHospital, setSearchHospital] = useState("");

  const resetForm = () => {
    setForm(initialForm);
    setEditingRoom(null);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setForm({
      hospitalId: room.hospitalId,
      roomNumber: room.roomNumber,
      totalBeds: room.totalBeds,
    });
  };

  const handleDelete = async (room) => {
    if (!room || !room.roomId) {
      toast.error("Error: Cannot delete. Room ID is missing.");
      return;
    }

    if (!confirm(`Delete Room ${room.roomNumber}?`)) return;

    try {
      await adminApi.deleteRoom(room.roomId);
      toast.success("Room deleted");
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete room.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...form,
      hospitalId: Number(form.hospitalId),
      totalBeds: Number(form.totalBeds),
    };

    try {
      if (editingRoom) {
        await adminApi.updateRoom(editingRoom.roomId, payload);
        toast.success("Room updated");
      } else {
        await adminApi.createRoom(payload);
        toast.success("Room created");
      }
      resetForm();
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save room.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Logic
  const filteredRooms = rooms.filter((room) => {
    const hospName =
      hospitalLookup.get(room.hospitalId)?.name?.toLowerCase() || "";
    return hospName.includes(searchHospital.toLowerCase());
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
      {/* Left Column: Room List */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Card */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <BedDouble className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Room Inventory
              </h2>
            </div>
            <p className="text-sm text-slate-500 pl-1">
              Manage capacity and assignments
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search hospitals..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
              value={searchHospital}
              onChange={(e) => setSearchHospital(e.target.value)}
            />
          </div>
        </div>

        {/* Rooms Table Card */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase text-xs tracking-wider">
                    Hospital Details
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase text-xs tracking-wider">
                    Room No.
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase text-xs tracking-wider w-48">
                    Bed Capacity
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-500 uppercase text-xs tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {filteredRooms.map((room) => {
                    const hospital = hospitalLookup.get(room.hospitalId);
                    // Calculate occupancy percentage for visual bar
                    const occupancy =
                      room.totalBeds > 0
                        ? ((room.occupiedBeds || 0) / room.totalBeds) * 100
                        : 0;

                    return (
                      <motion.tr
                        key={room.roomId}
                        className="group hover:bg-indigo-50/30 transition-colors"
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-indigo-100 rounded-md">
                              <Building2 className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {hospital?.name || "Unknown Hospital"}
                              </p>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {hospital?.city || "N/A"},{" "}
                                {hospital?.state || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-xs">
                            <Hash className="w-3 h-3 mr-1 text-slate-400" />
                            {room.roomNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-1.5 font-medium">
                              <span className="text-slate-700">
                                {room.totalBeds} Beds
                              </span>
                              <span className="text-emerald-600">
                                {room.availableBeds} Free
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${occupancy}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEdit(room)}
                              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"
                            >
                              <Pencil className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(room)}
                              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>

                {filteredRooms.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="p-4 bg-slate-50 rounded-full mb-3">
                          <Search className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="font-medium">No rooms found</p>
                        <p className="text-xs mt-1">
                          {rooms.length === 0
                            ? "Start by adding a room"
                            : "Try adjusting your search"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Right Column: Form Panel */}
      <motion.div
        className="h-fit sticky top-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 opacity-50" />

          <div className="relative mb-6">
            <span
              className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${
                editingRoom
                  ? "bg-orange-100 text-orange-600"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {editingRoom ? "Update Mode" : "Creation Mode"}
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              {editingRoom ? "Edit Room Details" : "Add New Room"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure room capacity and assignment
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Hospital
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm appearance-none focus:outline-none focus:ring-2 ${primaryRing} transition cursor-pointer text-slate-700`}
                  value={form.hospitalId}
                  onChange={(e) =>
                    setForm({ ...form, hospitalId: e.target.value })
                  }
                  required
                >
                  <option value="">Select a hospital...</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Room Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 ${primaryRing} transition placeholder:text-slate-400`}
                  placeholder="e.g. A-101"
                  value={form.roomNumber}
                  onChange={(e) =>
                    setForm({ ...form, roomNumber: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Capacity
              </label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 ${primaryRing} transition placeholder:text-slate-400`}
                  placeholder="Total Beds"
                  value={form.totalBeds}
                  onChange={(e) =>
                    setForm({ ...form, totalBeds: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 ${primaryColor} text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 flex justify-center items-center gap-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingRoom ? (
                  <>Update Room</>
                ) : (
                  <>Create Room</>
                )}
              </motion.button>

              {editingRoom && (
                <motion.button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3.5 border-2 border-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
