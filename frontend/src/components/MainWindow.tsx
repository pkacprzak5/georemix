import { useEffect } from "react";
import { Window, WindowContent } from "@/components/ui/window";
import { PanoramaViewer } from "@/features/game/PanoramaViewer";
import { NavigationSheet } from "@/lib/navigation-system/NavigationSheet";
import { useNavigation } from "@/lib/navigation-system/NavigationProvider";
import { Button } from "@/components/ui/button";

const TEST_IMAGE_ID = "164095525622425"; // Replace with a valid Mapillary image ID for testing

export function MainWindow() {
  const { showMenu, state } = useNavigation();

  useEffect(() => {
    showMenu(); // Ensure menu is shown at start
  }, [showMenu]);

  return (
    <Window
      title="guesser.exe"
      initialPosition={{ x: (window.innerWidth / 2) * 0.05, y: (window.innerHeight / 2) * 0.05 }}
      className="h-[95vh] w-[95vw] overflow-hidden">
      <WindowContent className="w-full h-full relative">
        <div className="w-full h-full relative">
          <PanoramaViewer imageId={TEST_IMAGE_ID} width="100%" height="100%" />
          <NavigationSheet />
          {!state.isMenuOpen && (
            <Button onClick={showMenu} className="absolute bottom-4 right-4 z-50">
              Show Menu
            </Button>
          )}
        </div>
      </WindowContent>
    </Window>
  );
}
