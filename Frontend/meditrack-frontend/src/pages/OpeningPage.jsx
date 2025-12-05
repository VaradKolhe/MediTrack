import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, ShieldCheck, BedDouble } from "lucide-react";
import { useCounter } from "../hooks/useCounter";

const overviewStats = [
  {
    label: "Hospitals Connected",
    value: 120,
    format: (v) => `${v}+`,
    icon: ShieldCheck,
  },
  {
    label: "Beds Tracked",
    value: 18400,
    format: (v) => (v / 1000).toFixed(1) + "k",
    icon: Activity,
  },
  {
    label: "Regions Covered",
    value: 42,
    format: (v) => `${v}`,
    icon: BedDouble,
  },
];

const capabilityCards = [
  {
    title: "Real-time Bed Visibility",
    description:
      "Second-by-second visibility into which beds are available, occupied, or reserved.",
    points: [
      "One unified map across all facilities",
      "Filters by unit, bed type, and acuity",
      "Integrates with your HIS/EMR",
    ],
  },
  {
    title: "Faster, Safer Transfers",
    description:
      "Match patients to the right bed quickly — reduce delays and avoid unsafe moves.",
    points: [
      "Priority routing for critical transfers",
      "Audit trails and transfer checklists",
      "Live availability updates to receiving teams",
    ],
  },
  {
    title: "Capacity Intelligence",
    description:
      "Actionable trends and alerts so operations staff can anticipate demand.",
    points: [
      "Daily and hourly occupancy trends",
      "Custom alerts for threshold breaches",
      "Exportable reports for operations and quality",
    ],
  },
];

export default function OpeningPage() {
  const navigate = useNavigate();
  const bgUrl = "/images/meditrack-beds-hero.jpg"; // served from public/

  // Animated counters for stats
  const hospitalsCount = useCounter(120, 2000);
  const bedsCount = useCounter(18400, 2000);
  const regionsCount = useCounter(42, 2000);

  return (
    <main
      role="main"
      className="min-h-screen opening-page-container flex flex-col"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.50)), url('${bgUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="relative opening-page-content flex-1 flex flex-col justify-between">
        {/* Hero Section: Headline, Subheading, CTA - Centered */}
        <section className="flex-1 flex flex-col justify-center items-center text-center section-container hero sm:py-24">
          <div className="max-w-4xl mx-auto bg-white/30 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-lg p-8 md:p-12">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-blue-100 text-sm font-medium text-blue-800 border border-blue-300 backdrop-blur-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              Real-time care coordination
            </span>

            <h1 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 opening-heading max-w-4xl mx-auto">
              Instant Capacity.
              <br className="hidden sm:block" /> Confident Transfers.
              <br className="hidden sm:block" /> Real-Time Care.
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-gray-800 leading-relaxed opening-subheading max-w-3xl mx-auto">
              MediTrack centralizes live bed availability and capacity
              intelligence, empowering clinical teams to coordinate patient
              movements with confidence—to the right bed, at the right time.
            </p>

            <div className="mt-12 flex flex-wrap gap-4 justify-center">
              <button
                type="button"
                onClick={() => navigate("/home")}
                aria-label="Launch live dashboard"
                className="inline-flex items-center gap-3 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition transform hover:scale-105"
              >
                Launch Live Dashboard
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                aria-label="Sign in"
                className="inline-flex items-center gap-2 rounded-full bg-white backdrop-blur px-8 py-4 text-base font-semibold text-blue-600 shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition border border-blue-200"
              >
                Sign in
              </button>
            </div>
          </div>
        </section>

        {/* Statistics Section: Centered and Prominent */}
        <section className="section-container stats sm:py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/30 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-lg p-8 md:p-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                {overviewStats.map((stat, idx) => {
                  const Icon = stat.icon;
                  const countValue = [hospitalsCount, bedsCount, regionsCount][
                    idx
                  ];
                  return (
                    <div
                      key={stat.label}
                      className="opening-stat-card-large text-center group hover:scale-105 transition transform duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                    >
                      <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition">
                          <Icon className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                        {stat.format(countValue)}
                      </p>
                      <p className="mt-3 text-sm uppercase tracking-widest text-gray-600 font-medium">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-container features sm:py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/30 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-lg p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {capabilityCards.map((card) => (
                  <article
                    key={card.title}
                    className="opening-feature-card group hover:scale-105 transition transform duration-300 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm"
                  >
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                      {card.description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {card.points.map((p) => (
                        <li
                          key={p}
                          className="flex gap-3 items-start text-sm text-gray-600"
                        >
                          <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="section-container trust sm:py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/30 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-lg p-8 md:p-12">
              <div className="opening-feature-card max-w-2xl mx-auto text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Trusted by Operations Teams
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  A single source of truth for bed availability, transfers, and
                  capacity planning used by hospitals and health systems
                  worldwide.
                </p>
                <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <li className="space-y-2 bg-white/60 rounded-xl p-4 border border-purple-100">
                    <div className="text-3xl font-bold text-blue-600">✓</div>
                    <div className="font-semibold text-gray-900">Real-time</div>
                    <p className="text-sm text-gray-600">
                      Live updates across facilities
                    </p>
                  </li>
                  <li className="space-y-2 bg-white/60 rounded-xl p-4 border border-purple-100">
                    <div className="text-3xl font-bold text-blue-600">✓</div>
                    <div className="font-semibold text-gray-900">
                      Fast Transfers
                    </div>
                    <p className="text-sm text-gray-600">
                      Reduce time-to-placement
                    </p>
                  </li>
                  <li className="space-y-2 bg-white/60 rounded-xl p-4 border border-purple-100">
                    <div className="text-3xl font-bold text-blue-600">✓</div>
                    <div className="font-semibold text-gray-900">
                      Intelligence
                    </div>
                    <p className="text-sm text-gray-600">
                      Trends and alerts for planning
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
