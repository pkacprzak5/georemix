import { Button } from "@/components/ui/button";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import { useGameStateManager } from "@/context/game-state";

type PauseMenuProps = {
  onUnpause: () => void;
};

export function PauseMenu({ onUnpause }: PauseMenuProps) {
  const { navigateTo } = useNavigation();
  const gameStateManager = useGameStateManager();

  const handleLeaveGame = () => {
    gameStateManager.resetAll();
    navigateTo(moduleIdMap.INTRO, "player-name-input");
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-background/95">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Game Paused</h2>
          <p className="text-muted-foreground mb-6">
            The game has been paused. Choose an option below to continue.
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={onUnpause} className="w-full">
            Resume Game
          </Button>

          <div className="space-y-2">
            <Button onClick={handleLeaveGame} className="w-full">
              Leave Game
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              ⚠️ Warning: All progress will be reset
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}