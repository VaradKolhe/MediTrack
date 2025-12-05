import { useState } from "react";
import { Users2, Pencil, Trash2, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";

const initialForm = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  hospitalId: "",
  phoneNumber: "",
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
      {/* Left Column: List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Manage
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Receptionists
            </h2>
          </div>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {receptionists.length} active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                <th className="px-3 py-2 rounded-l-lg">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Hospital</th>
                <th className="px-3 py-2 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receptionists.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-3 py-4 font-semibold text-slate-700 capitalize">
                    {rec.firstName} {rec.lastName}
                  </td>
                  <td className="px-3 py-4 text-slate-500">{rec.email}</td>
                  <td className="px-3 py-4 text-slate-500">
                    {hospitalLookup.get(rec.hospitalId)?.name || "Unknown"}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(rec)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                      >
                        <Pencil className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(rec)}
                        className="p-2 rounded-lg border border-red-200 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {receptionists.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    No receptionists assigned.
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
              {editingRec ? "Update" : "Add"}
            </p>
            <h3 className="text-lg font-semibold">
              {editingRec ? "Edit Receptionist" : "New Receptionist"}
            </h3>
          </div>
          <ShieldCheck className="w-5 h-5 text-slate-400" />
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            type="email"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>

          <input
            type="password"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editingRec} // Password only required on creation
          />

          <input
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            required
          />

          <select
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
            value={form.hospitalId}
            onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
            required
          >
            <option value="">Assign Hospital</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-60 flex justify-center items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingRec ? "Update Staff" : "Add Staff"}
            </button>
            {editingRec && (
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
