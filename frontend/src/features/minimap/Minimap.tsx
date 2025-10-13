import { useEffect, useState } from "react";
import { Window, WindowContent } from "@/components/layout/window";
import MapViewer from "./MapViewer";
import "leaflet/dist/leaflet.css";
import { useEventBridge } from "@/context/game-state";
import { useResizableWindow } from "@/hooks/use-resizable-window";

// Window size breakpoints based on viewport width (similar to edge-stars)
const SIZE_BREAKPOINTS = [
  { minWidth: 0, width: 300, height: 200 },      // Default (< 1920px)
  { minWidth: 1800, width: 500, height: 333 },   // 3xl breakpoint
  { minWidth: 2200, width: 650, height: 433 },   // 4xl breakpoint
  // { minWidth: 3840, width: 650, height: 433 },   // 5xl breakpoint
];

// Helper function to get minimized window size based on viewport width
function getMinimizedSize(viewportWidth: number, viewportHeight: number): { width: number; height: number } {
  if(viewportHeight < 980){
    return { width: 400, height: 266 }; // Fallback
  }
  
  // Find the largest breakpoint that the viewport width exceeds
  for (let i = SIZE_BREAKPOINTS.length - 1; i >= 0; i--) {
    if (viewportWidth >= SIZE_BREAKPOINTS[i].minWidth) {
      return { width: SIZE_BREAKPOINTS[i].width, height: SIZE_BREAKPOINTS[i].height };
    }
  }
  
  return { width: SIZE_BREAKPOINTS[0].width, height: SIZE_BREAKPOINTS[0].height }; // Fallback
}

const WINDOW_WIDTH_MAXIMIZED_RATIO = 0.5; // 50% of viewport
const WINDOW_HEIGHT_MAXIMIZED_RATIO = 0.5; // 50% of viewport

export function Minimap() {
  const eventBridge = useEventBridge();
  const [forceHidden, setForceHidden] = useState(false);

  // Get responsive minimized size based on viewport width
  const minimizedSize = getMinimizedSize(window.innerWidth, window.innerHeight);

  const {
    position,
    setPosition,
    isVisible,
    style,
    windowClass,
    handleMaximize,
    handleMinimize,
    handleClose,
    handleOpen,
  } = useResizableWindow({
    minimizedSize: {
      width: minimizedSize.width,
      height: minimizedSize.height,
    },
    maximizedRatio: {
      width: WINDOW_WIDTH_MAXIMIZED_RATIO,
      height: WINDOW_HEIGHT_MAXIMIZED_RATIO,
    },
    initialVisibility: true,
    initialOpened: false,
  });

  // Function to reset minimap to default state (minimized and default position)
  const resetMinimapToDefault = () => {
    handleMinimize();
    // Get current minimized size for positioning
    const currentMinimizedSize = getMinimizedSize(window.innerWidth, window.innerHeight);
    // Reset to default position (bottom-right corner)
    setPosition({
      x: window.innerWidth * 0.98 - currentMinimizedSize.width,
      y: window.innerHeight * 0.98 - currentMinimizedSize.height,
    });
    // Minimize the window
  };

  const handleForceClose = () => {
    eventBridge.emit("closeMapButtonClicked", {});
    setForceHidden(true);
    handleClose();
  };

  const handleForceOpen = () => {
    setForceHidden(false);
    handleOpen();
  };

  const internalHandleOpen = () => {
    if (!forceHidden) {
      handleOpen();
    }
  };

  const handleLeaveGameplay = () => {
    handleClose();
  };

  const handleGameStarted = () => {
    resetMinimapToDefault();
    handleOpen();
  };

  useEffect(() => {
    const pausedCleanup = eventBridge.addEventListener("gamePaused", handleClose);
    const startedCleanup = eventBridge.addEventListener("gameStarted", handleGameStarted);
    const unloadedCleanup = eventBridge.addEventListener("resultSubmitted", handleLeaveGameplay);
    const unpausedCleanup = eventBridge.addEventListener("gameUnpaused", internalHandleOpen);
    const openMapButtonClickedCleanup = eventBridge.addEventListener(
      "openMapButtonClicked",
      handleForceOpen
    );
    const gameplayLeftCleanup = eventBridge.addEventListener("gameplayLeft", handleLeaveGameplay);

    return () => {
      unloadedCleanup();
      pausedCleanup();
      unpausedCleanup();
      startedCleanup();
      openMapButtonClickedCleanup();
      gameplayLeftCleanup();
    };
  }, [eventBridge, handleOpen, handleClose, internalHandleOpen, forceHidden]);

  return (
    isVisible && (
      <Window
        title="Minimap.exe"
        position={position}
        setPosition={setPosition}
        className={windowClass}
        style={style}
        onMaximize={handleMaximize}
        onMinimize={handleMinimize}
        disableMinimize
        isTitleResponsive
        iconMaximisedByDefault={false}
        onClose={handleForceClose}>
        <WindowContent className="w-full h-full relative">
          <MapViewer />
        </WindowContent>
      </Window>
    )
  );
}
