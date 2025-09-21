import { ButtonLarge } from "@/components/ui/button";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import { useEventBridge } from "@/context/game-state";
import { TriangleAlert } from "lucide-react";

export function PauseMenu() {
  const eventBridge = useEventBridge();
  const { navigateTo } = useNavigation();

  const handleLeaveGame = () => {
    navigateTo(moduleIdMap.INTRO, "welcome-page");
  };

  const onUnpause = () => {
    eventBridge.emit("gameUnpaused", {});
  };

  return (
    <div className="flex items-center justify-center min-h-full px-4">
      <div className="w-full max-w-3xl space-y-8 flex items-center justify-center flex-col">
        <div className="text-center">
          <h1 className="leading-normal">Gra zatrzymana</h1>
          {/* <p className="text-muted-foreground mb-6">
            Gra została zatrzymana.
          </p> */}
        </div>

        <div className="space-y-4 max-w-lg">
          <ButtonLarge onClick={onUnpause} className="w-full">
            Wróć do Gry
          </ButtonLarge>

          <div className="space-y-2 ">
            <ButtonLarge onClick={handleLeaveGame} className="w-full">
              Wyjdź do Menu
            </ButtonLarge>
            <div className="text-lg text-muted-foreground text-center flex items-center justify-between mt-8">
              <TriangleAlert size={52} className="mr-8"/>{" "}
              <p>Uwaga! Po powrocie do Głównego Menu wszystkie postępy zostaną utracone!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
