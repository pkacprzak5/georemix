import { Window, WindowContent } from "@/components/ui/window";
import MapillaryViewer from "@/components/MapillaryViewer";


const TEST_IMAGE_ID = "164095525622425"; // Replace with a valid Mapillary image ID for testing

export function MainWindow() {
  return (
    <Window
      title="Main Window"
      initialPosition={{ x: (window.innerWidth / 2) * 0.05, y: (window.innerHeight / 2) * 0.05 }}
      className="h-[95vh] w-[95vw] overflow-hidden">
      <WindowContent className="w-full h-full">
        <MapillaryViewer
          imageId={TEST_IMAGE_ID}
          width="100%"
          height="100%"
        />
      </WindowContent>
    </Window>
  );
}
