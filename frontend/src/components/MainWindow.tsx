import { useState } from "react";
import { Window, WindowContent } from "@/components/ui/window";
import MapillaryViewer from "@/components/MapillaryViewer";
import { Sheet, SheetContent } from "@/components/ui/custom-sheet";
import { Button } from "@/components/ui/button";

const TEST_IMAGE_ID = "164095525622425"; // Replace with a valid Mapillary image ID for testing

export function MainWindow() {
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleCloseSheet = () => {
    setHasInteracted(true);
    setIsSheetOpen(false);
  };

  // Unused for now
  // const handleOpenSheet = () => {
  //   setHasInteracted(true);
  //   setIsSheetOpen(true);
  // };

  return (
    <Window
      title="guesser.exe"
      initialPosition={{ x: (window.innerWidth / 2) * 0.05, y: (window.innerHeight / 2) * 0.05 }}
      className="h-[95vh] w-[95vw] overflow-hidden">
      <WindowContent className="w-full h-full relative">
        <div className="w-full h-full relative">
          <MapillaryViewer imageId={TEST_IMAGE_ID} width="100%" height="100%" />

          {/* Sheet controlled programmatically - contained within WindowContent */}
          <Sheet open={isSheetOpen} modal={false}>
            <SheetContent
              side="bottom"
              animate={hasInteracted}
              className="w-full h-full [&>button]:hidden">
              <div className="flex gap-2 mt-auto">
                <Button
                  onClick={handleCloseSheet}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800">
                  Hide Panel
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </WindowContent>
    </Window>
  );
}
