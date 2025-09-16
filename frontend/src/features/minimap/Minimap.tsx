import { useEffect, useState } from "react";
import { Window, WindowContent } from "@/components/layout/window";
import MapViewer from "./MapViewer";
import "leaflet/dist/leaflet.css";
import { useEventBridge } from "@/context/game-state";
import { useResizableWindow } from "@/hooks/use-resizable-window";

// Window size constants for calculations
const WINDOW_WIDTH_MINIMIZED = 300;
const WINDOW_HEIGHT_MINIMIZED = 200;
const WINDOW_WIDTH_MAXIMIZED_RATIO = 0.5; // 50% of viewport
const WINDOW_HEIGHT_MAXIMIZED_RATIO = 0.5; // 50% of viewport

export function Minimap() {
  const eventBridge = useEventBridge();
  const [forceHidden, setForceHidden] = useState(false);

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
      width: WINDOW_WIDTH_MINIMIZED,
      height: WINDOW_HEIGHT_MINIMIZED,
    },
    maximizedRatio: {
      width: WINDOW_WIDTH_MAXIMIZED_RATIO,
      height: WINDOW_HEIGHT_MAXIMIZED_RATIO,
    },
    initialVisibility: true,
    initialOpened: false,
  });

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
    if(!forceHidden){
      handleOpen();
    }
  }

  useEffect(() => {
    const pausedCleanup = eventBridge.addEventListener("gamePaused", handleClose);
    const startedCleanup = eventBridge.addEventListener("gameStarted", internalHandleOpen);
    const unloadedCleanup = eventBridge.addEventListener("resultSubmitted", handleClose);
    const unpausedCleanup = eventBridge.addEventListener("gameUnpaused", internalHandleOpen);
    const openMapButtonClickedCleanup = eventBridge.addEventListener(
      "openMapButtonClicked",
      handleForceOpen
    );

    return () => {
      unloadedCleanup();
      pausedCleanup();
      unpausedCleanup();
      startedCleanup();
      openMapButtonClickedCleanup();
    };
  }, [eventBridge, handleOpen, handleClose, internalHandleOpen, forceHidden]);

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
        onClose={handleForceClose}>
        <WindowContent className="w-full h-full relative">
          <div className="absolute top-2 left-2  bg-white p-2 rounded shadow z-[1000]"></div>
          <MapViewer />
        </WindowContent>
      </Window>
    )
  );
}
