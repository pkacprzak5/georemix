import { useState } from "react";
import { OverlaySheet } from "@/components/layout/overlay-sheet";
import { Button } from "@/components/ui/button";
import PanoramaViewer from "@/features/game/PanoramaViewer";

export function LevelStart() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((old) => !old);

  return (
    <>
      <PanoramaViewer />
      <OverlaySheet open={menuOpen}>Hello from sheet!</OverlaySheet>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background z-50">
        <Button onClick={toggleMenu} className="w-[200px]">
          {menuOpen ? "Hide Menu" : "Open Menu"}
        </Button>
      </div>
    </>
  );
}
