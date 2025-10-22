import { useEffect, useState } from "react";

/**
 * Custom hook for animating a counter from 0 to a target value
 * @param target - The target value to count up to
 * @param duration - The duration of the animation in milliseconds (default: 3000)
 * @returns The current animated count value
 */
export const useCountUp = (target: number, duration: number = 3000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      return;
    }

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(3, -10 * progress);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
};
