
import { Button } from "@/components/ui/button";
import { useGameStateManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import { THUMBNAIL_ENDPOINT } from "@/constants";

export function LevelStart() {
  const { navigateTo } = useNavigation();
  const gameStateManager = useGameStateManager();

  const handleStartGameplay = () => {
    navigateTo(moduleIdMap.GAMEPLAY, "gameplay");
  };

  const levelInfo = gameStateManager.currentLevelInfo;

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Level {levelInfo.number}</h1>
          <p className="text-muted-foreground mb-4">{levelInfo.name}</p>
          {levelInfo.thumbnail && (
            <img
              src={`${THUMBNAIL_ENDPOINT}/${levelInfo.thumbnail}`}
              alt={levelInfo.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
        </div>

        <div className="space-y-4">
          <Button onClick={handleStartGameplay} variant="default" className="w-full">
            Start Gameplay
          </Button>
        </div>
      </div>
    </div>
  );
}
