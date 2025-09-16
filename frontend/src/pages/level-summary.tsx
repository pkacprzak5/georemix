import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameStateManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";

export function LevelSummary() {
  const { navigateTo } = useNavigation();
  const gameStateManager = useGameStateManager();
  const [resultData, setResultData] = useState<{
    distance: number;
    timeTaken: number;
    score: number;
  } | null>(null);

  useEffect(() => {
    try {
      const levelResult = gameStateManager.levelResult;
      
      // Calculate score based on distance (simple scoring system)
      const maxScore = 5000;
      const score = Math.max(0, maxScore - Math.floor(levelResult.distance / 10));
      
      setResultData({
        distance: levelResult.distance,
        timeTaken: levelResult.timeTaken,
        score: score
      });
    } catch (error) {
      console.error("Error loading result data:", error);
      // Fallback to mock data
      setResultData({
        distance: 1230,
        timeTaken: 45,
        score: 3770
      });
    }
  }, [gameStateManager]);

  const handleViewMap = () => {
    navigateTo(moduleIdMap.LEVEL_END, "level-map");
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

  const getScoreRating = (score: number) => {
    if (score >= 4500) {
      return { text: "Excellent!", color: "text-green-600" };
    }
    if (score >= 3500) {
      return { text: "Great!", color: "text-blue-600" };
    }
    if (score >= 2500) {
      return { text: "Good", color: "text-yellow-600" };
    }
    if (score >= 1500) {
      return { text: "Fair", color: "text-orange-600" };
    }
    return { text: "Try Again", color: "text-red-600" };
  };

  const scoreRating = getScoreRating(resultData.score);

  return (
    <div className="flex items-center justify-center min-h-full bg-background">
      <div className="w-full max-w-md space-y-8 p-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Level Complete!</h1>
          <p className={`text-xl font-semibold ${scoreRating.color}`}>
            {scoreRating.text}
          </p>
        </div>

        {/* Results Stats */}
        <div className="space-y-6">
          <div className="text-center p-6 border rounded-lg bg-card">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {resultData.score}
            </div>
            <div className="text-sm text-muted-foreground">SCORE</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg bg-card">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {formatDistance(resultData.distance)}
              </div>
              <div className="text-xs text-muted-foreground">DISTANCE</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-card">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatTime(resultData.timeTaken)}
              </div>
              <div className="text-xs text-muted-foreground">TIME</div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-4">
          <Button onClick={handleViewMap} variant="default" className="w-full">
            View on Map
          </Button>
        </div>
      </div>
    </div>
  );
}