import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Activity,
  ArrowRight,
  ShieldCheck,
  BedDouble,
  Heart,
  Stethoscope,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import RandomPulseLine from "../components/RandomPulseLine";

// Simple counter hook
const useCounter = (end, duration) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
};

// --- FRAMER MOTION VARIANTS ---
const sectionContainerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 15,
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const cardItemVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.95 },
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
    icon: Stethoscope,
    gradient: "from-teal-500 to-cyan-500",
    lightGradient: "from-teal-50 to-cyan-50",
    accentColor: "teal",
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
    icon: Heart,
    gradient: "from-cyan-500 to-blue-500",
    lightGradient: "from-cyan-50 to-blue-50",
    accentColor: "cyan",
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
    icon: Clock,
    gradient: "from-blue-500 to-indigo-500",
    lightGradient: "from-blue-50 to-indigo-50",
    accentColor: "blue",
  },
];

export default function OpeningPage() {
  const navigate = useNavigate();

  const hospitalsCount = useCounter(120, 2000);
  const bedsCount = useCounter(18400, 2000);
  const regionsCount = useCounter(42, 2000);

  const FloatingParticles = () => {
    const particles = useMemo(() => {
      return Array.from({ length: 50 }).map((_, i) => {
        // Random positions
        const left =
          Math.abs((Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1) * 100;
        const top =
          Math.abs((Math.cos(i * 45.123 + 9.123) * 12345.6789) % 1) * 100;

        const size = Math.abs((Math.cos(i) * 10) % 3) < 1 ? 4 : 6;

        const duration = 25 + Math.abs(Math.sin(i * 3) * 20);
        const delay = Math.abs(Math.cos(i * 5) * 20);

        // FIX 2: Increased opacity slightly so you can actually see them for testing
        // Was 0.05 + ..., changed to 0.2 base for visibility
        const opacity = 0.2 + Math.abs(Math.sin(i * 10) * 0.3);

        const colors = ["bg-teal-400", "bg-cyan-400", "bg-blue-400"];
        const color = colors[i % 3];

        return { left, top, size, duration, delay, opacity, color };
      });
    }, []);

    return (
      // FIX 3: Ensure parent has 'relative' and a defined height in your usage
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 h-full w-full">
        <style>
          {`
          @keyframes gentleFall {
            0% { transform: translateY(0px) translateX(0px); opacity: 0; }
            20% { opacity: var(--target-opacity); }
            50% { transform: translateY(10vh) translateX(10px); } 
            80% { opacity: var(--target-opacity); }
            100% { transform: translateY(20vh) translateX(-10px); opacity: 0; }
          }
        `}
        </style>
        {particles.map((p, i) => (
          <div
            key={`particle-${i}`}
            className={`fixed rounded-full ${p.color} blur-[1px]`}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              // Set initial opacity to 0 so it follows animation
              opacity: 0,
              // CSS Variables allow the keyframe to read the specific opacity for this particle
              "--target-opacity": p.opacity,
              animation: `gentleFall ${p.duration}s linear infinite`,
              animationDelay: `-${p.delay}s`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <main
      role="main"
      className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30"
    >
      <FloatingParticles />

      <div className="relative flex-1 flex flex-col justify-between">
        {/* ============ HERO SECTION ============ */}
        <section className="relative flex-1 flex flex-col justify-center items-center text-center sm:py-24 px-4 overflow-hidden">
          {/* Hero Background Animation - Medical Pulse */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Pulse Lines Section in Hero */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-center">
              {/* Line 1: Fast, Teal */}
              <div className="absolute top-[15%] w-full opacity-60">
                <RandomPulseLine duration={5} color="#2dd4bf" />
              </div>

              {/* Line 2: Slower, Cyan, Delayed */}
              <div className="absolute top-[35%] w-full opacity-40">
                <RandomPulseLine duration={6} color="#06b6d4" />
              </div>

              {/* Line 3: Medium, Blue */}
              <div className="absolute top-[62%] w-full opacity-75">
                <RandomPulseLine duration={7} color="#00b3ffff" />
              </div>
            </div>

            {/* Gradient Orbs */}
            <motion.div
              className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-teal-300/40 to-cyan-400/40 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Gradient Orbs */}
            <motion.div
              className="absolute top-60 left-20 w-90 h-90 bg-gradient-to-br from-teal-300/40 to-cyan-400/40 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-300/40 to-indigo-400/40 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </div>

          <motion.div
            className="max-w-4xl mx-auto relative z-10"
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Tagline */}
            <motion.span
              className="inline-flex items-center gap-3 rounded-full px-5 py-2.5 bg-white shadow-lg shadow-teal-500/10 text-sm font-medium text-teal-700 border border-teal-200"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 10,
              }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-500" />
              </span>
              Real-time care coordination
            </motion.span>

            {/* Headline */}
            <motion.h1
              className="mt-10 text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <span className="text-slate-900">Instant Capacity.</span>
              <br />
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Confident Transfers.
              </span>
              <br />
              <span className="text-slate-900">Real-Time Care.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              className="mt-8 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto"
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
              <motion.button
                type="button"
                onClick={() => navigate("/home")}
                aria-label="Launch live dashboard"
                className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-teal-500/30 overflow-hidden"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-3">
                  Launch Live Dashboard
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => navigate("/login")}
                aria-label="Sign in"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-slate-700 border-2 border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-50 shadow-md"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign in
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="mt-16 flex flex-wrap items-center justify-center gap-6 text-slate-600 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                HIPAA Compliant
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-600" />
                99.9% Uptime
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-blue-600" />
                Trusted by 120+ Hospitals
              </span>
            </motion.div>
          </motion.div>
        </section>

        {/* ============ SECTION DIVIDER 1 ============ */}
        <div className="relative h-32 overflow-hidden pointer-events-none">
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            {/* 1. Define the Gradient */}
            <defs>
              {/* x1/y1 to x2/y2 defines a vertical gradient (top to bottom) */}
              <linearGradient
                id="wave-gradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                {/* Start (Top): Cyan color with some opacity (adjust 0.8 as needed) */}
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.7" />
                {/* End (Bottom): The same Cyan color but fully transparent (opacity 0) */}
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* 2. Apply the Gradient to the fill */}
            <motion.path
              d="M0,60 C300,90 600,30 900,60 L1200,60 L1200,120 L0,120 Z"
              fill="url(#wave-gradient)"
              animate={{
                d: [
                  "M0,60 C300,90 600,30 900,60 L1200,60 L1200,120 L0,120 Z",
                  "M0,50 C300,20 600,80 900,50 L1200,50 L1200,120 L0,120 Z",
                  "M0,60 C300,90 600,30 900,60 L1200,60 L1200,120 L0,120 Z",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* ============ STATISTICS SECTION ============ */}
        <motion.section
          className="relative sm:py-20 px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionContainerVariants}
        >
          {/* Stats Background Animation - Geometric Medical Tech */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              // 1. Large Soft Blur (Top Right) - Adds ambient color
              {
                type: "blob",
                className: "bg-teal-400/35 blur-[40px]",
                width: 275,
                height: 275,
                top: "10%",
                left: "80%",
                animate: { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] },
                duration: 15,
              },
              // 2. Large Soft Blur (Bottom Left)
              {
                type: "blob",
                className: "bg-blue-400/35 blur-[40px] z-10",
                width: 400,
                height: 400,
                top: "50%",
                left: "1%",
                animate: { scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] },
                duration: 18,
              },
              // 3. Hexagon (Top Left) - Represents Molecule/Structure
              {
                type: "hexagon",
                className:
                  "bg-gradient-to-br from-teal-100/35 to-cyan-100/40 backdrop-blur-sm border border-white/35",
                width: 120,
                height: 120,
                top: "10%",
                left: "5%",
                animate: { y: [0, 20, 0], rotate: [0, 10, 0] },
                duration: 8,
              },
              // 4. Hollow Ring (Middle Right) - Represents Focus/Target
              {
                type: "ring",
                className: "border-2 border-cyan-200/35",
                width: 80,
                height: 80,
                top: "40%",
                left: "90%",
                animate: { y: [0, -30, 0], scale: [1, 1.1, 1] },
                duration: 10,
              },
              // 5. Small Floating Cube (Bottom Center)
              {
                type: "square",
                className: "bg-blue-100/35 rotate-12 backdrop-blur-md",
                width: 60,
                height: 60,
                top: "85%",
                left: "45%",
                animate: { y: [0, -40, 0], rotate: [12, 45, 12] },
                duration: 12,
              },
              // 6. Tiny Particle (Near Title)
              {
                type: "circle",
                className: "bg-teal-400/40",
                width: 20,
                height: 20,
                top: "20%",
                left: "30%",
                animate: { y: [0, -15, 0], opacity: [0.3, 0.7, 0.3] },
                duration: 5,
              },
            ].map((shape, i) => (
              <motion.div
                key={`geo-shape-${i}`}
                className={`absolute ${shape.className} ${
                  shape.type === "circle" ||
                  shape.type === "ring" ||
                  shape.type === "blob"
                    ? "rounded-full"
                    : "rounded-3xl"
                }`}
                style={{
                  width: shape.width,
                  height: shape.height,
                  left: shape.left,
                  top: shape.top,
                  // CSS Clip Path for Hexagon
                  ...(shape.type === "hexagon" && {
                    clipPath:
                      "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                    borderRadius: 0,
                  }),
                }}
                animate={shape.animate}
                transition={{
                  duration: shape.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-xl p-8 md:p-12"
              variants={cardItemVariants}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                {overviewStats.map((stat, idx) => {
                  const Icon = stat.icon;
                  const countValue = [
                    Math.round(hospitalsCount),
                    Math.round(bedsCount),
                    Math.round(regionsCount),
                  ][idx];
                  const gradients = [
                    "from-teal-500 to-cyan-500",
                    "from-cyan-500 to-blue-500",
                    "from-blue-500 to-indigo-500",
                  ];
                  const bgColors = [
                    "from-teal-50 to-cyan-50",
                    "from-cyan-50 to-blue-50",
                    "from-blue-50 to-indigo-50",
                  ];

                  return (
                    <motion.div
                      key={stat.label}
                      className="relative text-center group"
                      variants={cardItemVariants}
                      whileHover={{ scale: 1.02, y: -5 }}
                    >
                      <div
                        className={`relative bg-gradient-to-br ${bgColors[idx]} rounded-2xl p-8 border border-slate-100 overflow-hidden`}
                      >
                        <div className="relative">
                          <div className="flex justify-center mb-6">
                            <motion.div
                              className={`p-4 rounded-2xl bg-gradient-to-br ${gradients[idx]} shadow-lg`}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              <Icon className="h-7 w-7 text-white" />
                            </motion.div>
                          </div>
                          <p
                            className={`text-5xl sm:text-6xl font-black bg-gradient-to-r ${gradients[idx]} bg-clip-text text-transparent tracking-tight`}
                          >
                            {stat.format(countValue)}
                          </p>
                          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-600 font-medium">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ============ SECTION DIVIDER 3 ============ */}
        <div className="relative h-24 overflow-hidden pointer-events-none">
          {Array.from({ length: 3 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
              style={{ top: `${30 + i * 20}%` }}
              animate={{
                x: [
                  i % 2 === 0 ? "-100%" : "100%",
                  i % 2 === 0 ? "100%" : "-100%",
                ],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* ============ FEATURES SECTION ============ */}
        <motion.section
          className="relative sm:py-20 px-6 overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionContainerVariants}
        >
          {/* Features Background - Grid Morph */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(20, 184, 166, 0.15) 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
              animate={{
                backgroundPosition: ["0px 0px", "40px 40px"],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              className="text-center mb-12"
              variants={cardItemVariants}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Powerful{" "}
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Features
                </span>
              </h2>
              <p className="text-slate-600 max-w-xl mx-auto">
                Everything you need to manage hospital capacity efficiently
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {capabilityCards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.article
                    key={card.title}
                    className={`group relative bg-gradient-to-br ${card.lightGradient} rounded-3xl p-8 border border-slate-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300`}
                    variants={cardItemVariants}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className="relative">
                      <motion.div
                        className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg mb-6`}
                        whileHover={{ scale: 1.1, rotate: -5 }}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </motion.div>

                      <h3 className="text-xl font-bold text-slate-900 mb-3">
                        {card.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed mb-6">
                        {card.description}
                      </p>
                      <ul className="space-y-3">
                        {card.points.map((p, pIdx) => (
                          <li
                            key={p}
                            className="flex gap-3 items-start text-sm text-slate-700"
                          >
                            <motion.span
                              className={`mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r ${card.gradient} flex-shrink-0`}
                              initial={{ scale: 0, opacity: 0 }}
                              whileInView={{ scale: 1, opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                delay: 0.1 + pIdx * 0.05,
                              }}
                            />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* ============ SECTION DIVIDER 3 ============ */}
        <div className="relative h-24 overflow-hidden pointer-events-none">
          {Array.from({ length: 3 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
              style={{ top: `${30 + i * 20}%` }}
              animate={{
                x: [
                  i % 2 === 0 ? "-100%" : "100%",
                  i % 2 === 0 ? "100%" : "-100%",
                ],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "linear",
              }}
            />
          ))}
        </div>

        <motion.section
          className="relative sm:py-20 px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionContainerVariants}
        >
          {/* Stats Background Animation - Geometric Medical Tech */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              // 1. Large Soft Blur (Top Right)
              {
                type: "blob",
                className: "bg-teal-400/35 blur-[40px]",
                width: 400,
                height: 400,
                top: "50%",
                left: "1%",
                animate: { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] },
                duration: 15,
              },
              // 2. Large Soft Blur (Bottom Left)
              {
                type: "blob",
                width: 275,
                height: 275,
                top: "10%",
                left: "80%",
                className: "bg-blue-400/35 blur-[40px] z-10",
                animate: { scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] },
                duration: 18,
              },
            ].map((shape, i) => (
              <motion.div
                key={`geo-shape-${i}`}
                className={`absolute ${shape.className} ${
                  shape.type === "circle" ||
                  shape.type === "ring" ||
                  shape.type === "blob"
                    ? "rounded-full"
                    : "rounded-3xl"
                }`}
                style={{
                  width: shape.width,
                  height: shape.height,
                  left: shape.left,
                  top: shape.top,
                  ...(shape.type === "hexagon" && {
                    clipPath:
                      "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                    borderRadius: 0,
                  }),
                }}
                animate={shape.animate}
                transition={{
                  duration: shape.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* ============ ABOUT SECTION ============ */}
          <div className="relative w-full py-24 text-slate-800">
            <div className="max-w-6xl mx-auto px-6">
              {/* Section Header */}
              <div className="text-center mb-20">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                  One Platform,{" "}
                  <span className="text-teal-600">Two Clear Experiences</span>
                </h2>
                <p className="text-slate-500 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
                  The system is designed to simplify hospital operations while
                  making it easier for users to find timely medical care.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
                {/* --- HOSPITAL FLOW CARD --- */}
                <motion.div
                  className="group bg-white rounded-3xl p-10 shadow-xl shadow-slate-200 border border-slate-200 hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-100/50 transition-all duration-50"
                  whileHover={{ y: -10 }}
                >
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                    {/* ICON CONTAINER: Note the group-hover classes here */}
                    <span className="p-3 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="18"
                          height="18"
                          x="3"
                          y="3"
                          rx="2"
                          ry="2"
                        />
                        <line x1="3" x2="21" y1="9" y2="9" />
                        <line x1="9" x2="9" y1="21" y2="9" />
                      </svg>
                    </span>
                    How It Helps Hospital Staff
                  </h3>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Hospitals get a centralized system to manage patients and
                    hospital information efficiently, reducing manual work and
                    confusion.
                  </p>

                  <ul className="space-y-6">
                    <li className="flex gap-4 items-start">
                      <div className="w-2 h-2 mt-2.5 bg-teal-500 rounded-full shrink-0 shadow-sm shadow-teal-200 group-hover:scale-125 transition-transform duration-300" />
                      <p className="text-slate-700 leading-relaxed">
                        Manage patient records, admissions, and updates from a
                        single dashboard instead of multiple systems or
                        paperwork.
                      </p>
                    </li>

                    <li className="flex gap-4 items-start">
                      <div className="w-2 h-2 mt-2.5 bg-teal-500 rounded-full shrink-0 shadow-sm shadow-teal-200 group-hover:scale-125 transition-transform duration-300" />
                      <p className="text-slate-700 leading-relaxed">
                        Keep hospital information organized and up to date,
                        making it easier to track ongoing patient flow.
                      </p>
                    </li>

                    <li className="flex gap-4 items-start">
                      <div className="w-2 h-2 mt-2.5 bg-teal-500 rounded-full shrink-0 shadow-sm shadow-teal-200 group-hover:scale-125 transition-transform duration-300" />
                      <p className="text-slate-700 leading-relaxed">
                        Improve coordination within the hospital by having all
                        essential data available in one place.
                      </p>
                    </li>
                  </ul>
                </motion.div>

                {/* --- USER FLOW CARD --- */}
                <motion.div
                  className="group bg-white rounded-3xl p-10 shadow-xl shadow-slate-200 border border-slate-200 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-50"
                  whileHover={{ y: -10 }}
                >
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                    {/* ICON CONTAINER: Note the group-hover classes here */}
                    <span className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" x2="20" y1="8" y2="14" />
                        <line x1="23" x2="17" y1="11" y2="11" />
                      </svg>
                    </span>
                    How It Helps Users
                  </h3>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Users get quick and clear access to hospital availability
                    and locations, helping them make faster and better
                    decisions.
                  </p>

                  <ul className="space-y-6">
                    <li className="flex gap-4 items-start">
                      <div className="w-2 h-2 mt-2.5 bg-blue-500 rounded-full shrink-0 shadow-sm shadow-blue-200 group-hover:scale-125 transition-transform duration-300" />
                      <p className="text-slate-700 leading-relaxed">
                        View real-time hospital availability before visiting,
                        reducing unnecessary travel and waiting time.
                      </p>
                    </li>

                    <li className="flex gap-4 items-start">
                      <div className="w-2 h-2 mt-2.5 bg-blue-500 rounded-full shrink-0 shadow-sm shadow-blue-200 group-hover:scale-125 transition-transform duration-300" />
                      <p className="text-slate-700 leading-relaxed">
                        Easily locate nearby hospitals on the map instead of
                        searching manually or relying on incomplete information.
                      </p>
                    </li>

                    <li className="flex gap-4 items-start">
                      <div className="w-2 h-2 mt-2.5 bg-blue-500 rounded-full shrink-0 shadow-sm shadow-blue-200 group-hover:scale-125 transition-transform duration-300" />
                      <p className="text-slate-700 leading-relaxed">
                        Get clear directions to the selected hospital, helping
                        users reach medical care faster during critical
                        situations.
                      </p>
                    </li>
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ============ SECTION DIVIDER 4 ============ */}
        <div className="relative h-24 overflow-hidden pointer-events-none">
          {Array.from({ length: 3 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
              style={{ top: `${30 + i * 20}%` }}
              animate={{
                x: [
                  i % 2 === 0 ? "-100%" : "100%",
                  i % 2 === 0 ? "100%" : "-100%",
                ],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* ============ TRUST SECTION ============ */}
        <motion.section
          className="relative sm:py-20 px-6 pb-20 overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionContainerVariants}
        >
          {/* Trust Background - Radial Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div
              className="relative bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-2xl p-10 md:p-14 text-center overflow-hidden"
              variants={cardItemVariants}
            >
              <div className="relative">
                <motion.div
                  className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg mb-8"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Heart className="h-8 w-8 text-white" />
                </motion.div>

                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Trusted by{" "}
                  <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Operations Teams
                  </span>
                </h2>
                <p className="text-slate-600 leading-relaxed max-w-xl mx-auto mb-10">
                  A single source of truth for bed availability, transfers, and
                  capacity planning used by hospitals and health systems
                  worldwide.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Real-time",
                      desc: "Live updates across facilities",
                      gradient: "from-teal-500 to-cyan-500",
                      bgGradient: "from-teal-50 to-cyan-50",
                    },
                    {
                      title: "Fast Transfers",
                      desc: "Reduce time-to-placement",
                      gradient: "from-cyan-500 to-blue-500",
                      bgGradient: "from-cyan-50 to-blue-50",
                    },
                    {
                      title: "Intelligence",
                      desc: "Trends and alerts for planning",
                      gradient: "from-blue-500 to-indigo-500",
                      bgGradient: "from-blue-50 to-indigo-50",
                    },
                  ].map((p, index) => (
                    <motion.div
                      key={p.title}
                      className={`relative bg-gradient-to-br ${p.bgGradient} rounded-2xl p-6 border border-slate-200 overflow-hidden group`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{
                        delay: index * 0.15,
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                      }}
                      whileHover={{ scale: 1.05, y: -3 }}
                    >
                      <div className="relative">
                        <div
                          className={`text-3xl font-bold bg-gradient-to-r ${p.gradient} bg-clip-text text-transparent mb-2`}
                        >
                          ✓
                        </div>
                        <div className="font-semibold text-slate-900 mb-1">
                          {p.title}
                        </div>
                        <p className="text-sm text-slate-600">{p.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
