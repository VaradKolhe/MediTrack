import React from "react";

const HospitalModal = ({ hospital, onClose }) => {
  if (!hospital) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-2xl p-8 w-[500px] max-h-[80vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10 animate-fade-in text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">{hospital.name}</h2>

        <div className="space-y-3 text-slate-300">
          <p>
            <span className="font-semibold text-white">Address:</span>{" "}
            {hospital.address}
          </p>
          <p>
            <span className="font-semibold text-white">Contact:</span>{" "}
            {hospital.contactNumber}
          </p>
          <p>
            <span className="font-semibold text-white">Email:</span>{" "}
            {hospital.email ?? "N/A"}
          </p>
          <p>
            <span className="font-semibold text-white">Total Rooms:</span>{" "}
            {hospital.totalRooms ?? "N/A"}
          </p>
          <p>
            <span className="font-semibold text-white">Total Beds:</span>{" "}
            {hospital.totalBeds ?? "N/A"}
          </p>
          <p>
            <span className="font-semibold text-white">Created At:</span>{" "}
            {hospital.createdAt
              ? new Date(hospital.createdAt).toLocaleString()
              : "Unknown"}
          </p>
          <p>
            <span className="font-semibold text-white">Updated At:</span>{" "}
            {hospital.updatedAt
              ? new Date(hospital.updatedAt).toLocaleString()
              : "Unknown"}
          </p>
        </div>

        <button
          className="mt-6 bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90 text-slate-950 px-4 py-2 rounded-xl transition font-semibold cursor-pointer"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default HospitalModal;
