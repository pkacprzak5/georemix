import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { pinpoint } from "pepicons/print";
import { Button } from "@/components/ui/button";
import { type MapCoordinates } from "@/types/project";
import { useGameState } from "@/context/game-state";

interface MapLayer {
  url: string;
  attribution: string;
}

interface MapClickHandlerProps {
  onPositionSelect: (position: MapCoordinates) => void;
}

const mapLayer: MapLayer = {
  url: "https://tiles.stadiamaps.com/tiles/stamen_toner_background/{z}/{x}/{y}{r}.png",
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
  const [locationPins, setLocationPins] = useState<MapCoordinates[]>([]);
  const { eventBridge } = useGameState();

  // Listen for location events from eventBridge
  useEffect(() => {
    const unsubscribe = eventBridge.addEventListener("locationUpdate", (data: unknown) => {
      // Expect data to be [lng, lat] array
      if (Array.isArray(data) && data.length >= 2) {
        const [lng, lat] = data;
        const newPin: MapCoordinates = { lat: lat as number, lng: lng as number };
        setLocationPins(prev => [...prev, newPin]);
      }
    });

    return unsubscribe;
  }, [eventBridge]);

  // Custom icon for selected position using Pepicons pinpoint
  const customIcon = L.divIcon({
    html: `${pinpoint}`,
    className: "custom-pinpoint-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Custom icon for location pins (different color/style)
  const locationPinIcon = L.divIcon({
    html: `<div style="color: #ef4444;">${pinpoint}</div>`,
    className: "custom-location-pin-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "100%", width: "100%", cursor: "default" }}>
        <TileLayer url={mapLayer.url} attribution={mapLayer.attribution} />
        <MapClickHandler onPositionSelect={setPosition} />
        <MapResizer />
        {position && <Marker position={position} icon={customIcon} />}
        {locationPins.map((pin, index) => (
          <Marker 
            key={index} 
            position={pin} 
            icon={locationPinIcon}
          />
        ))}
      </MapContainer>
      {position && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-auto">
          <Button className="relative z-[1000]">Submit</Button>
        </div>
      )}
    </>
  );
}
