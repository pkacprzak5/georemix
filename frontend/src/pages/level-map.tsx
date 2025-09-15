import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { useGameStateManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for different markers
const actualLocationIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const guessLocationIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEMxOS40MDM2IDAgMjUgNS41OTY0NCAyNSAxMi41QzI1IDE5LjQwMzYgMTkuNDAzNiAyNSAxMi41IDI1QzUuNTk2NDQgMjUgMCAxOS40MDM2IDAgMTIuNUMwIDUuNTk2NDQgNS41OTY0NCAwIDEyLjUgMFoiIGZpbGw9IiNkYzI2MjYiLz4KPHBhdGggZD0iTTEyLjUgNDBMMTIuNSAyNSIgc3Ryb2tlPSIjZGMyNjI2IiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg==",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const mapLayer = {
  url: "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

// Component to fit bounds when markers change
function MapBounds({
  actualPosition,
  guessPosition,
}: {
  actualPosition: [number, number];
  guessPosition: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([actualPosition, guessPosition]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, actualPosition, guessPosition]);

  return null;
}

export function LevelMap() {
  const { navigateTo, navigateWithLoading } = useNavigation();
  const gameStateManager = useGameStateManager();
  const [resultData, setResultData] = useState<{
    distance: number;
    actualPosition: [number, number];
    guessPosition: [number, number];
  } | null>(null);

  useEffect(() => {
    try {
      const levelResult = gameStateManager.levelResult;

      const submittedPosition = levelResult.submittedPosition;
      const actualPosition = levelResult.answerPosition;

      setResultData({
        distance: levelResult.distance,
        actualPosition: [actualPosition.lat, actualPosition.lng],
        guessPosition: [submittedPosition.lat, submittedPosition.lng],
      });
    } catch (error) {
      console.error("Error loading result data:", error);
      // Fallback to mock data
      setResultData({
        distance: 1230,
        actualPosition: [50.0619, 19.9368],
        guessPosition: [50.0647, 19.945],
      });
    }
  }, [gameStateManager]);

  const handleBackToSummary = () => {
    navigateTo(moduleIdMap.LEVEL_END, "level-results");
  };

  const handleNextLevel = () => {
    if(gameStateManager.numberOfLevels === gameStateManager.currentLevelInfo.number){
      navigateTo(moduleIdMap.FINAL, "final-result");
    } else {
      const loadingPromise = new Promise((resolve) => {
        gameStateManager.loadNextLevel();
        resolve(null);
      })
      navigateWithLoading(moduleIdMap.LEVEL_START, "level-start", loadingPromise);
    }

    
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  if (!resultData) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-lg">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="text-center py-4 border-b">
        <h1 className="text-2xl font-bold mb-1">Result Map</h1>
        <p className="text-sm text-muted-foreground">
          You were {formatDistance(resultData.distance)} away
        </p>
      </div>

      {/* Map */}
      <div className="h-[500px] p-4">
        <div className="w-full h-full border rounded-lg overflow-hidden">
          <MapContainer
            center={resultData.actualPosition}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
            attributionControl={false}>
            <TileLayer url={mapLayer.url} attribution={mapLayer.attribution} />

            {/* Actual location marker (blue) */}
            <Marker position={resultData.actualPosition} icon={actualLocationIcon} />

            {/* Guess location marker (red) */}
            <Marker position={resultData.guessPosition} icon={guessLocationIcon} />

            {/* Line connecting the two points */}
            <Polyline
              positions={[resultData.actualPosition, resultData.guessPosition]}
              color="red"
              weight={3}
              opacity={0.7}
              dashArray="5, 10"
            />

            {/* Auto-fit bounds to show both markers */}
            <MapBounds
              actualPosition={resultData.actualPosition}
              guessPosition={resultData.guessPosition}
            />
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center mt-4 space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-sm">Actual Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
            <span className="text-sm">Your Guess</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t">
        <div className="flex justify-center space-x-4 mb-4">
          <Button onClick={handleBackToSummary}>← Back to Summary</Button>
          <Button onClick={handleNextLevel}>Next Level</Button>
        </div>
      </div>
    </div>
  );
}
