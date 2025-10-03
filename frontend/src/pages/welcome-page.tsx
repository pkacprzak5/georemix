import { useEffect, useState } from "react";
import { ButtonLarge } from "@/components/ui/button";
import { useGameStateManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import StylisedSpan from "@/components/ui/stylised-span";
import { InputButton } from "@/components/ui/input-button";
import { BookText } from "lucide-react";
import { GlobeLogo } from "@/components/ui/globe-logo";

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
    <div className="flex items-center justify-center h-full w-full px-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-1/3 aspect-square max-w-sm">
              <GlobeLogo />
            </div>
          </div>
          <h1 className="leading-normal mb-4">
            Witaj w <StylisedSpan showStars>GeoRemix!</StylisedSpan>
          </h1>
          {/* <p className="leading-snug mx-auto my-0 w-full 2xl:text-lg xl:text-lg lg:text-lg xl:w-full lg:w-2/3 md:w-full md:text-2xl sm:text-xl text-xl">
            Od futurystycznych metropolii po fantastyczne krainy - Spradź, czy potrafisz rozpoznać
            znajome miejsca w nowej odsłonie!
          </p> */}
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
