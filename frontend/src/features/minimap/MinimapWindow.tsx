import { useEffect, useState } from "react";
import { Window, WindowContent } from "@/components/layout/window";
import MapViewer from "./MapViewer";
import "leaflet/dist/leaflet.css";
import { useEventBridge } from "@/context/game-state";

// Window size constants for calculations
const WINDOW_WIDTH_MINIMIZED = 300;
const WINDOW_HEIGHT_MINIMIZED = 200;
const WINDOW_WIDTH_MAXIMIZED_RATIO = 0.5; // 50% of viewport
const WINDOW_HEIGHT_MAXIMIZED_RATIO = 0.5; // 50% of viewport

export function MinimapWindow() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth * 0.98 - WINDOW_WIDTH_MINIMIZED,
    y: window.innerHeight * 0.98 - WINDOW_HEIGHT_MINIMIZED,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isOpened, setIsOpened] = useState(false);
  const eventBridge = useEventBridge();

  const handleMaximize = () => {
    if (isMaximized) {
      return; // Already maximized, do nothing
    }

    setIsResizing(true);
    // Calculate position to simulate expansion from top-left corner
    const currentWidth = WINDOW_WIDTH_MINIMIZED;
    const currentHeight = WINDOW_HEIGHT_MINIMIZED;
    const targetWidth = window.innerWidth * WINDOW_WIDTH_MAXIMIZED_RATIO;
    const targetHeight = window.innerHeight * WINDOW_HEIGHT_MAXIMIZED_RATIO;

    const widthDiff = targetWidth - currentWidth;
    const heightDiff = targetHeight - currentHeight;

    setPosition({
      x: position.x - widthDiff, // Move left to expand from left edge
      y: position.y - heightDiff, // Move up to expand from top edge
    });
    setIsMaximized(true);

    // Remove transition after animation completes (faster timing)
    setTimeout(() => setIsResizing(false), 400);
  };

  const handleMinimize = () => {
    if (!isMaximized) {
      return; // Already minimized, do nothing
    }

    setIsResizing(true);
    // Calculate position to simulate shrinking from bottom-right corner
    const currentWidth = window.innerWidth * WINDOW_WIDTH_MAXIMIZED_RATIO;
    const currentHeight = window.innerHeight * WINDOW_HEIGHT_MAXIMIZED_RATIO;
    const targetWidth = WINDOW_WIDTH_MINIMIZED;
    const targetHeight = WINDOW_HEIGHT_MINIMIZED;

    const widthDiff = currentWidth - targetWidth;
    const heightDiff = currentHeight - targetHeight;

    setPosition({
      x: position.x + widthDiff, // Move right to shrink from right edge
      y: position.y + heightDiff, // Move down to shrink from bottom edge
    });
    setIsMaximized(false);

    // Remove transition after animation completes (faster timing)
    setTimeout(() => setIsResizing(false), 400);
  };

  const handleClose = () => {
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
  };

  const handleOpen = () => {
    setIsClosing(false);
    setIsOpening(true);
    setIsOpened(true);

    setTimeout(() => {
      setIsOpening(false);
    }, 300);
  };

  useEffect(() => {
    const loadedSubscriptionCleanup = eventBridge.addEventListener("viewerLoaded", handleOpen);
    const pausedCleanup = eventBridge.addEventListener("gamePaused", handleOpen);
    const unloadedSubscriptionCleanup = eventBridge.addEventListener("resultSubmitted", handleClose);
    const unpausedCleanup = eventBridge.addEventListener("gameUnpaused", handleClose);

    return () => {
      loadedSubscriptionCleanup();
      unloadedSubscriptionCleanup();
      pausedCleanup();
      unpausedCleanup();
    };
  }, []);

  const windowClass = `${isResizing ? "transition-[width,height,left,top,transform] duration-400 sharp-ease" : ""} ${isClosing || isOpening ? "transition-transform duration-300 sharp-ease" : ""}`;

  const style = {
    width: isMaximized ? window.innerWidth * WINDOW_WIDTH_MAXIMIZED_RATIO : WINDOW_WIDTH_MINIMIZED,
    height: isMaximized
      ? window.innerHeight * WINDOW_HEIGHT_MAXIMIZED_RATIO
      : WINDOW_HEIGHT_MINIMIZED,
    transform: isOpened ? "scale(1)" : "scale(0)",
    transformOrigin: "center",
  };

  return (
    isVisible && (
      <Window
        title="map.exe"
        position={position}
        setPosition={setPosition}
        className={windowClass}
        style={style}
        onMaximize={handleMaximize}
        onMinimize={handleMinimize}
        onClose={handleClose}>
        <WindowContent className="w-full h-full relative">
          <div className="absolute top-2 left-2  bg-white p-2 rounded shadow z-[1000]"></div>
          <MapViewer />
        </WindowContent>
      </Window>
    )
  );
}
