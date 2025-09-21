import { useEffect, useState } from "react";
import { ButtonLarge } from "@/components/ui/button";
import { useGameStateManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import StylisedSpan from "@/components/ui/stylised-span";
import { InputButton } from "@/components/ui/input-button";
import { BookText } from "lucide-react";

export function WelcomePage() {
  const gameStateManager = useGameStateManager();
  const { navigateTo } = useNavigation();
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    gameStateManager.resetAll();
  }, []);

  const handleAbout = () => {
    navigateTo(moduleIdMap.INTRO, "about");
  };

  const handleStartGame = () => {
    if (playerName.trim()) {
      gameStateManager.setPlayerName(playerName.trim());
      navigateTo(moduleIdMap.INTRO, "stage-picker");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full px-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="leading-normal">
            Witaj w <StylisedSpan showStars>GeoRemix</StylisedSpan>
          </h1>
          <p className="leading-snug w-full md:mt-[50px] md:mb-[60px] sm:mt-12 my-5 sm:mb-10 2xl:text-3xl xl:text-2xl lg:text-2xl xl:w-full lg:w-2/3 md:w-full md:text-2xl sm:text-xl text-xl">
            Od futurystycznych metropolii po fantastyczne krainy - Spradź, czy potrafisz rozpoznać
            znajome miejsca w nowej odsłonie!
          </p>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <InputButton
            placeholder="Wprowadź nazwę gracza"
            value={playerName}
            onChange={setPlayerName}
            onSubmit={handleStartGame}
            className="w-full"
          />

          <ButtonLarge onClick={handleAbout}>
            O projekcie <BookText className="mt-1" />
          </ButtonLarge>
        </div>
      </div>
    </div>
  );
}
