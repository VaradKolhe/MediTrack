import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, ShieldCheck, BedDouble } from "lucide-react";
import { useCounter } from "../hooks/useCounter";
import { motion } from "framer-motion"; // <-- Framer Motion is essential here

// --- FRAMER MOTION VARIANTS ---

// For sections that appear as you scroll down (3D Tilt-Up Effect)
const sectionContainerVariants = {
  hidden: { opacity: 0, y: 50, rotateX: 5 }, // Start slightly low and tilted
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 15,
      staggerChildren: 0.1, // Delay between child elements
      delayChildren: 0.3,    // Initial delay for the entire section
    },
  },
};

// For individual elements/cards within the sections (Bounce-in Effect)
const cardItemVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.8 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
    },
  },
};

// Data remains the same
const overviewStats = [
  {
    label: "Hospitals Connected",
    value: 120,
    format: (v) => `${Math.round(v)}+`,
    icon: ShieldCheck,
  },
  {
    label: "Beds Tracked",
    value: 18400,
    format: (v) => (Math.round(v) / 1000).toFixed(1) + "k",
    icon: Activity,
  },
  {
    label: "Regions Covered",
    value: 42,
    format: (v) => `${Math.round(v)}`,
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
        // KEEPING INLINE BACKGROUND STYLE AS REQUESTED
        backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.50)), url('${bgUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="relative opening-page-content flex-1 flex flex-col justify-between">
        {/* HERO SECTION: Immediate Entrance Animation */}
        <section className="flex-1 flex flex-col justify-center items-center text-center section-container hero sm:py-24">
          <motion.div
            className="max-w-4xl mx-auto bg-white/30 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-lg p-8 md:p-12"
            // More dramatic hero entrance: slide up, fade in, with a slight scale and shadow
            initial={{ y: 80, opacity: 0, scale: 0.95, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
            animate={{ y: 0, opacity: 1, scale: 1, boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Tagline */}
            <motion.span
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-blue-100 text-sm font-medium text-blue-800 border border-blue-300 backdrop-blur-sm"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 10 }}
            >
              {/* Enhanced pulse effect */}
              <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-ping absolute" />
              <span className="inline-block h-2 w-2 rounded-full bg-blue-600 relative" />
              Real-time care coordination
            </motion.span>

            {/* Headline */}
            <motion.h1
              className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 opening-heading max-w-4xl mx-auto"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              Instant Capacity.
              <br className="hidden sm:block" /> Confident Transfers.
              <br className="hidden sm:block" /> Real-Time Care.
            </motion.h1>

            {/* Subheading */}
            <motion.p
              className="mt-8 text-lg sm:text-xl text-gray-800 leading-relaxed opening-subheading max-w-3xl mx-auto"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              MediTrack centralizes live bed availability and capacity
              intelligence, empowering clinical teams to coordinate patient
              movements with confidence—to the right bed, at the right time.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="mt-12 flex flex-wrap gap-4 justify-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              {/* Launch Dashboard Button with 3D hover effect */}
              <motion.button
                type="button"
                onClick={() => navigate("/home")}
                aria-label="Launch live dashboard"
                className="inline-flex items-center gap-3 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition transform"
                whileHover={{ scale: 1.05, rotate: 1, y: -5, boxShadow: "0 15px 30px rgba(59, 130, 246, 0.6)" }}
                whileTap={{ scale: 0.95 }}
              >
                Launch Live Dashboard
                <ArrowRight size={18} />
              </motion.button>

              {/* Sign In Button with 3D hover effect */}
              <motion.button
                type="button"
                onClick={() => navigate("/login")}
                aria-label="Sign in"
                className="inline-flex items-center gap-2 rounded-full bg-white backdrop-blur px-8 py-4 text-base font-semibold text-blue-600 shadow transition border border-blue-200"
                whileHover={{ scale: 1.05, rotate: -1, y: -5, backgroundColor: "#F7FAFC", boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                Sign in
              </motion.button>
            </motion.div>
          </motion.div>
        </section>

        {/* STATISTICS SECTION: Scroll-based Tilt-Up Entrance */}
        <motion.section
          className="section-container stats sm:py-20 px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionContainerVariants} // Using the tilt variant
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="bg-white/30 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-lg p-8 md:p-12"
              variants={cardItemVariants}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                {overviewStats.map((stat, idx) => {
                  const Icon = stat.icon;
                  const countValue = [
                    Math.round(hospitalsCount), 
                    Math.round(bedsCount), 
                    Math.round(regionsCount)
                  ][idx];
                  
                  return (
                    <motion.div
                      key={stat.label}
                      className="opening-stat-card-large text-center group transition transform duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                      variants={cardItemVariants} 
                      // 3D hover effect for the card
                      whileHover={{ 
                        scale: 1.05, 
                        y: -8,
                        boxShadow: "0 15px 30px rgba(59, 130, 246, 0.3)",
                        rotateZ: idx % 2 === 0 ? 0.5 : -0.5, // Slight alternating rotation
                      }}
                    >
                      <div className="flex justify-center mb-4">
                        <motion.div 
                          className="p-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition"
                          whileHover={{ scale: 1.2, rotate: 15 }} // Icon spin on hover
                        >
                          <Icon className="h-8 w-8 text-blue-600" />
                        </motion.div>
                      </div>
                      <p className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                        {stat.format(countValue)}
                      </p>
                      <p className="mt-3 text-sm uppercase tracking-widest text-gray-600 font-medium">
                        {stat.label}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* FEATURES SECTION: Scroll-based Tilt-Up Entrance with staggered cards */}
        <motion.section
          className="section-container features sm:py-20 px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionContainerVariants} // Using the tilt variant
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="bg-white/30 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-lg p-8 md:p-12"
              variants={cardItemVariants}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {capabilityCards.map((card) => (
                  <motion.article
                    key={card.title}
                    className="opening-feature-card group transition transform duration-300 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm"
                    variants={cardItemVariants} 
                    whileHover={{ 
                        scale: 1.05, 
                        y: -5, 
                        boxShadow: "0 8px 15px rgba(0, 0, 0, 0.15)",
                    }} 
                  >
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                      {card.description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {card.points.map((p, pIdx) => (
                        <li
                          key={p}
                          className="flex gap-3 items-start text-sm text-gray-600"
                        >
                          {/* Animated bullets pop in */}
                          <motion.span
                            className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 500, delay: 0.1 + pIdx * 0.05 }}
                          />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* TRUST SECTION: Smooth, single entrance */}
        <motion.section
          className="section-container trust sm:py-20 px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionContainerVariants}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="bg-white/30 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-lg p-8 md:p-12"
              variants={cardItemVariants}
            >
              <motion.div
                className="opening-feature-card max-w-2xl mx-auto text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100"
                variants={cardItemVariants}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Trusted by Operations Teams
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  A single source of truth for bed availability, transfers, and
                  capacity planning used by hospitals and health systems
                  worldwide.
                </p>
                <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Trust Points: Each one has a slightly delayed bounce */}
                  {[
                    { title: 'Real-time', desc: 'Live updates across facilities' },
                    { title: 'Fast Transfers', desc: 'Reduce time-to-placement' },
                    { title: 'Intelligence', desc: 'Trends and alerts for planning' },
                  ].map((p, index) => (
                    <motion.li
                      key={p.title}
                      className="space-y-2 bg-white/60 rounded-xl p-4 border border-purple-100 list-none"
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ delay: index * 0.2, type: "spring", stiffness: 200, damping: 10 }}
                      whileHover={{ scale: 1.1, y: -5, boxShadow: "0 8px 15px rgba(167, 139, 250, 0.4)" }}
                    >
                      <div className="text-3xl font-bold text-blue-600">✓</div>
                      <div className="font-semibold text-gray-900">
                        {p.title}
                      </div>
                      <p className="text-sm text-gray-600">{p.desc}</p>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}