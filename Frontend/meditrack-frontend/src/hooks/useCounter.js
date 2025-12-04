import { useEffect, useState } from "react";

/**
 * Custom hook that animates a counter from 0 to a target value.
 * @param {number} target - The final value to count up to.
 * @param {number} duration - How long the animation should take in milliseconds (default: 1500).
 * @returns {number} - The current counter value.
 */
export function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrameId;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Use easing function for smooth animation
      const easeOutQuad = 1 - Math.pow(1 - progress, 2);
      const currentCount = Math.floor(target * easeOutQuad);

      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return count;
}
