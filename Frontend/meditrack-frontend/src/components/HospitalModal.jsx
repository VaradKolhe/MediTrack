import React from "react";

const HospitalModal = ({ hospital, onClose }) => {
  if (!hospital) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 w-[500px] max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200 animate-fade-in text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900">{hospital.name}</h2>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Address:</p>
            <p className="text-gray-900">{hospital.address}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Contact:</p>
            <p className="text-gray-900">{hospital.contactNumber}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Total Beds:</p>
            <p className="text-gray-900">{hospital.totalBeds ?? "N/A"}</p>
          </div>
        </div>

        <button
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition font-semibold cursor-pointer shadow-md hover:shadow-lg"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default HospitalModal;
