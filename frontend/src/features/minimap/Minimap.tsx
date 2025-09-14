import { pinpoint } from "pepicons/print";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Window, WindowContent } from "@/components/layout/window";
import { Button } from "@/components/ui/button";
import { useResizableWindow } from "@/hooks/use-resizable-window";
import { type MapPosition } from "@/types/project";
import "leaflet/dist/leaflet.css";

const WINDOW_WIDTH_MINIMIZED = 300;
const WINDOW_HEIGHT_MINIMIZED = 200;
const WINDOW_WIDTH_MAXIMIZED_RATIO = 0.5; // 50% of viewport
const WINDOW_HEIGHT_MAXIMIZED_RATIO = 0.5; // 50% of viewport

type MapLayer = {
  url: string;
  attribution: string;
};

const mapLayer: MapLayer = {
  url: "https://tiles.stadiamaps.com/tiles/stamen_toner_background/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

const customIcon = L.divIcon({
  html: `${pinpoint}`,
  className: "custom-pinpoint-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

type RegisterLeafletHooksProps = {
  onPositionSelect: (position: MapPosition) => void;
};

/** This component is a hack, as we need to run this hooks within leaflet provider. */
function RegisterLeafletHooks({ onPositionSelect }: RegisterLeafletHooksProps) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onPositionSelect(e.latlng);
    },
  });

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

type MinimapProps = {
  onPositionSubmit: (location: MapPosition) => void;
};

export function Minimap({ onPositionSubmit }: MinimapProps) {
  const [minimapPosition, setMinimapPosition] = useState<MapPosition | null>(null);

  const {
    position,
    setPosition,
    isVisible,
    style,
    windowClass,
    handleMaximize,
    handleMinimize,
    handleClose,
  } = useResizableWindow({
    minimizedSize: {
      width: WINDOW_WIDTH_MINIMIZED,
      height: WINDOW_HEIGHT_MINIMIZED,
    },
    maximizedRatio: {
      width: WINDOW_WIDTH_MAXIMIZED_RATIO,
      height: WINDOW_HEIGHT_MAXIMIZED_RATIO,
    },
    initialPosition: {
      x: window.innerWidth * 0.98 - WINDOW_WIDTH_MINIMIZED,
      y: window.innerHeight * 0.98 - WINDOW_HEIGHT_MINIMIZED,
    },
  });

  if (!isVisible) {
    return null;
  }

  return (
    <Window
      title="map.exe"
      position={position}
      setPosition={setPosition}
      className={windowClass}
      style={style}
      onMaximize={handleMaximize}
      onMinimize={handleMinimize}
      onClose={handleClose}>
      <WindowContent className="w-full h-full relative">
        <div className="absolute top-2 left-2  bg-white p-2 rounded shadow z-[1000]"></div>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: "100%", width: "100%", cursor: "default" }}>
          <TileLayer url={mapLayer.url} attribution={mapLayer.attribution} />
          <RegisterLeafletHooks onPositionSelect={setMinimapPosition} />
          {minimapPosition && <Marker position={minimapPosition} icon={customIcon} />}
        </MapContainer>
        {minimapPosition && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-auto">
            <Button className="relative z-[1000]" onClick={() => onPositionSubmit(minimapPosition)}>
              Submit
            </Button>
          </div>
        )}
      </WindowContent>
    </Window>
  );
}
