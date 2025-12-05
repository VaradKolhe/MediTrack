import { useState, useMemo } from "react";
import { Search, Pencil, Trash2, Loader2, Building2, MapPin, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";

// Aligned with Hospital.java Entity
const initialForm = {
  name: "",
  contactNumber: "", // Matches Entity 'contactNumber'
  address: "",
  city: "",
  state: "",
};

export default function HospitalsManager({ hospitals, onRefresh }) {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const filteredHospitals = useMemo(() => {
    if (!search.trim()) return hospitals;
    return hospitals.filter((h) =>
      h.name.toLowerCase().includes(search.toLowerCase())
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-500" />
            <h2 className="text-xl font-bold text-slate-900">Hospitals</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
            <input
              className="pl-9 pr-3 py-1.5 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2 h-[600px] overflow-y-auto pr-2">
          {filteredHospitals.map((h) => (
            <div
              key={h.id}
              onClick={() => setSelectedHospital(h)}
              className={`flex justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                selectedHospital?.id === h.id
                  ? "bg-slate-50 border-slate-400 shadow-sm"
                  : "hover:bg-slate-50 border-slate-100"
              }`}
            >
              <div>
                <div className="font-semibold text-slate-900">{h.name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {h.city}, {h.state}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(h);
                  }}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition"
                >
                  <Pencil className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(h);
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 hover:border-red-100 border border-transparent transition"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
          {filteredHospitals.length === 0 && (
            <p className="text-center text-slate-400 py-10">No hospitals found.</p>
          )}
        </div>
      </div>

      {/* Right Column: Form & Details */}
      <div className="space-y-6">
        {/* Form Section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">
            {editingId ? "Edit Hospital" : "Add New Hospital"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                className="w-full px-4 py-2 border rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Hospital Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <input
                className="w-full px-4 py-2 border rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Contact Number"
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <input
                className="w-full px-4 py-2 border rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                className="w-full px-4 py-2 border rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
              <input
                className="w-full px-4 py-2 border rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-70 flex justify-center items-center"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  editingId ? "Update Hospital" : "Create Hospital"
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Selected Hospital Details Card */}
        {selectedHospital ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Selected Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-lg text-slate-900">{selectedHospital.name}</h4>
                <p className="text-sm text-slate-500 mt-1">{selectedHospital.address}</p>
                <p className="text-sm text-slate-500">{selectedHospital.city}, {selectedHospital.state}</p>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="w-4 h-4" />
                <span>{selectedHospital.contactNumber}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                  <p className="text-xs text-slate-500 uppercase">Total Beds</p>
                  <p className="text-xl font-bold text-slate-900">{selectedHospital.totalBeds || 0}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                  <p className="text-xs text-slate-500 uppercase">Occupied</p>
                  <p className="text-xl font-bold text-slate-900">{selectedHospital.occupiedBeds || 0}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center">
            <p className="text-slate-400 text-sm">Select a hospital to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}