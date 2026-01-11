import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Loader2,
  Stethoscope,
  User,
  Calendar,
  Phone,
  MapPin,
  FileText,
  Bed,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { receptionistApi } from "../../api/receptionistApi";

const genders = ["Male", "Female", "Other"];
const initialForm = {
  name: "",
  age: "",
  gender: genders[0],
  contactNumber: "",
  address: "",
  symptoms: "",
  roomId: "",
};

export default function AdmissionForm({ availableRooms, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  // Auto-select first available room
  useEffect(() => {
    if (!form.roomId && availableRooms.length > 0) {
      setForm((prev) => ({
        ...prev,
        roomId: availableRooms[0].roomId.toString(),
      }));
    }
  }, [availableRooms, form.roomId]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.roomId) {
      toast.error("Please select an available room.");
      return;
    }

    if (!form.name.trim() || !form.age || !form.contactNumber.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      contactNumber: form.contactNumber.trim(),
      address: form.address.trim() || null,
      symptoms: form.symptoms.trim() || null,
      entryDate: new Date().toISOString().split("T")[0],
    };

    setSubmitting(true);
    try {
      const patient = await receptionistApi.createPatient(payload);
      if (!patient?.patientId) throw new Error("Patient creation failed");

      await receptionistApi.assignPatientToRoom(
        patient.patientId,
        Number(form.roomId)
      );

      toast.success("Patient admitted successfully!");
      setForm(initialForm);
      if (onSuccess) onSuccess(Number(form.roomId));
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to admit patient.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 flex flex-col h-full">
      {/* --- Decorative Header --- */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 relative overflow-hidden">
        {/* Abstract shapes for visual interest */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-900/10 rounded-full -ml-10 -mb-10 blur-xl"></div>

        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-inner border border-white/10">
            <PlusCircle size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              Patient Admission
            </h3>
            <p className="text-teal-100 text-xs font-medium uppercase tracking-wider opacity-90">
              New Registration Entry
            </p>
          </div>
        </div>
      </div>

      {/* --- Form Content --- */}
      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar"
      >
        {/* Row 1: Name (2/3 width) & Age (1/3 width) */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors"
                size={18}
              />
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                placeholder="Ex. John Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
              Age <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                name="age"
                type="number"
                min="0"
                max="150"
                value={form.age}
                onChange={handleFormChange}
                required
                className="w-full pl-4 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-left"
                placeholder="00"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Gender & Contact */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="gender"
                value={form.gender}
                onChange={handleFormChange}
                required
                className="w-full pl-4 pr-8 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm appearance-none cursor-pointer"
              >
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={16}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Phone
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors"
                size={18}
              />
              <input
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleFormChange}
                required
                pattern="[0-9]{10,15}"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                placeholder="Mobile No."
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
            Address <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <MapPin
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors"
              size={18}
            />
            <input
              name="address"
              value={form.address}
              onChange={handleFormChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
              required
              placeholder="Residential address"
            />
          </div>
        </div>

        {/* Symptoms */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
            Clinical Notes / Symptoms <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <FileText
              className="absolute left-3 top-4 text-slate-400 group-focus-within:text-teal-500 transition-colors"
              size={18}
            />
            <textarea
              name="symptoms"
              value={form.symptoms}
              onChange={handleFormChange}
              rows={3}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm resize-none"
              required
              placeholder="Describe patient's condition..."
            />
          </div>
        </div>

        {/* Room Selection - Highlighted */}
        <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wide">
            <Bed size={16} />
            Bed Assignment <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="roomId"
              value={form.roomId}
              onChange={handleFormChange}
              required
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-teal-200 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all shadow-sm appearance-none cursor-pointer"
            >
              <option value="">-- Select Room --</option>
              {availableRooms.map((room) => (
                <option key={room.roomId} value={room.roomId}>
                  Room {room.roomNumber} — {room.availableBeds} beds available
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500 pointer-events-none"
              size={18}
            />
          </div>

          {availableRooms.length === 0 && (
            <div className="flex items-start gap-2 mt-2 text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p className="text-xs font-medium">
                Critical: No beds available in any room. Please check
                discharges.
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || availableRooms.length === 0}
          className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 p-px shadow-lg shadow-teal-500/30 transition-all hover:shadow-teal-500/50 disabled:opacity-50 disabled:shadow-none"
        >
          <div className="relative flex items-center justify-center gap-2 rounded-[11px] bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-3.5 transition-all group-hover:bg-opacity-90">
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Stethoscope className="w-5 h-5 text-white" />
            )}
            <span className="font-bold text-white tracking-wide">
              {submitting ? "Processing Admission..." : "Confirm Admission"}
            </span>
          </div>
        </button>
      </form>
    </div>
  );
}
