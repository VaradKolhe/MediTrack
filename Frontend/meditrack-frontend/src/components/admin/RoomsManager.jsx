import { useState } from "react";
import { BedDouble, Pencil, Trash2, Loader2, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";

const initialForm = {
  hospitalId: "",
  roomNumber: "",
  totalBeds: "",
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
    // 1. Debug: Check what the room object actually looks like
    console.log("Delete requested for room:", room);

    // 2. Guard Clause: Stop if ID is missing
    if (!room || !room.roomId) {
      toast.error("Error: Cannot delete. Room ID is missing.");
      console.error("Room object is missing 'id' property:", room);
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
      {/* Left Column: List of Rooms */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Manage
            </p>
            <h2 className="text-xl font-semibold text-slate-900">Rooms</h2>
          </div>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {rooms.length} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                <th className="px-3 py-2 rounded-l-lg">Hospital</th>
                <th className="px-3 py-2">Room #</th>
                <th className="px-3 py-2">Beds</th>
                <th className="px-3 py-2 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map((room) => (
                <tr key={room.roomId} className="hover:bg-slate-50/70 transition">  
                  <td className="px-3 py-4 font-semibold text-slate-700">
                    {hospitalLookup.get(room.hospitalId)?.name || "Unknown"}
                  </td>
                  <td className="px-3 py-4 text-slate-500">
                    {room.roomNumber}
                  </td>
                  <td className="px-3 py-4 text-slate-500">{room.totalBeds}</td>
                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(room)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                      >
                        <Pencil className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(room)}
                        className="p-2 rounded-lg border border-red-200 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    No rooms added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {editingRoom ? "Update" : "Add"}
            </p>
            <h3 className="text-lg font-semibold">
              {editingRoom ? "Edit Room" : "New Room"}
            </h3>
          </div>
          <BedDouble className="w-5 h-5 text-slate-400" />
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <select
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
            value={form.hospitalId}
            onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
            required
          >
            <option value="">Select Hospital</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <input
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
            placeholder="Room Number (e.g. 101-A)"
            value={form.roomNumber}
            onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
            required
          />

          <input
            type="number"
            min="1"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-sm"
            placeholder="Total Beds"
            value={form.totalBeds}
            onChange={(e) => setForm({ ...form, totalBeds: e.target.value })}
            required
          />

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-60 flex justify-center items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingRoom ? "Update Room" : "Create Room"}
            </button>
            {editingRoom && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
