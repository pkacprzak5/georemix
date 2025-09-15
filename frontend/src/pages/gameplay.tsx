import { useEffect, useState } from "react";
import { OverlaySheet } from "@/components/layout/overlay-sheet";
import { Button } from "@/components/ui/button";
import PanoramaViewer from "@/features/game/PanoramaViewer";
import { LoadingScreen } from "@/pages/loading-screen";
import { PauseMenu } from "@/components/layout/pause-menu";
import { useEventBridge } from "@/context/game-state";

export function Gameplay() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingOverlayOpen, setLoadingOverlayOpen] = useState(true);
  const [resultOverlayOpen, setResultOverlayOpen] = useState(false);
  const eventBridge = useEventBridge();

  // const toggleMenu = () => setMenuOpen((old) => !old);


  // If there are problems with state management, use arrow function inside setMenuOpen
  const toggleMenu = () => {
    if (menuOpen) {
      eventBridge.emit("gameUnpaused", {});
      setMenuOpen(false);
    } else {
      eventBridge.emit("gamePaused", {});
      setMenuOpen(true);
    }
  };

  useEffect(() => {
    const loadedSubscriptionCleanup = eventBridge.addEventListener("viewerLoaded", () => {
      setLoadingOverlayOpen(false);
    });

    const resultSubscriptionCleanup = eventBridge.addEventListener("resultSubmitted", () => {
      setResultOverlayOpen(true);
    });

    return () => {
      loadedSubscriptionCleanup();
      resultSubscriptionCleanup();
    };
  }, [eventBridge]);

  return (
    <>
      <PanoramaViewer />

      {/* Loading overlay - open by default, no initial animation */}
      <OverlaySheet open={loadingOverlayOpen} skipInitialAnimation={true} zIndex={50}>
        <LoadingScreen />
      </OverlaySheet>

      {/* Menu overlay - toggleable by button */}
      <OverlaySheet open={menuOpen} zIndex={40}>
        <PauseMenu onUnpause={toggleMenu} />
      </OverlaySheet>

      {/* Result overlay - shown after resultSubmitted event */}
      <OverlaySheet open={resultOverlayOpen} zIndex={45}>
        <LoadingScreen />
      </OverlaySheet>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background z-50">
        <Button onClick={toggleMenu} className="w-[200px]">
          {menuOpen ? "Resume" : "Pause"}
        </Button>
      </div>
    </>
  );
}
