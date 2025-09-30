import { useMemo, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Star9 from "./stars/Star9";

interface EdgeStarsProps {
  className?: string;
  reverse?: boolean;
  paddingLeft?: number;   // Minimum distance from left edge in pixels
  paddingRight?: number;  // Minimum distance from right edge in pixels
}

// Configurable constants
const CONFIG = {
  BASE_STAR_COUNT: 8,               // Base number of stars for narrow containers
  STARS_PER_100PX: 4,               // Additional stars per 100px of width
  BASE_SIZE: 50,                    // Base size for stars
  SIZE_RANDOM_OFFSET: 15,           // Random size variation (+/-)
  Y_MARGIN: 100,                    // Base vertical spacing between stars
  Y_RANDOM_OFFSET: 30,              // Random vertical offset (+/-)
  X_RANDOM_OFFSET_PERCENT: 15,      // Random horizontal offset as % of container width
  DEFAULT_PADDING: 0,               // Default padding from edges (in pixels)
  MIN_WIDTH_FOR_MIDDLE: 150,        // Minimum width (px) to show middle column
  MIDDLE_X_OFFSET_PERCENT: 10,      // Random horizontal offset for middle stars (% of width)
  MAX_CONSECUTIVE_SAME_POSITION: 2, // Maximum times same position can appear in a row
  COLORS: [
    "var(--main)",
    "var(--secondary-background)",
  ],
};

/**
 * EdgeStars component displays decorative stars with random positioning.
 * Star positions (left/middle/right) are chosen randomly with a constraint
 * to prevent too many consecutive stars in the same position.
 * The number of stars scales proportionally with container width.
 * Horizontal offsets are calculated as percentages of the container width.
 * 
 * @param className - Additional CSS classes
 * @param reverse - Not used in random mode, kept for backwards compatibility
 * @param paddingLeft - Minimum distance from left edge in pixels (default: 0px)
 * @param paddingRight - Minimum distance from right edge in pixels (default: 0px)
 * 
 * @example
 * // Stars with custom left padding
 * <EdgeStars className="lg:block hidden" paddingLeft={40} />
 * 
 * // Stars with different padding for each side
 * <EdgeStars className="lg:block hidden" paddingLeft={30} paddingRight={50} />
 * 
 * // Wider container automatically gets more stars proportionally
 * <EdgeStars className="w-[20%] lg:block hidden" />
 */
export default function EdgeStars({ 
  className, 
  reverse, 
  paddingLeft = CONFIG.DEFAULT_PADDING,
  paddingRight = CONFIG.DEFAULT_PADDING 
}: EdgeStarsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const showMiddleColumn = containerWidth >= CONFIG.MIN_WIDTH_FOR_MIDDLE;

  // Calculate number of stars based on container width
  const starCount = useMemo(() => {
    if (containerWidth === 0) {
      return CONFIG.BASE_STAR_COUNT;
    }
    const additionalStars = Math.floor((containerWidth / 100) * CONFIG.STARS_PER_100PX);
    return Math.max(CONFIG.BASE_STAR_COUNT, CONFIG.BASE_STAR_COUNT + additionalStars);
  }, [containerWidth]);

  // Generate stars with consistent random values using useMemo
  const stars = useMemo(() => {
    const generatedStars = [];
    let currentY = 40; // Starting Y position
    let lastPosition: 'left' | 'right' | 'middle' | null = null;
    let consecutiveCount = 0;

    // Available positions based on whether middle column is shown
    const availablePositions: Array<'left' | 'right' | 'middle'> = showMiddleColumn 
      ? ['left', 'middle', 'right'] 
      : ['left', 'right'];

    for (let i = 0; i < starCount; i++) {
      // Randomly select position, avoiding too many consecutive same positions
      let position: 'left' | 'right' | 'middle';
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        position = availablePositions[randomIndex];
        attempts++;
        
        // If we've tried too many times, just pick any position that's different
        if (attempts >= maxAttempts && lastPosition) {
          const otherPositions = availablePositions.filter(p => p !== lastPosition);
          position = otherPositions[Math.floor(Math.random() * otherPositions.length)];
          break;
        }
      } while (
        lastPosition === position && 
        consecutiveCount >= CONFIG.MAX_CONSECUTIVE_SAME_POSITION - 1 &&
        attempts < maxAttempts
      );
      
      // Update consecutive count
      if (lastPosition === position) {
        consecutiveCount++;
      } else {
        consecutiveCount = 1;
        lastPosition = position;
      }
      
      // Calculate size with random offset
      const size = CONFIG.BASE_SIZE + (Math.random() * CONFIG.SIZE_RANDOM_OFFSET * 2 - CONFIG.SIZE_RANDOM_OFFSET);
      
      // Calculate Y position with random offset
      const yOffset = Math.random() * CONFIG.Y_RANDOM_OFFSET * 2 - CONFIG.Y_RANDOM_OFFSET;
      const y = currentY + yOffset;
      
      // Calculate X position based on position (using percentage of container width)
      let x: number;
      if (position === 'left') {
        // Random offset as percentage of container width
        const xOffsetPercent = Math.random() * CONFIG.X_RANDOM_OFFSET_PERCENT;
        const xOffset = (containerWidth * xOffsetPercent) / 100;
        x = paddingLeft + xOffset;
      } else if (position === 'right') {
        // Random offset as percentage of container width
        const xOffsetPercent = Math.random() * CONFIG.X_RANDOM_OFFSET_PERCENT;
        const xOffset = (containerWidth * xOffsetPercent) / 100;
        x = paddingRight + xOffset;
      } else {
        // Middle position - center with some random offset (% of width)
        const xOffsetPercent = Math.random() * CONFIG.MIDDLE_X_OFFSET_PERCENT * 2 - CONFIG.MIDDLE_X_OFFSET_PERCENT;
        const xOffset = (containerWidth * xOffsetPercent) / 100;
        x = (containerWidth / 2) + xOffset;
      }
      
      // Alternate colors
      const color = CONFIG.COLORS[i % CONFIG.COLORS.length];

      generatedStars.push({
        size: Math.max(30, Math.min(60, size)), // Clamp between 30-60
        y,
        x,
        position,
        color,
      });

      // Increment Y for next star
      currentY += CONFIG.Y_MARGIN;
    }

    return generatedStars;
  }, [reverse, paddingLeft, paddingRight, showMiddleColumn, containerWidth, starCount]); // Regenerate if any prop changes

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full pointer-events-none",
        className
      )}
    >
      {stars.map((star, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            top: `${star.y}px`,
            ...(star.position === 'middle' 
              ? { left: `${star.x}px`, transform: 'translateX(-50%)' }
              : { [star.position]: `${star.x}px` }
            ),
          }}
        >
          <Star9
            size={star.size}
            color={star.color}
            pathClassName="stroke-[4px] dark:stroke-[3px] stroke-black dark:stroke-black/70"
          />
        </div>
      ))}
    </div>
  );
}
