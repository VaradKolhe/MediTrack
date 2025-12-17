import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

const RandomPulseLine = ({
  duration = 2.5,
  color = "#2dd4bf",
  height = 100,
}) => {
  // --- CONFIGURATION ---
  const viewBoxWidth = 1200;
  const lineLength = 300; 
  const minGap = 250;
  const unitWidth = 30;

  const blurAmount = Math.max(3, 8 / duration);
  
  // State to trigger resets
  const [animationKey, setAnimationKey] = useState(0);

  const [idSuffix] = useState(() => Math.random().toString(36).substr(2, 9));
  const maskId = `comet-mask-${idSuffix}`;
  const gradientId = `comet-gradient-${idSuffix}`;
  const glowId = `comet-glow-${idSuffix}`;

  // --- PATH GENERATOR ---
  // Wrapped in useMemo so it recalculates IMMEDIATELY when animationKey changes.
  // No more useEffect lag.
  const pathData = useMemo(() => {
    const midY = height / 2;
    let d = `M0,${midY}`;
    let currentX = 0;

    d += ` L50,${midY}`;
    currentX += 50;

    while (currentX < viewBoxWidth) {
      const canFitUnit = currentX + unitWidth + minGap < viewBoxWidth;
      const shouldDrawUnit = Math.random() > 0.6 && canFitUnit;

      if (shouldDrawUnit) {
        const amplitude = 50 + Math.random() * 5; // Adjusted amplitude
        const step = unitWidth / 4;
        const invert = Math.random() > 0.5 ? 1 : -1;

        // Draw Up/Down Unit
        d += ` L${currentX + step},${midY - amplitude * invert}`;
        d += ` L${currentX + step * 2},${midY}`;
        d += ` L${currentX + step * 3},${midY + amplitude * invert}`;
        d += ` L${currentX + unitWidth},${midY}`;

        currentX += unitWidth;
        d += ` L${currentX + minGap},${midY}`;
        currentX += minGap;
      } else {
        const extraFlat = 50 + Math.random() * 100;
        d += ` L${currentX + extraFlat},${midY}`;
        currentX += extraFlat;
      }
    }
    d += ` L${viewBoxWidth + 50},${midY}`;
    return d;
  }, [animationKey, height, unitWidth]);

  return (
    <div className="absolute w-full overflow-visible" style={{ height }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxWidth} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="black" />
            <stop offset="20%" stopColor="black" />
            <stop offset="100%" stopColor="white" />
          </linearGradient>

          <mask id={maskId} maskUnits="userSpaceOnUse">
            {/* The mask RECT is the only thing that gets destroyed and recreated */}
            <motion.rect
              key={animationKey}
              y={0}
              width={lineLength}
              height={height}
              fill={`url(#${gradientId})`}
              
              // Force the starting position explicitly
              initial={{ x: -lineLength }}
              animate={{ x: viewBoxWidth + 50 }}
              
              transition={{
                duration: duration,
                ease: "linear",
                repeat: 0,
              }}
              onAnimationComplete={() => {
                setAnimationKey((prev) => prev + 1);
              }}
            />
          </mask>

          <filter id={glowId} x="-100%" y="-100%" width="400%" height="400%">
            <feGaussianBlur stdDeviation={blurAmount} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* The Path itself is stable, only the 'd' attribute changes */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          mask={`url(#${maskId})`}
          filter={`url(#${glowId})`}
        />
      </svg>
    </div>
  );
};

export default RandomPulseLine;