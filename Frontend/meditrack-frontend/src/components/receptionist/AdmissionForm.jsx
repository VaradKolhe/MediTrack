import React, { useState, useEffect } from "react";
import { PlusCircle, Loader2, Stethoscope } from "lucide-react";
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
      setForm((prev) => ({ ...prev, roomId: availableRooms[0].roomId.toString() }));
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

      await receptionistApi.assignPatientToRoom(patient.patientId, Number(form.roomId));
      
      toast.success("Patient admitted successfully!");
      setForm(initialForm);
      if (onSuccess) onSuccess(Number(form.roomId));
      
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Unable to admit patient.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">New Admission</p>
          <h3 className="text-lg font-semibold text-slate-900">Register patient</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-slate-700 font-medium">
            Full Name *
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              placeholder="Patient name"
            />
          </label>
          <label className="text-sm text-slate-700 font-medium">
            Age *
            <input
              name="age"
              type="number"
              min="0"
              max="150"
              value={form.age}
              onChange={handleFormChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-slate-700 font-medium">
            Gender *
            <select
              name="gender"
              value={form.gender}
              onChange={handleFormChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
            >
              {genders.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700 font-medium">
            Contact Number *
            <input
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleFormChange}
              required
              pattern="[0-9]{10,15}"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              placeholder="10-15 digits"
            />
          </label>
        </div>

        <label className="text-sm text-slate-700 font-medium">
          Address
          <input
            name="address"
            value={form.address}
            onChange={handleFormChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            placeholder="Street, City"
          />
        </label>

        <label className="text-sm text-slate-700 font-medium">
          Symptoms / Notes
          <textarea
            name="symptoms"
            value={form.symptoms}
            onChange={handleFormChange}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            placeholder="Short clinical notes"
          />
        </label>

        <label className="text-sm text-slate-700 font-medium">
          Assign to Room
          <select
            name="roomId"
            value={form.roomId}
            onChange={handleFormChange}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
          >
            <option value="">Select an available room</option>
            {availableRooms.map((room) => (
              <option key={room.roomId} value={room.roomId}>
                {room.roomNumber} — {room.availableBeds} bed(s) free
              </option>
            ))}
          </select>
          {availableRooms.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              No free beds available.
            </p>
          )}
        </label>

        <button
          type="submit"
          disabled={submitting || availableRooms.length === 0}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            <><Stethoscope className="w-4 h-4" /> Admit Patient</>
          )}
        </button>
      </form>
    </div>
  );
}