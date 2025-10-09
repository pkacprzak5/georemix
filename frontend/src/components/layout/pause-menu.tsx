import { ButtonLarge } from "@/components/ui/button";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import { useEventBridge, useGameStateManager } from "@/context/game-state";
import { TriangleAlert, Gamepad2, ArrowLeft } from "lucide-react";

export function PauseMenu() {
  const eventBridge = useEventBridge();
  const gameStateManager = useGameStateManager();
  const { navigateTo } = useNavigation();

  const handleLeaveGame = () => {
    navigateTo(moduleIdMap.INTRO, "welcome-page");
    eventBridge.emit("gameplayLeft", {});
    // Hacky but works
    setTimeout(() => {
      gameStateManager.resetAll();
    }, 1000);
  };

  const onUnpause = () => {
    eventBridge.emit("gameUnpaused", {});
  };

  return (
    <div className="flex items-center justify-center min-h-full px-4 3xl:px-6 4xl:px-8">
      <div className="w-full max-w-2xl 3xl:max-w-3xl 4xl:max-w-4xl space-y-10 3xl:space-y-12 4xl:space-y-14 flex items-center justify-center flex-col">
        {/* Title */}
        <div className="text-center">
          <h1 className="leading-normal text-4xl 3xl:text-5xl 4xl:text-6xl 5xl:text-7xl">Gra zatrzymana</h1>
        </div>

        {/* Buttons Section */}
        <div className="space-y-6 3xl:space-y-7 4xl:space-y-8 w-full max-w-xl 3xl:max-w-2xl 4xl:max-w-3xl">
          {/* Resume Button */}
          <ButtonLarge onClick={onUnpause} className="w-full">
            Wróć do Gry <Gamepad2 className="mt-1"/>
          </ButtonLarge>

          {/* Exit Section with Warning */}
          <div className="space-y-4 3xl:space-y-5 4xl:space-y-6">
            <ButtonLarge onClick={handleLeaveGame} className="w-full">
              <ArrowLeft className="mt-1"/>Wyjdź do Menu
            </ButtonLarge>
            
            {/* Warning Card */}
            <div className="bg-secondary-background gradient mt-10 border-2 border-destructive/20 rounded-lg p-4 3xl:p-5 4xl:p-6">
              <div className="flex items-start gap-4 3xl:gap-5 4xl:gap-6">
                <TriangleAlert 
                  size={40} 
                  className="text-destructive flex-shrink-0 mt-1 3xl:w-12 3xl:h-12 4xl:w-14 4xl:h-14" 
                />
                <p className="text-md 3xl:text-base 4xl:text-lg text-muted-foreground leading-relaxed">
                  <span className="font-bold text-destructive">Uwaga!</span> Po powrocie do Głównego Menu wszystkie postępy zostaną utracone!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
