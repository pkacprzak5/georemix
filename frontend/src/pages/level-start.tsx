import { useGameStateManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import { THUMBNAIL_ENDPOINT } from "@/constants";
import { ButtonLarge } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export function LevelStart() {
  const { navigateTo } = useNavigation();
  const gameStateManager = useGameStateManager();

  const handleStartGameplay = () => {
    navigateTo(moduleIdMap.GAMEPLAY, "gameplay");
  };

  const levelInfo = gameStateManager.currentLevelInfo;

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <div className="w-full max-w-2xl">
        {levelInfo.thumbnail && (
          <>
            <div className="relative">
              <div className="absolute -top-2 z-[100] -left-2 bg-secondary-background gradient border-2 border-border rounded-base px-4 py-2 shadow-shadow text-xl font-base">
                Runda {gameStateManager.currentRoundNumber}
              </div>
              <figure className="overflow-hidden rounded-base border-2 border-border bg-secondary-background font-base shadow-shadow transition-all">
                <div className="relative">
                  <img
                    className="w-full h-96 object-cover"
                    src={`${THUMBNAIL_ENDPOINT}/${levelInfo.thumbnail}`}
                    alt={levelInfo.name}
                  />
                  {/* Round number card overlay */}
                </div>
                <figcaption className="border-t-2 text-2xl gradient text-foreground border-border p-4 text-center">
                  {levelInfo.name}
                </figcaption>
              </figure>
            </div>
            <ButtonLarge className="mt-8" onClick={handleStartGameplay}>
              Rozpocznij Zgadywanie! <MapPin className="mt-1" />
            </ButtonLarge>
          </>
        )}
      </div>
    </div>
  );
}
