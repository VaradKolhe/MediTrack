import { useState } from "react";
import { BedDouble, Pencil, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { motion } from "framer-motion";

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

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {/* Left Column: List of Rooms (Animated Entrance) */}
      <motion.div 
        className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">
              Inventory
            </p>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-indigo-600" />
              Rooms Inventory
            </h2>
          </div>
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
            {rooms.length} total rooms
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                <th className="px-4 py-3 font-semibold">Hospital</th>
                <th className="px-4 py-3 font-semibold">Room #</th>
                <th className="px-4 py-3 font-semibold">Beds</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody 
              className="divide-y divide-slate-100"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {rooms.map((room, index) => (
                <motion.tr 
                  key={room.roomId} 
                  className="group transition duration-150 ease-in-out hover:bg-indigo-50/20 odd:bg-white even:bg-slate-50"
                  variants={rowVariants}
                >
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {hospitalLookup.get(room.hospitalId)?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <span className="font-mono bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-xs font-semibold">
                        {room.roomNumber}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 font-medium">
                    {room.totalBeds}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(room)}
                        className="p-2 rounded-full border border-slate-200 hover:bg-indigo-100/50 transition duration-150"
                      >
                        <Pencil className="w-4 h-4 text-indigo-600" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(room)}
                        className="p-2 rounded-full border border-red-200 hover:bg-red-100/50 transition duration-150"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    No rooms added yet.
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </motion.div>

      {/* Right Column: Form (Animated Entrance) */}
      <motion.div 
        className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6 h-fit sticky top-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6 border-b pb-3 border-slate-100">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">
              {editingRoom ? "Update" : "Add New"}
            </p>
            <h3 className="text-xl font-bold">
              {editingRoom ? "Edit Room" : "New Room"}
            </h3>
          </div>
          <BedDouble className="w-6 h-6 text-indigo-400" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <select
            className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm appearance-none focus:outline-none focus:ring-2 ${primaryRing} transition`}
            value={form.hospitalId}
            onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
            required
          >
            <option value="">-- Select Hospital --</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <input
            className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 ${primaryRing} text-sm transition`}
            placeholder="Room Number (e.g. 101-A)"
            value={form.roomNumber}
            onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
            required
          />

          <input
            type="number"
            min="1"
            className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 ${primaryRing} text-sm transition`}
            placeholder="Total Beds"
            value={form.totalBeds}
            onChange={(e) => setForm({ ...form, totalBeds: e.target.value })}
            required
          />

          <div className="flex items-center gap-3 pt-3">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 ${primaryColor} text-white py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-md hover:shadow-lg`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                editingRoom ? "Update Room" : "Create Room"
              )}
            </motion.button>
            {editingRoom && (
              <motion.button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-100 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}