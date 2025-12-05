import { useState } from "react";
import { Users2, Pencil, Trash2, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { motion } from "framer-motion";

const initialForm = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  hospitalId: "",
  phoneNumber: "",
};

const primaryColor = "bg-indigo-600 hover:bg-indigo-700";
const primaryRing = "focus:ring-indigo-300";

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ReceptionistsManager({
  receptionists,
  hospitals,
  hospitalLookup,
  onRefresh,
}) {
  const [form, setForm] = useState(initialForm);
  const [editingRec, setEditingRec] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setForm(initialForm);
    setEditingRec(null);
  };

  const handleEdit = (rec) => {
    setEditingRec(rec);
    setForm({
      username: rec.username,
      email: rec.email,
      password: "", // Password usually reset or handled separately, but included in form
      firstName: rec.firstName,
      lastName: rec.lastName,
      hospitalId: rec.hospitalId,
      phoneNumber: rec.phoneNumber,
    });
  };

  const handleDelete = async (rec) => {
    if (!confirm(`Delete receptionist ${rec.firstName} ${rec.lastName}?`))
      return;
    try {
      await adminApi.deleteReceptionist(rec.id);
      toast.success("Receptionist deleted");
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...form,
      hospitalId: Number(form.hospitalId),
    };

    try {
      if (editingRec) {
        await adminApi.updateReceptionist(editingRec.id, payload);
        toast.success("Receptionist updated");
      } else {
        await adminApi.createReceptionist(payload);
        toast.success("Receptionist created");
      }
      resetForm();
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {/* Left Column: List (Animated Entrance) */}
      <motion.div 
        className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">
              Staff Management
            </p>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users2 className="w-5 h-5 text-indigo-600" />
              Receptionists
            </h2>
          </div>
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
            {receptionists.length} active
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Hospital</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody 
              className="divide-y divide-slate-100"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {receptionists.map((rec, index) => (
                <motion.tr 
                  key={rec.id} 
                  className="group transition duration-150 ease-in-out hover:bg-indigo-50/20 odd:bg-white even:bg-slate-50"
                  variants={rowVariants}
                >
                  <td className="px-4 py-4 font-semibold text-slate-800 capitalize">
                    {rec.firstName} {rec.lastName}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{rec.email}</td>
                  <td className="px-4 py-4 text-slate-600">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      {hospitalLookup.get(rec.hospitalId)?.name || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(rec)}
                        className="p-2 rounded-full border border-slate-200 hover:bg-indigo-100/50 transition duration-150"
                      >
                        <Pencil className="w-4 h-4 text-indigo-600" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(rec)}
                        className="p-2 rounded-full border border-red-200 hover:bg-red-100/50 transition duration-150"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {receptionists.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    No receptionists assigned.
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
              {editingRec ? "Update" : "Add New"}
            </p>
            <h3 className="text-xl font-bold">
              {editingRec ? "Edit Receptionist" : "New Receptionist"}
            </h3>
          </div>
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {['username', 'email', 'firstName', 'lastName', 'phoneNumber'].map((key) => (
            <input
              key={key}
              type={key === 'email' ? 'email' : 'text'}
              className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 ${primaryRing} transition`}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required
            />
          ))}

          <input
            type="password"
            className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 ${primaryRing} transition`}
            placeholder={editingRec ? "New Password (Leave blank to keep old)" : "Password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editingRec}
          />

          <select
            className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm appearance-none focus:outline-none focus:ring-2 ${primaryRing} transition`}
            value={form.hospitalId}
            onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
            required
          >
            <option value="">-- Assign Hospital --</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3 pt-3">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 ${primaryColor} text-white py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-md hover:shadow-lg`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingRec ? "Update Staff" : "Add Staff"}
            </motion.button>
            {editingRec && (
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