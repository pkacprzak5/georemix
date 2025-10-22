import { useEffect, useState } from "react";
import { OverlaySheet } from "@/components/gameplay/overlay-sheet";
import PanoramaViewer from "@/components/gameplay/PanoramaViewer";
import { LoadingScreen } from "@/pages/loading-screen";
import { PauseMenu } from "@/components/gameplay/pause-menu";
import { useEventBridge } from "@/context";
import { useNavigation } from "@/lib/navigation/navigation-provider";
import { moduleIdMap } from "@/types/navigation";
import { useProgressiveLoading } from "@/hooks/use-progressive-loading";
import { GameplayOverlay } from "@/components/gameplay/gameplay-overlay";

export function Gameplay() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingOverlayOpen, setLoadingOverlayOpen] = useState(true);
  const [resultOverlayOpen, setResultOverlayOpen] = useState(false);
  const eventBridge = useEventBridge();
  const { navigateTo } = useNavigation();

  // progressive loading hooks for start and end loading
  const startLoading = useProgressiveLoading({
    initialProgress: 33,
    baseDelayMs: 300,
    randomizationFactor: 0.2,
  });

  const endLoading = useProgressiveLoading({
    initialProgress: 33,
    baseDelayMs: 400,
    randomizationFactor: 0.6, 
  });

  useEffect(() => {
    const loadedCleanup = eventBridge.addEventListener("viewerLoaded", () => {
      startLoading.executeWithProgress(
        undefined, // nothing to wait for
        () => {
          setLoadingOverlayOpen(false);
          eventBridge.emit("gameStarted", {});
        }
      );
    });

    const resultCleanup = eventBridge.addEventListener("resultSubmitted", () => {
      setResultOverlayOpen(true);
      endLoading.executeWithProgress(
        undefined,// nothing to wait for
        () => {
          navigateTo(moduleIdMap.LEVEL_END, "level-result");
        }
      );
    });

    const pauseCleanup = eventBridge.addEventListener("gamePaused", () => {
      setMenuOpen(true);
    });
    const unpauseCleanup = eventBridge.addEventListener("gameUnpaused", () => {
      setMenuOpen(false);
    });

    return () => {
      loadedCleanup();
      resultCleanup();
      pauseCleanup();
      unpauseCleanup();
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
        <PauseMenu />
      </OverlaySheet>

      {/* Result overlay - shown after resultSubmitted event */}
      <OverlaySheet open={resultOverlayOpen}>
        <LoadingScreen progress={endLoading.progress} />
      </OverlaySheet>

      <GameplayOverlay />
    </>
  );
}
