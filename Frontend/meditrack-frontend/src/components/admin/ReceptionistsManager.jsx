import { useState } from "react";
import {
  Users2,
  Pencil,
  Trash2,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
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

  // Search States
  const [searchEmail, setSearchEmail] = useState("");
  const [searchHospital, setSearchHospital] = useState("");

  const resetForm = () => {
    setForm(initialForm);
    setEditingRec(null);
  };

  const handleEdit = (rec) => {
    setEditingRec(rec);
    setForm({
      username: rec.username,
      email: rec.email,
      password: "",
      firstName: rec.firstName,
      lastName: rec.lastName,
      hospitalId: rec.hospitalId,
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

  // Filter Logic
  const filteredReceptionists = receptionists.filter((rec) => {
    const hospName =
      hospitalLookup.get(rec.hospitalId)?.name?.toLowerCase() || "";
    const emailMatch = rec.email
      .toLowerCase()
      .includes(searchEmail.toLowerCase());
    const hospitalMatch = hospName.includes(searchHospital.toLowerCase());
    return emailMatch && hospitalMatch;
  });

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
            {filteredReceptionists.length} visible
          </span>
        </div>

        {/* --- Search Bars --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Search by Email */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </div>
          {/* Search by Hospital */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by hospital..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              value={searchHospital}
              onChange={(e) => setSearchHospital(e.target.value)}
            />
          </div>
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
              {filteredReceptionists.map((rec, index) => (
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
              {filteredReceptionists.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    {receptionists.length === 0
                      ? "No receptionists assigned."
                      : "No matches found."}
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </motion.div>

      {/* ========== RECEPTIONIST FORM (Add/Edit) ========== */}
      <motion.div
        className="bg-white border-2 border-indigo-200 rounded-2xl shadow-lg shadow-indigo-100/50 p-6 h-fit sticky top-6 relative overflow-hidden"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-bl-full -mr-10 -mt-10" />

        <div className="relative mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                editingRec
                  ? "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border border-orange-300"
                  : "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border border-emerald-300"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  editingRec ? "bg-orange-500" : "bg-emerald-500"
                } animate-pulse`}
              />
              {editingRec ? "Update Mode" : "Creation Mode"}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-1">
            {editingRec ? "Edit Receptionist" : "New Receptionist"}
          </h3>
          <p className="text-xs text-slate-600">
            Manage receptionist account and hospital assignment
          </p>
        </div>

        <div className="space-y-4 relative">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-slate-700 font-medium"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-slate-700 font-medium"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                First Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-slate-700 font-medium"
                placeholder="First name"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Last Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-slate-700 font-medium"
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-slate-700 font-medium"
              placeholder={
                editingRec
                  ? "New password (leave blank to keep old)"
                  : "Enter password"
              }
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editingRec}
            />
          </div>

          {/* Hospital Assignment */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Assign Hospital
            </label>
            <select
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-slate-700 font-medium cursor-pointer"
              value={form.hospitalId}
              onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
              required
            >
              <option value="">Select hospital...</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 ${
                editingRec
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              } text-white py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : editingRec ? (
                <>
                  <Pencil className="w-4 h-4" />
                  Update Staff
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Staff
                </>
              )}
            </motion.button>
            {editingRec && (
              <motion.button
                type="button"
                onClick={resetForm}
                className="px-5 py-3.5 border-2 border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all text-slate-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
