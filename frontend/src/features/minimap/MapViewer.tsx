import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { MapPin } from "lucide-react";
import { renderToString } from "react-dom/server";
import { Button } from "@/components/ui/button";
import { type MapCoordinates } from "@/types/project";
import { useEventBridge, useGameStateManager } from "@/context/game-state";

interface MapLayer {
  url: string;
  attribution: string;
}

interface MapClickHandlerProps {
  onPositionSelect: (position: MapCoordinates) => void;
}

const mapLayer: MapLayer = {
  url: "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

function MapClickHandler({ onPositionSelect }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onPositionSelect(e.latlng);
    },
  });

  return null;
}

function MapResizer() {
  const map = useMap();

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    const mapContainer = map.getContainer();
    resizeObserver.observe(mapContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
}

export default function MapViewer() {
  const [position, setPosition] = useState<MapCoordinates | null>(null);
  const gameStateManager = useGameStateManager();
  const eventBridge = useEventBridge();

  const handleSubmit = () => {
    if (!position) {
      return;
    }
    gameStateManager.calculateResult(position);
    eventBridge.emit("resultSubmitted", {});
  };

  // Custom icon for selected position using Lucide MapPin
  const customIcon = L.divIcon({
    html: renderToString(<MapPin size={32} color="var(--main)" />),
    className: "custom-mappin-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={2}
        attributionControl={false}
        style={{ height: "100%", width: "100%", cursor: "default" }}>
        <TileLayer url={mapLayer.url} attribution={mapLayer.attribution} />
        <MapClickHandler onPositionSelect={setPosition} />
        <MapResizer />
        {position && <Marker position={position} icon={customIcon} />}
      </MapContainer>
      <div
        style={{ opacity: position ? 1 : 0, pointerEvents: position ? "auto" : "none" }}
        className="absolute bottom-4 left-1/2 transform transition-opacity duration-200 ease-in-out -translate-x-1/2 z-[1000]">
        <Button onClick={handleSubmit} className="relative z-[1000]">
          Submit
        </Button>
      </div>
    </>
  );
}
