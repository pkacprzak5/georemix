import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { MapZoomControls } from "@/components/ui/map-zoom-controls";
import { type MapCoordinates } from "@/types/project";
import { useEventBridge, useGameStateManager } from "@/context/game-state";
import MAP_TILES from "@/../public/MapTiles.json"
// @ts-ignore
import "@maplibre/maplibre-gl-leaflet";

interface MapClickHandlerProps {
  onPositionSelect: (position: MapCoordinates) => void;
}


// Component to add MapLibre GL layer
function MapLibreLayer() {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore - MapLibre GL Leaflet plugin
    const mapLibreLayer = L.maplibreGL({
      //@ts-ignore
      style: MAP_TILES
    }).addTo(map);

    return () => {
      map.removeLayer(mapLibreLayer);
    };
  }, [map]);

  return null;
}

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
    let resizeInterval: NodeJS.Timeout | null = null;
    let stopTimeout: NodeJS.Timeout | null = null;

    const resizeObserver = new ResizeObserver(() => {
      // Clear any existing interval and stop timeout
      if (resizeInterval) {
        clearInterval(resizeInterval);
      }
      if (stopTimeout) {
        clearTimeout(stopTimeout);
      }

      // Start continuous updates during resize
      resizeInterval = setInterval(() => {
        map.invalidateSize({ pan: false, animate: false });
      }, 15);

      // Stop the interval after 150ms of no resize events
      stopTimeout = setTimeout(() => {
        if (resizeInterval) {
          clearInterval(resizeInterval);
          resizeInterval = null;
        }
      }, 150);
    });

    const mapContainer = map.getContainer();
    resizeObserver.observe(mapContainer);

    return () => {
      if (resizeInterval) {
        clearInterval(resizeInterval);
      }
      if (stopTimeout) {
        clearTimeout(stopTimeout);
      }
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

  const selectedLocationIcon = L.divIcon({
    html: `
      <svg width="32" height="32" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
        fill="var(--main)">
          <path d="M12.56 20.82a.96.96 0 0 1-1.12 0C6.611 17.378 1.486 10.298 6.667 5.182A7.6 7.6 0 0 1 12 3c2 0 3.919.785 5.333 2.181 5.181 5.116.056 12.196-4.773 15.64" />
          <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
      </svg>
    `,
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
        minZoom={2}
        maxZoom={18}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%", cursor: "default" }}>
        <MapLibreLayer />
        <MapClickHandler onPositionSelect={setPosition} />
        <MapResizer />
        {position && <Marker position={position} icon={selectedLocationIcon} />}
        <MapZoomControls className="absolute bottom-4 right-4 z-[999]" size="sm" />
      </MapContainer>
      <div
        style={{ opacity: position ? 1 : 0, pointerEvents: position ? "auto" : "none" }}
        className="absolute 2xl:w-[50%] w-[30%] max-w-[200px] 3xl:max-w-[240px] 4xl:max-w-[280px] short-screen:max-w-[200px] bottom-4 left-1/2 transform transition-opacity duration-200 ease-in-out -translate-x-1/2 z-[1000]">
        <Button onClick={handleSubmit} className="relative z-[1000] w-full 3xl:text-xl 3xl:py-5 4xl:text-2xl 4xl:py-6 short-screen:text-base short-screen:py-3">
          To tutaj!
        </Button>
      </div>
    </>
  );
}
