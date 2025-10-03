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
    <div className="flex items-center justify-center h-full w-full px-4 3xl:px-6 4xl:px-8 6xl:px-12">
      <div className="w-full max-w-4xl 3xl:max-w-5xl 4xl:max-w-6xl 6xl:max-w-7xl 8xl:max-w-8xl space-y-8 3xl:space-y-10 4xl:space-y-12 6xl:space-y-14 8xl:space-y-16 scale-100 3xl:scale-110 4xl:scale-125 6xl:scale-140 8xl:scale-150 origin-center">
        <div className="text-center mb-10 3xl:mb-12 4xl:mb-14 6xl:mb-16 8xl:mb-20">
          <div className="flex justify-center mb-4 3xl:mb-5 4xl:mb-6 6xl:mb-7 8xl:mb-8">
            <div className="w-1/3 aspect-square max-w-sm 3xl:max-w-[22rem] 4xl:max-w-md 6xl:max-w-[26rem] 8xl:max-w-lg">
              <GlobeLogo />
            </div>
          </div>
          <h1 className="leading-normal mb-4 3xl:mb-5 4xl:mb-6 6xl:mb-7 8xl:mb-8">
            Witaj w <StylisedSpan showStars>GeoRemix!</StylisedSpan>
          </h1>
          {/* <p className="leading-snug mx-auto my-0 w-full 2xl:text-lg xl:text-lg lg:text-lg xl:w-full lg:w-2/3 md:w-full md:text-2xl sm:text-xl text-xl">
            Od futurystycznych metropolii po fantastyczne krainy - Spradź, czy potrafisz rozpoznać
            znajome miejsca w nowej odsłonie!
          </p> */}
        </div>

        <div className="space-y-4 3xl:space-y-5 4xl:space-y-6 6xl:space-y-7 8xl:space-y-8 max-w-md 3xl:max-w-[26rem] 4xl:max-w-lg 6xl:max-w-[30rem] 8xl:max-w-xl mx-auto">
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
