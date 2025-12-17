export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white z-1">
      <div className="max-w-6xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">BedTracker</p>
          <p className="text-sm text-slate-300 mt-3">
            Coordinating nationwide care with real-time bed intelligence and
            secure staff collaboration tools.
          </p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Contact
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>support@meditrack.com</li>
            <li>+91 98765 43210</li>
            <li>24x7 Network Command Center</li>
          </ul>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Quick Links
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>Hospitals & Facilities</li>
            <li>Security & Compliance</li>
            <li>Support Portal</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-xs text-white/60">
          © {new Date().getFullYear()} MediTrack. All rights reserved.
        </div>
      </div>
    </footer>
  );
}


