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
    <div className="flex items-center justify-center min-h-full p-4 3xl:p-6 4xl:p-8 5xl:p-10">
      <div className="w-full max-w-2xl 3xl:max-w-3xl 4xl:max-w-4xl 5xl:max-w-5xl">
        {levelInfo.thumbnail && (
          <>
            <div className="relative">
              <div className="absolute -top-2 z-[100] -left-2 bg-secondary-background gradient border-2 border-border rounded-base px-4 py-2 3xl:px-5 3xl:py-3 4xl:px-6 4xl:py-3 shadow-shadow text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl font-base">
                Runda {gameStateManager.currentLevelInfo.number}
              </div>
              <figure className="overflow-hidden rounded-base border-2 border-border bg-secondary-background font-base shadow-shadow transition-all">
                <div className="relative">
                  <img
                    className="w-full h-96 3xl:h-[28rem] 4xl:h-[32rem] 5xl:h-[40rem] object-cover"
                    src={`${THUMBNAIL_ENDPOINT}/${levelInfo.thumbnail}`}
                    alt={levelInfo.name}
                  />
                  {/* Round number card overlay */}
                </div>
                <figcaption className="border-t-2 text-2xl 3xl:text-3xl 4xl:text-4xl 5xl:text-5xl gradient text-foreground border-border p-4 3xl:p-5 4xl:p-6 5xl:p-8 text-center">
                  {levelInfo.name}
                </figcaption>
              </figure>
            </div>
            <ButtonLarge className="mt-8 3xl:mt-10 4xl:mt-12 5xl:mt-16 3xl:text-3xl 3xl:py-5 4xl:text-4xl 4xl:py-6" onClick={handleStartGameplay}>
              Rozpocznij Zgadywanie! <MapPin className="mt-1 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7 5xl:w-8 5xl:h-8" />
            </ButtonLarge>
          </>
        )}
      </div>
    </div>
  );
}
