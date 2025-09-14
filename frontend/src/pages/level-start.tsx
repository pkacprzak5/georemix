import { PanoramaViewer } from "@/features/game/PanoramaViewer";

// Replace with a valid Mapillary image ID for testing
const TEST_IMAGE_ID = "164095525622425";

export function LevelStart() {
  return <PanoramaViewer imageId={TEST_IMAGE_ID} className="w-full h-full" />;
}
