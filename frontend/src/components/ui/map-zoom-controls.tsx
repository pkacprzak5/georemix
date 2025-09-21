import { useMap } from "react-leaflet";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapZoomControlsProps {
  className?: string;
}

export function MapZoomControls({ className = "absolute bottom-4 right-4 z-[1000]" }: MapZoomControlsProps) {
  const map = useMap();
  
  const handleZoomIn = () => {
    map.zoomIn();
  };
  
  const handleZoomOut = () => {
    map.zoomOut();
  };
  
  return (
    <div className={`${className} flex flex-col gap-2`}>
      <Button
        onClick={handleZoomIn}
        className="w-10 h-10 bg-background"
      >
        <Plus size={20} />
      </Button>
      <Button
        onClick={handleZoomOut}
        className="w-10 h-10 bg-background"
      >
        <Minus size={20} />
      </Button>
    </div>
  );
}