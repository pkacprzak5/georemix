import { useEffect, useState } from "react";
import { OverlaySheet } from "@/components/layout/overlay-sheet";
import { Button } from "@/components/ui/button";
import PanoramaViewer from "@/features/game/PanoramaViewer";
import { LoadingScreen } from "@/pages/loading-screen";
import { PauseMenu } from "@/components/layout/pause-menu";
import { useEventBridge } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import { useProgressiveLoading } from "@/hooks/use-progressive-loading";

export function Gameplay() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingOverlayOpen, setLoadingOverlayOpen] = useState(true);
  const [resultOverlayOpen, setResultOverlayOpen] = useState(false);
  const eventBridge = useEventBridge();
  const { navigateTo } = useNavigation();

  // Progressive loading hooks for start and end loading
  const startLoading = useProgressiveLoading({
    initialProgress: 33,
    baseDelayMs: 300,
    randomizationFactor: 0.2,
  });

  const endLoading = useProgressiveLoading({
    initialProgress: 33,
    baseDelayMs: 400,
    randomizationFactor: 0.6, // More variation for end loading
  });

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
      startLoading.executeWithProgress(
        undefined, // No async operation to wait for
        () => {
          setLoadingOverlayOpen(false);
          eventBridge.emit("gameUnpaused", {});
        }
      );
    });

    const resultSubscriptionCleanup = eventBridge.addEventListener("resultSubmitted", () => {
      setResultOverlayOpen(true);
      endLoading.executeWithProgress(
        undefined, // No async operation to wait for
        () => {
          // setResultOverlayOpen(false);
          navigateTo(moduleIdMap.LEVEL_END, "level-summary");
        }
      );
    });

    return () => {
      loadedSubscriptionCleanup();
      resultSubscriptionCleanup();
    };
  }, [eventBridge, startLoading.executeWithProgress, endLoading.executeWithProgress, navigateTo]);

  return (
    <>
      <PanoramaViewer />

      {/* Loading overlay - open by default, no initial animation */}
      <OverlaySheet open={loadingOverlayOpen} skipInitialAnimation={true}>
        <LoadingScreen progress={startLoading.progress} />
      </OverlaySheet>

      {/* Menu overlay - toggleable by button */}
      <OverlaySheet open={menuOpen}>
        <PauseMenu onUnpause={toggleMenu} />
      </OverlaySheet>

      {/* Result overlay - shown after resultSubmitted event */}
      <OverlaySheet open={resultOverlayOpen}>
        <LoadingScreen progress={endLoading.progress} />
      </OverlaySheet>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background z-50">
        <Button onClick={toggleMenu} className="w-[200px]">
          {menuOpen ? "Resume" : "Pause"}
        </Button>
      </div>
    </>
  );
}
