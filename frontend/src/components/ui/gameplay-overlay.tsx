import { useEffect, useState } from "react";
import { Menu, Map } from "lucide-react";
import { useEventBridge, useGameStateManager } from "@/context/game-state";
import { IconButton } from "./icon-button";
import { Timer } from "./timer";

export function GameplayOverlay() {
  const [disabled, setDisabled] = useState(false);
  const [mapForceHidden, setMapForceHidden] = useState(false);
  const eventBridge = useEventBridge();
  const gameStateManager = useGameStateManager();

  const handleTimeChange = (time: number) => {
    gameStateManager.setTimeTaken(time);
  };

  const handlePauseButton = () => {
    eventBridge.emit("gamePaused", {});
    setDisabled(true);
  };

  const hanldeUnpause = () => {
    setDisabled(false);
  };

  const handleOpenMapButton = () => {
    eventBridge.emit("openMapButtonClicked", {});
    setMapForceHidden(false);
  };

  const handleMapForceHidden = () => {
    setMapForceHidden(true);
  };

  useEffect(() => {
    // const pausedCleanup = eventBridge.addEventListener("gamePaused", handleClose);
    // const startedCleanup = eventBridge.addEventListener("gameStarted", handleClose);
    // const unloadedCleanup = eventBridge.addEventListener("resultSubmitted", handleClose);
    const unpausedCleanup = eventBridge.addEventListener("gameUnpaused", hanldeUnpause);
    const mapForceHiddenCleanup = eventBridge.addEventListener("closeMapButtonClicked", () => {
      handleMapForceHidden();
    });

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

        <Timer onTimeUpdate={handleTimeChange} className="pointer-events-auto" />
      </div>

      <div className="flex items-start gap-2 p-4 absolute right-0 bottom-0 transition-opacity ease-in-out duration-200">
        <IconButton
          disabled={disabled}
          style={{
            opacity: mapForceHidden ? "1" : "0",
            pointerEvents: mapForceHidden ? "auto" : "none",
          }}
          onClick={handleOpenMapButton}
          icon={Map}
          className="pointer-events-auto"
        />
      </div>
    </div>
  );
}
