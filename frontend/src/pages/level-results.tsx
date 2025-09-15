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
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different markers
const actualLocationIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const guessLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEMxOS40MDM2IDAgMjUgNS41OTY0NCAyNSAxMi41QzI1IDE5LjQwMzYgMTkuNDAzNiAyNSAxMi41IDI1QzUuNTk2NDQgMjUgMCAxOS40MDM2IDAgMTIuNUMwIDUuNTk2NDQgNS41OTY0NCAwIDEyLjUgMFoiIGZpbGw9IiNkYzI2MjYiLz4KPHBhdGggZD0iTTEyLjUgNDBMMTIuNSAyNSIgc3Ryb2tlPSIjZGMyNjI2IiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg==',
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
function MapBounds({ actualPosition, guessPosition }: { actualPosition: [number, number], guessPosition: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    const bounds = L.latLngBounds([actualPosition, guessPosition]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, actualPosition, guessPosition]);
  
  return null;
}

export function LevelResults() {
  const { navigateTo } = useNavigation();
  const gameStateManager = useGameStateManager();
  const [resultData, setResultData] = useState<{
    distance: number;
    timeTaken: number;
    actualPosition: [number, number];
    guessPosition: [number, number];
    score: number;
  } | null>(null);

  useEffect(() => {
    try {
      const levelResult = gameStateManager.levelResult;
      
      // Mock submitted position for now - in real implementation this would come from game state
      const submittedPosition = levelResult.submittedPosition; // Krakow as example
      const actualPosition =levelResult.answerPosition; // Slightly different position
      
      // Calculate score based on distance (simple scoring system)
      const maxScore = 5000;
      const score = Math.max(0, maxScore - Math.floor(levelResult.distance / 10));
      
      setResultData({
        distance: levelResult.distance,
        timeTaken: levelResult.timeTaken,
        actualPosition: [actualPosition.lat, actualPosition.lng],
        guessPosition: [submittedPosition.lat, submittedPosition.lng],
        score: score
      });
    } catch (error) {
      console.error("Error loading result data:", error);
      // Fallback to mock data
      setResultData({
        distance: 1230,
        timeTaken: 45,
        actualPosition: [50.0619, 19.9368],
        guessPosition: [50.0647, 19.9450],
        score: 3770
      });
    }
  }, [gameStateManager]);

  const handleNextLevel = () => {
    // TODO: Navigate to next level or back to level selection
    navigateTo(moduleIdMap.INTRO, "stage-picker");
  };

  const handleTryAgain = () => {
    // TODO: Reset level and go back to gameplay
    navigateTo(moduleIdMap.GAMEPLAY, "gameplay");
  };

  if (!resultData) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-lg">Loading results...</div>
      </div>
    );
  }

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Header */}
      <div className="text-center py-6 border-b">
        <h1 className="text-3xl font-bold mb-2">Level Complete!</h1>
        <p className="text-muted-foreground">Here's how you did</p>
      </div>

      {/* Results Stats */}
      <div className="flex justify-center py-6">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{resultData.score}</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{formatDistance(resultData.distance)}</div>
            <div className="text-sm text-muted-foreground">Distance</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{formatTime(resultData.timeTaken)}</div>
            <div className="text-sm text-muted-foreground">Time</div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 p-6">
        <div className="w-full h-96 border rounded-lg overflow-hidden">
          <MapContainer
            center={resultData.actualPosition}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            attributionControl={false}
          >
            <TileLayer
              url={mapLayer.url} attribution={mapLayer.attribution}
            />
            
            {/* Actual location marker (blue) */}
            <Marker 
              position={resultData.actualPosition} 
              icon={actualLocationIcon}
            />
            
            {/* Guess location marker (red) */}
            <Marker 
              position={resultData.guessPosition} 
              icon={guessLocationIcon}
            />
            
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
      <div className="p-6 border-t">
        <div className="flex justify-center space-x-4">
          <Button onClick={handleTryAgain} variant="default">
            Try Again
          </Button>
          <Button onClick={handleNextLevel} variant="reverse">
            Next Level
          </Button>
        </div>
      </div>
    </div>
  );
}