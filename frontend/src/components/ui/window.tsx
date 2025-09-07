
import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ClickAnimationProps {
  x: number;
  y: number;
  id: string;
  angle: number;
}

function ClickAnimation({ x, y, id, angle }: ClickAnimationProps) {
  return (
    <div
      key={id}
      className="fixed pointer-events-none z-50 select-none"
      style={{ left: x - 20, top: y - 10 } as React.CSSProperties}>
      {
        // set CSS var --angle so the keyframes can use it; cast to allow custom CSS var
      }
      {(() => {
        const innerStyle = {
          WebkitTextStroke: "0.5px var(--border)",
          ["--angle"]: `${angle}deg`,
        } as React.CSSProperties & { ["--angle"]?: string };

        return (
          <div
            className="animate-[float-up_0.8s_ease-out_forwards] text-secondary-background font-heading text-3xl text-shadow-lg"
            style={innerStyle}>
            Click!
          </div>
        );
      })()}
    </div>
  );
}

interface WindowProps extends React.ComponentProps<"div"> {
  title?: string;
  initialPosition?: { x: number; y: number };
  position?: { x: number; y: number };
  setPosition?: (position: { x: number; y: number }) => void;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

function Window({
  className,
  initialPosition,
  position: externalPosition,
  setPosition: externalSetPosition,
  children,
  title = "Window",
  onClose,
  onMinimize,
  onMaximize,
  style,
  ...props
}: WindowProps) {
  const [internalPosition, setInternalPosition] = useState({
    x: initialPosition?.x || 0,
    y: initialPosition?.y || 0,
  });
  
  // Use external position if provided, otherwise use internal position
  const position = externalPosition !== undefined ? externalPosition : internalPosition;
  const setPosition = externalSetPosition || setInternalPosition;
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [clickAnimations, setClickAnimations] = useState<ClickAnimationProps[]>([]);
  // track last creation time to throttle spammy clicks
  const lastClickCreatedAt = useRef<number>(0);

  const windowRef = useRef<HTMLDivElement>(null);

  // Helper function to clamp position within viewport bounds
  const clampPositionToViewport = useCallback((x: number, y: number) => {
    if (!windowRef.current) {
      return { x, y };
    }

    const rect = windowRef.current.getBoundingClientRect();
    const windowWidth = Number(style?.width) || rect.width;
    const windowHeight = Number(style?.height) || rect.height;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Ensure window stays within viewport bounds
    const clampedX = Math.max(0, Math.min(x, viewportWidth - windowWidth));
    const clampedY = Math.max(0, Math.min(y, viewportHeight - windowHeight));

    return { x: clampedX, y: clampedY };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).closest('[data-slot="window-header"]')
    ) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Clamp position to stay within viewport
        const clampedPosition = clampPositionToViewport(newX, newY);
        
        setPosition(clampedPosition);
      }
    },
    [isDragging, dragStart, setPosition, clampPositionToViewport]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Ensure window stays within viewport bounds when position changes externally
  useEffect(() => {
    const clampedPosition = clampPositionToViewport(position.x, position.y);
    if (clampedPosition.x !== position.x || clampedPosition.y !== position.y) {
      setPosition(clampedPosition);
    }
  }, [position.x, position.y, clampPositionToViewport, setPosition]);

  // Monitor window size changes and adjust position if needed
  // commented out for now, maybe wont be needed
  
  // useEffect(() => {
  //   if (!windowRef.current) {
  //     return;
  //   }

  //   const resizeObserver = new ResizeObserver(() => {
  //     const clampedPosition = clampPositionToViewport(position.x, position.y);
  //     if (clampedPosition.x !== position.x || clampedPosition.y !== position.y) {
  //       setPosition(clampedPosition);
  //     }
  //   });

  //   resizeObserver.observe(windowRef.current);
  //   return () => resizeObserver.disconnect();
  // }, [position.x, position.y, clampPositionToViewport, setPosition]);

  const createClickAnimation = (e: React.MouseEvent) => {
    const now = Date.now();
    const THROTTLE_MS = 400;

    // If last animation was created recently, skip this one
    if (now - lastClickCreatedAt.current < THROTTLE_MS) {
      return;
    }

    lastClickCreatedAt.current = now;

    // random rotation between -30 and 30 degrees
    const angle = Math.round((Math.random() * 60 - 30) * 100) / 100;

    const newAnimation: ClickAnimationProps = {
      x: e.clientX,
      y: e.clientY,
      id: now.toString(),
      angle,
    };

    setClickAnimations((prev) => [...prev, newAnimation]);

    // Remove animation after it completes
    setTimeout(() => {
      setClickAnimations((prev) => prev.filter((anim) => anim.id !== newAnimation.id));
    }, 800);
  };

  const handleIconClick = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    createClickAnimation(e);
    if (action) {
      setTimeout(() => action(), 150); // Small delay for visual feedback
    }
  };

  return (
    <>
      <div
        ref={windowRef}
        data-slot="window"
        className={cn(
          "fixed rounded-base border-2 border-border bg-background text-foreground font-base shadow-shadow min-w-[300px] min-h-[200px] flex flex-col",
          isDragging && "select-none",
          className
        )}
        style={{
          ...style,
          left: position.x,
          top: position.y,
          zIndex: 40, 
        }}
        onMouseDown={handleMouseDown}
        {...props}>
        {/* Header Bar */}
        <div
          data-slot="window-header"
          className={cn(
            "flex items-center justify-between px-4 py-2 bg-main text-main-foreground border-b-2 border-border rounded-t-[3px] select-none",
            "font-heading"
          )}>
          <div className="flex-1 truncate">{title}</div>

          {/* Header Icons */}
          <div className="flex gap-1 ml-2">
            {/* Minimize */}
            <button
              onClick={(e) => handleIconClick(e, onMinimize)}
              className="w-6 h-6 flex items-center justify-center rounded-sm border-2 border-black bg-white text-black transition-all duration-75 hover:bg-black hover:text-white active:translate-x-px active:translate-y-px"
              aria-label="Minimize">
              <span className="text-xs font-bold">–</span>
            </button>

            {/* Maximize */}
            <button
              onClick={(e) => handleIconClick(e, onMaximize)}
              className="w-6 h-6 flex items-center justify-center rounded-sm border-2 border-black bg-white text-black transition-all duration-75 hover:bg-black hover:text-white active:translate-x-px active:translate-y-px"
              aria-label="Maximize">
              <span className="text-xs font-bold">□</span>
            </button>

            {/* Close */}
            <button
              onClick={(e) => handleIconClick(e, onClose)}
              className="w-6 h-6 flex items-center justify-center rounded-sm border-2 border-black bg-white text-black transition-all duration-75 hover:bg-black hover:text-white active:translate-x-px active:translate-y-px"
              aria-label="Close">
              <span className="text-xs font-bold">✕</span>
            </button>
          </div>
        </div>

        {/* Window Body */}
        {children}
      </div>

      {/* Click Animations */}
      {clickAnimations.map((anim) => (
        <ClickAnimation key={anim.id} {...anim} />
      ))}
    </>
  );
}

function WindowHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="window-content-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-[data-slot=window-action]:grid-cols-[1fr_auto] mb-4",
        className
      )}
      {...props}
    />
  );
}

function WindowTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="window-title"
      className={cn("font-heading leading-none text-lg", className)}
      {...props}
    />
  );
}

function WindowDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="window-description" className={cn("text-sm font-base", className)} {...props} />
  );
}

function WindowAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="window-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function WindowContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="window-content" className={cn("", className)} {...props} />;
}

function WindowBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="window-body"
      className={cn("flex-1 p-6 overflow-auto", className)}
      {...props}
    />
  );
}

function WindowFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="window-footer"
      className={cn("flex items-center mt-4 pt-4 border-t-2 border-border", className)}
      {...props}
    />
  );
}

export {
  Window,
  WindowHeader,
  WindowTitle,
  WindowDescription,
  WindowContent,
  WindowBody,
  WindowAction,
  WindowFooter,
};
