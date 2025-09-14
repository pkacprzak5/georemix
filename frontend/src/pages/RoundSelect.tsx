import { useNavigation } from "@/lib/navigation-system/NavigationProvider";
import { useGameStateManager } from "@/context/game-state";
import { GroupName } from "@/lib/navigation-system/types";
import { Button } from "@/components/ui/button";

export function RoundSelect() {
  const { navigateTo } = useNavigation();
  const gameStateManager = useGameStateManager();

  const handleRoundSelect = (roundIndex: number) => {
    gameStateManager.selectedRound = roundIndex;
    navigateTo(GroupName.MAIN_MENU, "home");
  };

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Select Round</h1>
          <p className="text-muted-foreground">Choose your challenge</p>
        </div>

        <div className="space-y-4">
          <Button onClick={() => handleRoundSelect(0)} variant="default" className="w-full">
            Round 1: Cyberpunk City
          </Button>

          <Button onClick={() => handleRoundSelect(1)} variant="default" className="w-full">
            Round 2: Coming Soon
          </Button>

          <Button onClick={() => handleRoundSelect(2)} variant="default" className="w-full">
            Round 3: Coming Soon
          </Button>
        </div>
      </div>
    </div>
  );
}
