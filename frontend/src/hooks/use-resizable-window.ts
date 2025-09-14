import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type Position = { x: number; y: number };

type UseResizableWindowOptions = {
  minimizedSize: { width: number; height: number };
  maximizedRatio: { width: number; height: number }; // fraction of viewport
  initialPosition?: Position;
  animationDuration?: number;
};

export function useResizableWindow({
  minimizedSize,
  maximizedRatio,
  initialPosition,
  animationDuration = 400,
}: UseResizableWindowOptions) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState<Position>(
    initialPosition ?? {
      x: window.innerWidth - minimizedSize.width,
      y: window.innerHeight - minimizedSize.height,
    }
  );

  const getSizes = () => ({
    minimized: minimizedSize,
    maximized: {
      width: window.innerWidth * maximizedRatio.width,
      height: window.innerHeight * maximizedRatio.height,
    },
  });

  const handleMaximize = useCallback(() => {
    if (isMaximized) {
      return;
    }

    setIsResizing(true);

    const { minimized, maximized } = getSizes();
    const widthDiff = maximized.width - minimized.width;
    const heightDiff = maximized.height - minimized.height;

    setPosition({
      x: position.x - widthDiff,
      y: position.y - heightDiff,
    });
    setIsMaximized(true);

    setTimeout(() => setIsResizing(false), animationDuration);
  }, [isMaximized, position, animationDuration]);

  const handleMinimize = useCallback(() => {
    if (!isMaximized) {
      return;
    }

    setIsResizing(true);

    const { minimized, maximized } = getSizes();
    const widthDiff = maximized.width - minimized.width;
    const heightDiff = maximized.height - minimized.height;

    setPosition({
      x: position.x + widthDiff,
      y: position.y + heightDiff,
    });
    setIsMaximized(false);

    setTimeout(() => setIsResizing(false), animationDuration);
  }, [isMaximized, position, animationDuration]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300); // close anim shorter
  }, []);

  const windowClass = cn(
    isResizing && `transition-[width,height,left,top] duration-${animationDuration} sharp-ease`,
    isClosing && "transition-transform duration-300 sharp-ease"
  );

  const style = {
    width: isMaximized ? getSizes().maximized.width : minimizedSize.width,
    height: isMaximized ? getSizes().maximized.height : minimizedSize.height,
    transform: isClosing ? "scale(0)" : "scale(1)",
    transformOrigin: "center",
  };

  return {
    position,
    setPosition,
    isVisible,
    isMaximized,
    isResizing,
    isClosing,
    style,
    windowClass,
    handleMaximize,
    handleMinimize,
    handleClose,
  };
}
