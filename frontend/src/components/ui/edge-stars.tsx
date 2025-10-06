import { useMemo, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Star9 from "./stars/Star9";
import { Flag, Globe, MapPin, Map } from "lucide-react";

interface EdgeStarsProps {
  className?: string;
  reverse?: boolean;
  paddingLeft?: number;   // Minimum distance from left edge in pixels
  paddingRight?: number;  // Minimum distance from right edge in pixels
}

// Available icon components with weights (higher weight = more frequent)
const ICONS = [
  { Component: Star9, usesFillProp: false, weight: 30 },  // 30/35 = ~86% stars
  { Component: Flag, usesFillProp: true, weight: 1 },     // 1/35 = ~3% each icon
  { Component: Globe, usesFillProp: true, weight: 1 },
  { Component: MapPin, usesFillProp: true, weight: 1 },
  { Component: Map, usesFillProp: true, weight: 1 },
];

// Helper function to select icon based on weights
function selectWeightedIcon() {
  const totalWeight = ICONS.reduce((sum, icon) => sum + icon.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const icon of ICONS) {
    random -= icon.weight;
    if (random <= 0) {
      return icon;
    }
  }
  
  return ICONS[0]; // Fallback to first icon
}

// Helper function to get base size based on viewport width
function getBaseSize(viewportWidth: number): number {
  const breakpoints = CONFIG.SIZE_BREAKPOINTS;
  
  // Find the largest breakpoint that the viewport width exceeds
  for (let i = breakpoints.length - 1; i >= 0; i--) {
    if (viewportWidth >= breakpoints[i].minWidth) {
      return breakpoints[i].baseSize;
    }
  }
  
  return CONFIG.BASE_SIZE; // Fallback
}

// Configurable constants
const CONFIG = {
  BASE_STAR_COUNT: 8,               // Base number of stars for narrow containers
  STARS_PER_100PX: 4,               // Additional stars per 100px of width
  BASE_SIZE: 50,                    // Base size for stars (default breakpoint)
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
  // Responsive base size based on viewport width
  SIZE_BREAKPOINTS: [
    { minWidth: 0, baseSize: 50 },      // Default (< 1920px)
    { minWidth: 1920, baseSize: 60 },   // 3xl breakpoint
    { minWidth: 2560, baseSize: 70 },   // 4xl breakpoint
    { minWidth: 3840, baseSize: 85 },   // 5xl breakpoint
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
  const [viewportWidth, setViewportWidth] = useState(0);

  // Measure container and viewport width
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
      setViewportWidth(window.innerWidth);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
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

    // Get responsive base size based on viewport width
    const responsiveBaseSize = getBaseSize(viewportWidth);

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
      
      // Calculate size with random offset using responsive base size
      const size = responsiveBaseSize + (Math.random() * CONFIG.SIZE_RANDOM_OFFSET * 2 - CONFIG.SIZE_RANDOM_OFFSET);
      
      // Calculate Y position with random offset
      const yOffset = Math.random() * CONFIG.Y_RANDOM_OFFSET * 2 - CONFIG.Y_RANDOM_OFFSET;
      const y = currentY + yOffset;
      
      // Randomly select icon and color using weighted selection
      const icon = selectWeightedIcon();
      const color = CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];
      
      // Random rotation between -45 and 45 degrees
      const rotation = Math.random() * 90 - 45;
      
      // Calculate actual size accounting for icon type
      const clampedSize = Math.max(30, Math.min(60, size));
      const actualSize = icon.usesFillProp ? clampedSize * 2/3 : clampedSize;
      
      // Add safety margin to account for rotation (diagonal is longer than side)
      const safetyMargin = actualSize * 0.5; // 50% extra space for rotation
      
      // Calculate X position based on position (using percentage of container width)
      // Ensure icons stay within bounds even with rotation
      let x: number;
      if (position === 'left') {
        // Random offset as percentage of container width
        const xOffsetPercent = Math.random() * CONFIG.X_RANDOM_OFFSET_PERCENT;
        const xOffset = (containerWidth * xOffsetPercent) / 100;
        x = Math.max(safetyMargin, paddingLeft + xOffset);
      } else if (position === 'right') {
        // Random offset as percentage of container width
        const xOffsetPercent = Math.random() * CONFIG.X_RANDOM_OFFSET_PERCENT;
        const xOffset = (containerWidth * xOffsetPercent) / 100;
        x = Math.max(safetyMargin, paddingRight + xOffset);
      } else {
        // Middle position - center with some random offset (% of width)
        const xOffsetPercent = Math.random() * CONFIG.MIDDLE_X_OFFSET_PERCENT * 2 - CONFIG.MIDDLE_X_OFFSET_PERCENT;
        const xOffset = (containerWidth * xOffsetPercent) / 100;
        const proposedX = (containerWidth / 2) + xOffset;
        // Ensure middle icons don't overflow either edge
        x = Math.max(safetyMargin, Math.min(containerWidth - safetyMargin, proposedX));
      }

      generatedStars.push({
        size: clampedSize,
        y,
        x,
        position,
        color,
        icon,
        rotation,
      });

      // Increment Y for next star
      currentY += CONFIG.Y_MARGIN;
    }

    return generatedStars;
  }, [reverse, paddingLeft, paddingRight, showMiddleColumn, containerWidth, starCount, viewportWidth]); // Regenerate if any prop changes

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full pointer-events-none overflow-hidden",
        className
      )}
    >
      {stars.map((star, index) => {
        const IconComponent = star.icon.Component;
        const usesFillProp = star.icon.usesFillProp;
        
        return (
          <div
            key={index}
            className="absolute"
            style={{
              top: `${star.y}px`,
              ...(star.position === 'middle' 
                ? { left: `${star.x}px`, transform: `translateX(-50%) rotate(${star.rotation}deg)` }
                : { [star.position]: `${star.x}px`, transform: `rotate(${star.rotation}deg)` }
              ),
            }}
          >
            {usesFillProp ? (
              <IconComponent
                size={star.size * 2/3}
                fill={star.color}
                strokeWidth={1}
              />
            ) : (
              <IconComponent
                size={star.size}
                color={star.color}
                pathClassName="stroke-[4px] dark:stroke-[3px] stroke-black dark:stroke-black/70"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
