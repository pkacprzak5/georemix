import { useEffect } from "react";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { Button } from "@/components/ui/button";
import { moduleIdMap } from "@/lib/navigation-system/types";
import { useGameStateManager } from "@/context/game-state";

export function FinalResult() {
  const { navigateTo } = useNavigation();
  const gameStateManager = useGameStateManager();

  useEffect(() => {
    // TODO:  Using useEffect for things like that feels like a HUGE ANTIPATTERN.
    //        but idk how to do it better right now.
    gameStateManager.submitRoundResults();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-full gap-8">
      <h1 className="text-4xl font-bold mb-4">Thank you for playing</h1>
      <div className="text-center space-x-8">
        <Button onClick={() => navigateTo(moduleIdMap.INTRO, "welcome-page")}>Back to Home</Button>
        <Button onClick={() => navigateTo(moduleIdMap.INTRO, "leader-board")}>
          Go to Leaderboard
        </Button>
      </div>
    </div>
  );
}
