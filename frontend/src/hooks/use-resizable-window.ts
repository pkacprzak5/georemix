import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type Position = { x: number; y: number };

type UseResizableWindowOptions = {
  minimizedSize: { width: number; height: number };
  maximizedRatio: { width: number; height: number }; // fraction of viewport
  initialPosition?: Position;
  animationDuration?: number;
  initialVisibility?: boolean;
  initialOpened?: boolean;
};

export function useResizableWindow({
  minimizedSize,
  maximizedRatio,
  initialPosition,
  animationDuration = 400,
  initialVisibility = true,
  initialOpened = false,
}: UseResizableWindowOptions) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isVisible, setIsVisible] = useState(initialVisibility);
  const [isOpened, setIsOpened] = useState(initialOpened);
  const [position, setPosition] = useState<Position>(
    initialPosition ?? {
      x: window.innerWidth * 0.98 - minimizedSize.width,
      y: window.innerHeight * 0.98 - minimizedSize.height,
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
    setIsOpening(false);
    setIsClosing(true);
    setIsOpened(false);
    // Don't change position - just scale to 0 from current position
    // The transformOrigin: 'center' will make it shrink from its center point

    // Unmount after animation completes (faster timing)
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  }, []);

  const handleOpen = useCallback(() => {
    setIsVisible(true);
    setIsClosing(false);
    
    // Small delay to ensure the element is rendered before starting animation
    setTimeout(() => {
      setIsOpening(true);
      setIsOpened(true);
    }, 10);

    setTimeout(() => {
      setIsOpening(false);
    }, 300);
  }, []);

  // const windowClass = cn(
  //   isResizing && `transition-[width,height,left,top,transform] duration-${animationDuration} sharp-ease`,
  //   (isClosing || isOpening) && "transition-transform duration-300 sharp-ease"
  // );

  const windowClass = `${isResizing ? "transition-[width,height,left,top,transform] duration-400 sharp-ease" : ""} ${isClosing || isOpening ? "transition-transform duration-300 sharp-ease" : ""}`;

  const style = {
    width: isMaximized ? getSizes().maximized.width : minimizedSize.width,
    height: isMaximized ? getSizes().maximized.height : minimizedSize.height,
    transform: isOpened ? "scale(1)" : "scale(0)",
    transformOrigin: "center",
  };

  return {
    position,
    setPosition,
    isVisible,
    isMaximized,
    isResizing,
    isClosing,
    isOpening,
    isOpened,
    style,
    windowClass,
    handleMaximize,
    handleMinimize,
    handleClose,
    handleOpen,
  };
}
