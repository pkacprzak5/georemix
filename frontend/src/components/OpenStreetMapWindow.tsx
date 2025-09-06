import L from "leaflet";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { pinpoint } from "pepicons/print";
import { Window, WindowContent } from "@/components/ui/window";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

interface Position {
  lat: number;
  lng: number;
}

interface MapLayer {
  url: string;
  attribution: string;
}

const mapLayer: MapLayer = {
  url: "https://tiles.stadiamaps.com/tiles/stamen_toner_background/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

interface MapClickHandlerProps {
  onPositionSelect: (position: Position) => void;
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

export function OpenStreetMapWindow() {
  // Window size constants for calculations
  const WINDOW_WIDTH_MINIMIZED = 300;
  const WINDOW_HEIGHT_MINIMIZED = 200;
  const WINDOW_WIDTH_MAXIMIZED_RATIO = 0.5; // 50% of viewport
  const WINDOW_HEIGHT_MAXIMIZED_RATIO = 0.5; // 50% of viewport

  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [position, setPosition] = useState({
    x: window.innerWidth * 0.98 - WINDOW_WIDTH_MINIMIZED,
    y: window.innerHeight * 0.98 - WINDOW_HEIGHT_MINIMIZED,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleMaximize = () => {
    if (isMaximized) {
      return; // Already maximized, do nothing
    }

    setIsResizing(true);
    // Calculate position to simulate expansion from top-left corner
    const currentWidth = WINDOW_WIDTH_MINIMIZED;
    const currentHeight = WINDOW_HEIGHT_MINIMIZED;
    const targetWidth = window.innerWidth * WINDOW_WIDTH_MAXIMIZED_RATIO;
    const targetHeight = window.innerHeight * WINDOW_HEIGHT_MAXIMIZED_RATIO;

    const widthDiff = targetWidth - currentWidth;
    const heightDiff = targetHeight - currentHeight;

    setPosition({
      x: position.x - widthDiff, // Move left to expand from left edge
      y: position.y - heightDiff, // Move up to expand from top edge
    });
    setIsMaximized(true);

    // Remove transition after animation completes (faster timing)
    setTimeout(() => setIsResizing(false), 400);
  };

  const handleMinimize = () => {
    if (!isMaximized) {
      return; // Already minimized, do nothing
    }

    setIsResizing(true);
    // Calculate position to simulate shrinking from bottom-right corner
    const currentWidth = window.innerWidth * WINDOW_WIDTH_MAXIMIZED_RATIO;
    const currentHeight = window.innerHeight * WINDOW_HEIGHT_MAXIMIZED_RATIO;
    const targetWidth = WINDOW_WIDTH_MINIMIZED;
    const targetHeight = WINDOW_HEIGHT_MINIMIZED;

    const widthDiff = currentWidth - targetWidth;
    const heightDiff = currentHeight - targetHeight;

    setPosition({
      x: position.x + widthDiff, // Move right to shrink from right edge
      y: position.y + heightDiff, // Move down to shrink from bottom edge
    });
    setIsMaximized(false);

    // Remove transition after animation completes (faster timing)
    setTimeout(() => setIsResizing(false), 400);
  };
  const handlePositionSelect = (mapPosition: Position) => {
    setSelectedPosition(mapPosition);
  };

  const handleClose = () => {
    setIsClosing(true);
    // Don't change position - just scale to 0 from current position
    // The transformOrigin: 'center' will make it shrink from its center point

    // Unmount after animation completes (faster timing)
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  // const handleExpand = () => {
  //   // This function expands from center (currently unused)
  //   setIsClosing(false);
  //   setIsVisible(true);
  //   // Animation logic for expanding from center would go here
  // };

  const windowClass = isMaximized
    ? `h-[50vh] w-[50vw] ${isResizing ? "transition-[width,height,left,top] duration-400 sharp-ease" : ""} ${isClosing ? "transition-transform duration-300 sharp-ease" : ""}`
    : `h-[200px] w-[300px] ${isResizing ? "transition-[width,height,left,top] duration-400 sharp-ease" : ""} ${isClosing ? "transition-transform duration-300 sharp-ease" : ""}`;

  // Custom icon for selected position using Pepicons pinpoint
  const customIcon = L.divIcon({
    html: `${pinpoint}`,
    className: "custom-pinpoint-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    isVisible && (
      <Window
        title="OpenStreetMap Window"
        position={position}
        setPosition={setPosition}
        className={windowClass}
        style={isClosing ? { transform: 'scale(0)', transformOrigin: 'center' } : undefined}
        onMaximize={handleMaximize}
        onMinimize={handleMinimize}
        onClose={handleClose}>
        <WindowContent className="w-full h-full relative">
          <div className="absolute top-2 left-2  bg-white p-2 rounded shadow z-[1000]"></div>
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            style={{ height: "100%", width: "100%", cursor: "default" }}
            key={isMaximized ? "maximized" : "minimized"}>
            <TileLayer url={mapLayer.url} attribution={mapLayer.attribution} />
            <MapClickHandler onPositionSelect={handlePositionSelect} />
            <MapResizer />
            {selectedPosition && <Marker position={selectedPosition} icon={customIcon} />}
          </MapContainer>
          {selectedPosition && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-auto">
              <Button className="relative z-[1000]">Submit</Button>
            </div>
          )}
        </WindowContent>
      </Window>
    )
  );
}
