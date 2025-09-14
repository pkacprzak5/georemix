import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { pinpoint } from "pepicons/print";
import { Button } from "@/components/ui/button";
import { type MapPosition } from "@/types/project";

interface MapLayer {
  url: string;
  attribution: string;
}

interface MapClickHandlerProps {
  onPositionSelect: (position: MapPosition) => void;
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
  const [position, setPosition] = useState<MapPosition | null>(null);

  // Custom icon for selected position using Pepicons pinpoint
  const customIcon = L.divIcon({
    html: `${pinpoint}`,
    className: "custom-pinpoint-icon",
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
      </MapContainer>
      {position && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-auto">
          <Button className="relative z-[1000]">Submit</Button>
        </div>
      )}
    </>
  );
}
