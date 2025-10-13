import { useMap } from "react-leaflet";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import L from "leaflet";

interface MapZoomControlsProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  iconSize?: number;
}

export function MapZoomControls({
  className = "absolute bottom-4 right-4 z-[1000]",
  size = "default",
  iconSize,
}: MapZoomControlsProps) {
  const map = useMap();
  const divRef = useRef(null);

  useEffect(() => {
    if (!divRef.current) {
      return;
    }
    L.DomEvent.disableClickPropagation(divRef.current);
  });

  const handleZoomIn = (e: any) => {
    e.stopPropagation();
    map.zoomIn();
  };

  const handleZoomOut = (e: any) => {
    e.stopPropagation();
    map.zoomOut();
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      buttonSize: "w-8 3xl:w-10 4xl:w-12 short-screen:w-8",
      iconSize: iconSize || 16,
      spacing: "gap-2 3xl:gap-3 4xl:gap-4 short-screen:gap-2",
    },
    default: {
      buttonSize: "w-10 3xl:w-12 4xl:w-14 short-screen:w-10",
      iconSize: iconSize || 20,
      spacing: "gap-2 3xl:gap-3 4xl:gap-4 short-screen:gap-2",
    },
    lg: {
      buttonSize: "w-12 3xl:w-14 4xl:w-16 short-screen:w-12",
      iconSize: iconSize || 24,
      spacing: "gap-2 3xl:gap-3 4xl:gap-4 short-screen:gap-2",
    },
  };

  const config = sizeConfig[size];

  return (
    <div ref={divRef} className={`${className} flex flex-col ${config.spacing}`}>
      <Button
        onMouseDown={(e) => e.preventDefault()}
        // onMouseUp={(e) => e.stopPropagation()}
        onClick={handleZoomIn}
        className={`${config.buttonSize} h-[unset] bg-background aspect-square`}>
        <Plus className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7 short-screen:w-4 short-screen:h-4" />
      </Button>
      <Button
        onMouseDown={(e) => e.stopPropagation()}
        // onMouseUp={(e) => e.stopPropagation()}
        onClick={handleZoomOut}
        className={`${config.buttonSize} h-[unset] bg-background aspect-square`}>
        <Minus className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7 short-screen:w-4 short-screen:h-4" />
      </Button>
    </div>
  );
}
