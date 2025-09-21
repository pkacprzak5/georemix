import { ButtonLarge } from "@/components/ui/button";
import { useGameStateManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";

export function StagePicker() {
  const { navigateWithLoading } = useNavigation();
  const gameStateManager = useGameStateManager();

  const handleRoundSelect = (roundIndex: number) => {
    const promise = gameStateManager.loadRound(roundIndex);
    navigateWithLoading(moduleIdMap.LEVEL_START, "level-start", promise);
  };

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-10">
          <ButtonLarge onClick={() => handleRoundSelect(1)} className="w-full">
            Rozgrywka 1
          </ButtonLarge>

          <ButtonLarge disabled onClick={() => handleRoundSelect(2)} className="w-full">
            Rozgrywka 2: Dostępna wkrótce
          </ButtonLarge>

          <ButtonLarge disabled onClick={() => handleRoundSelect(3)} className="w-full">
            Rozgrywka 3: Dostępna wkrótce
          </ButtonLarge>
        </div>
      </div>
    </div>
  );
}
