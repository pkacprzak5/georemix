import { useEffect, useState } from "react";
import { Menu, Map, MapPin } from "lucide-react";
import { useEventBridge, useGameStateManager } from "@/context";
import { IconButton } from "../ui/icon-button";
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

  const handleResetButton = () => {
    eventBridge.emit("resetToStartingNode", {});
  };

  const handleUnpause = () => {
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
    const unpausedCleanup = eventBridge.addEventListener("gameUnpaused", handleUnpause);
    const mapForceHiddenCleanup = eventBridge.addEventListener("closeMapButtonClicked", () => {
      handleMapForceHidden();
    });

    return () => {
      unpausedCleanup();
      mapForceHiddenCleanup();
    };
  }, []);

  return (
    <div className={`absolute inset-0 bg-transparent flex flex-col z-[500] pointer-events-none`}>
      <div className="flex items-start gap-2 3xl:gap-3 4xl:gap-4 short-screen:gap-2 p-4 3xl:p-5 4xl:p-6 short-screen:p-4">
        <div className="flex flex-col gap-2 3xl:gap-3 4xl:gap-4 short-screen:gap-2">
          <IconButton
            disabled={disabled}
            onClick={handlePauseButton}
            icon={Menu}
            iconSize={16}
            className="pointer-events-auto h-10 w-10 3xl:h-12 3xl:w-12 4xl:h-14 4xl:w-14 short-screen:h-10 short-screen:w-10 [&_svg]:!w-4 [&_svg]:!h-4 3xl:[&_svg]:!w-5 3xl:[&_svg]:!h-5 4xl:[&_svg]:!w-6 4xl:[&_svg]:!h-6 short-screen:[&_svg]:!w-4 short-screen:[&_svg]:!h-4"
          />
        </div>

        <div className="pointer-events-auto">
          <Timer onTimeUpdate={handleTimeChange} />
        </div>
      </div>

      {/* reset and map buttons */}
      <div className="absolute left-0 bottom-0 p-4 3xl:p-5 4xl:p-6 short-screen:p-4">
        <div className="flex items-center gap-2 3xl:gap-3 4xl:gap-4 short-screen:gap-2">
          <IconButton
            disabled={disabled}
            onClick={handleResetButton}
            icon={MapPin}
            iconSize={16}
            className="pointer-events-auto h-10 w-10 3xl:h-12 3xl:w-12 4xl:h-14 4xl:w-14 short-screen:h-10 short-screen:w-10 [&_svg]:!w-4 [&_svg]:!h-4 3xl:[&_svg]:!w-5 3xl:[&_svg]:!h-5 4xl:[&_svg]:!w-6 4xl:[&_svg]:!h-6 short-screen:[&_svg]:!w-4 short-screen:[&_svg]:!h-4"
          />

          <IconButton
            disabled={disabled}
            style={{
              opacity: mapForceHidden ? "1" : "0",
              pointerEvents: mapForceHidden ? "auto" : "none",
            }}
            onClick={handleOpenMapButton}
            icon={Map}
            iconSize={16}
            className="pointer-events-auto h-10 w-10 3xl:h-12 3xl:w-12 4xl:h-14 4xl:w-14 short-screen:h-10 short-screen:w-10 [&_svg]:!w-4 [&_svg]:!h-4 3xl:[&_svg]:!w-5 3xl:[&_svg]:!h-5 4xl:[&_svg]:!w-6 4xl:[&_svg]:!h-6 short-screen:[&_svg]:!w-4 short-screen:[&_svg]:!h-4"
          />
        </div>
      </div>
    </div>
  );
}
