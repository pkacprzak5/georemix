import { createPortal } from "react-dom";
import { useState } from "react";
import { OverlaySheet } from "@/components/layout/overlay-sheet";
import { Button } from "@/components/ui/button";
import { PanoramaViewer } from "@/features/game/PanoramaViewer";
import { Minimap } from "@/features/minimap/Minimap";
import type { MapPosition } from "@/types/project";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";

const TEST_IMAGE_ID = "164095525622425";

export function LevelStart() {
  const { navigateTo } = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((old) => !old);

  const handlePositionSubmit = (position: MapPosition) => {
    // TODO: Reflect position submittion in the game state.
    console.log(position);
    navigateTo(moduleIdMap.LEVEL_END, "level-results");
  };

  return (
    <>
      <PanoramaViewer imageId={TEST_IMAGE_ID} className="w-full h-full absolute" />
      <OverlaySheet open={menuOpen}>Hello from sheet!</OverlaySheet>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background z-50">
        <Button onClick={toggleMenu} className="w-[200px]">
          {menuOpen ? "Hide Menu" : "Open Menu"}
        </Button>
      </div>

      {createPortal(<Minimap onPositionSubmit={handlePositionSubmit} />, document.body)}
    </>
  );
}
