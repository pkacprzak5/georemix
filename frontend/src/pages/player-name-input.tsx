import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameStateManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";

export function PlayerNameInput() {
  const gameStateManager = useGameStateManager();
  const { navigateTo } = useNavigation();
  const [playerName, setPlayerName] = useState("");

  const handleSubmit = () => {
    if (playerName.trim()) {
      gameStateManager.setPlayerName(playerName.trim());
      navigateTo(moduleIdMap.INTRO, "stage-picker");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const isButtonDisabled = !playerName.trim();

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Enter Your Name</h1>
          <p className="text-muted-foreground">Please enter your name to continue</p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full"
            autoFocus
          />

          <Button onClick={handleSubmit} disabled={isButtonDisabled} className="w-full">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
