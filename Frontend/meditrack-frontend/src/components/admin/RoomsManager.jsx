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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/20 to-teal-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl shadow-lg">
              <BedDouble className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">
                Room Inventory
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Manage capacity and assignments across facilities
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
          {/* Left Column: Room List */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-lg shadow-cyan-100/50 p-4 border border-cyan-100/50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by hospital name..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  value={searchHospital}
                  onChange={(e) => setSearchHospital(e.target.value)}
                />
              </div>
            </div>

            {/* Rooms Table Card */}
            <div className="bg-white rounded-2xl shadow-lg shadow-cyan-100/50 border border-cyan-100/50 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-teal-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <BedDouble className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        All Rooms
                      </h2>
                      <p className="text-xs text-slate-600">
                        {filteredRooms.length} rooms available
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase text-xs tracking-wider">
                        Hospital Details
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase text-xs tracking-wider">
                        Room No.
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase text-xs tracking-wider w-48">
                        Bed Capacity
                      </th>
                      <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase text-xs tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence mode="popLayout">
                      {filteredRooms.map((room) => {
                        const hospital = hospitalLookup.get(room.hospitalId);
                        const occupancy =
                          room.totalBeds > 0
                            ? ((room.occupiedBeds || 0) / room.totalBeds) * 100
                            : 0;

                        return (
                          <motion.tr
                            key={room.roomId}
                            className="group hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-teal-50/50 transition-all duration-200"
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-start gap-3">
                                <div className="mt-1 p-2 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-xl">
                                  <Building2 className="w-4 h-4 text-cyan-700" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">
                                    {hospital?.name || "Unknown Hospital"}
                                  </p>
                                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3 text-teal-500" />
                                    {hospital?.city || "N/A"},{" "}
                                    {hospital?.state || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 text-slate-800 font-mono font-bold text-xs shadow-sm">
                                <Hash className="w-3 h-3 mr-1.5 text-slate-500" />
                                {room.roomNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-full">
                                <div className="flex justify-between text-xs mb-2 font-semibold">
                                  <span className="text-slate-700 flex items-center gap-1">
                                    <BedDouble className="w-3 h-3" />
                                    {room.totalBeds} Total
                                  </span>
                                  <span className="text-emerald-600 flex items-center gap-1">
                                    <Activity className="w-3 h-3" />
                                    {room.availableBeds} Free
                                  </span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      occupancy > 80
                                        ? "bg-gradient-to-r from-orange-500 to-red-500"
                                        : occupancy > 50
                                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                        : "bg-gradient-to-r from-cyan-500 to-teal-500"
                                    }`}
                                    style={{ width: `${occupancy}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1 text-right font-medium">
                                  {occupancy.toFixed(0)}% Occupied
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleEdit(room)}
                                  className="p-2.5 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all shadow-sm"
                                >
                                  <Pencil className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDelete(room)}
                                  className="p-2.5 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all shadow-sm"
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
                        <td colSpan={4} className="py-16 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <div className="p-5 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-4">
                              <Search className="w-10 h-10 opacity-50" />
                            </div>
                            <p className="font-bold text-slate-600 text-base">
                              No rooms found
                            </p>
                            <p className="text-xs mt-2">
                              {rooms.length === 0
                                ? "Start by adding your first room"
                                : "Try adjusting your search criteria"}
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
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white border-2 border-cyan-200 rounded-2xl shadow-lg shadow-cyan-100/50 p-6 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-200/40 to-teal-200/40 rounded-bl-full -mr-10 -mt-10" />

              <div className="relative mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                      editingRoom
                        ? "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border border-orange-300"
                        : "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border border-emerald-300"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        editingRoom ? "bg-orange-500" : "bg-emerald-500"
                      } animate-pulse`}
                    />
                    {editingRoom ? "Update Mode" : "Creation Mode"}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">
                  {editingRoom ? "Edit Room" : "Add New Room"}
                </h3>
                <p className="text-xs text-slate-600">
                  Configure room capacity and assignment details
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Hospital
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <select
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm appearance-none focus:outline-none focus:ring-2 ${primaryRing} focus:border-transparent transition-all cursor-pointer text-slate-700 font-medium`}
                      value={form.hospitalId}
                      onChange={(e) =>
                        setForm({ ...form, hospitalId: e.target.value })
                      }
                      required
                    >
                      <option value="">Select a hospital...</option>
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} - {h.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Room Number
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 ${primaryRing} focus:border-transparent transition-all placeholder:text-slate-400 font-medium`}
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
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Total Bed Capacity
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 ${primaryRing} focus:border-transparent transition-all placeholder:text-slate-400 font-medium`}
                      placeholder="Enter total beds"
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
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`flex-1 ${
                      editingRoom
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                        : "bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                    } text-white py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-70 flex justify-center items-center gap-2`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : editingRoom ? (
                      <>
                        <Pencil className="w-4 h-4" />
                        Update Room
                      </>
                    ) : (
                      <>
                        <BedDouble className="w-4 h-4" />
                        Create Room
                      </>
                    )}
                  </motion.button>

                  {editingRoom && (
                    <motion.button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-3.5 border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
