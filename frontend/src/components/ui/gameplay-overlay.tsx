import { useEffect, useState } from "react";
import { Menu, Map } from "lucide-react";
import { useEventBridge } from "@/context/game-state";
import { IconButton } from "./icon-button";
import { Timer } from "./timer";

export function GameplayOverlay() {
  const [disabled, setDisabled] = useState(false);
  const [mapForceHidden, setMapForceHidden] = useState(false);
  const eventBridge = useEventBridge();

  const handlePauseButton = () => {
    eventBridge.emit("gamePaused", {});
    setDisabled(true);
  }

  const hanldeUnpause = () => {
    setDisabled(false);
  }

  const handleOpenMapButton = () => {
    eventBridge.emit("openMapButtonClicked", {});
    setMapForceHidden(false);
  }

  const handleMapForceHidden = () => {
    setMapForceHidden(true);
  }

  useEffect(() => {
    // const pausedCleanup = eventBridge.addEventListener("gamePaused", handleClose);
    // const startedCleanup = eventBridge.addEventListener("gameStarted", handleClose);
    // const unloadedCleanup = eventBridge.addEventListener("resultSubmitted", handleClose);
    const unpausedCleanup = eventBridge.addEventListener("gameUnpaused", hanldeUnpause);
    const mapForceHiddenCleanup = eventBridge.addEventListener('closeMapButtonClicked', () => {
      handleMapForceHidden();      
    })

    return () => {
      // pausedCleanup();
      // startedCleanup();
      // unloadedCleanup();
      unpausedCleanup();
      mapForceHiddenCleanup();
    };
  }, []);

  return (
  <div className={`absolute inset-0 bg-transparent flex flex-col z-[500] pointer-events-none`}>
    <div className="flex items-start gap-2 p-4">
      <IconButton 
        disabled={disabled} 
        onClick={handlePauseButton} 
        icon={Menu} 
        className="pointer-events-auto"
      />
      
      <Timer className="pointer-events-auto" />
    </div>

    <IconButton 
      disabled={disabled}
      style={{visibility: mapForceHidden ? "visible" : "hidden", left: 100}} 
      onClick={handleOpenMapButton} 
      icon={Map} 
      className="pointer-events-auto"
    />

  </div>
  ) 
}
