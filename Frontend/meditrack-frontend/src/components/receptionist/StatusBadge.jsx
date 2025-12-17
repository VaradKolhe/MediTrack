import React from "react";

const statusStyles = {
  ADMITTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DISCHARGED: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border ${
        statusStyles[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          status === "ADMITTED" ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {status ?? "UNKNOWN"}
    </span>
  );
}