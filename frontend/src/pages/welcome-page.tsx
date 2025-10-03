import { useEffect, useState } from "react";
import { ButtonLarge } from "@/components/ui/button";
import { useDataSourceManager, useGameStateManager } from "@/context/game-state";
import { ApiError } from "@/context/game-state/DataSourceManager";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import StylisedSpan from "@/components/ui/stylised-span";
import { InputButton } from "@/components/ui/input-button";
import { BookText, Trophy } from "lucide-react";
import { GlobeLogo } from "@/components/ui/globe-logo";

export function WelcomePage() {
  const gameStateManager = useGameStateManager();
  const dataSourceManager = useDataSourceManager();
  const { navigateTo } = useNavigation();
  const [playerName, setPlayerName] = useState("");
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    gameStateManager.resetAll();
  }, [gameStateManager]);

  const handleAbout = () => {
    navigateTo(moduleIdMap.INTRO, "about");
  };

  const handleStartGame = async () => {
    const trimmedName = playerName.trim();
    if (!trimmedName || isCheckingName) {
      return;
    }

    setIsCheckingName(true);
    setNameError(null);

    try {
      const isAvailable = await dataSourceManager.checkUsernameAvailability(trimmedName);
      console.log("avialable", isAvailable)

      if (!isAvailable) {
        // Automatically accept existing player name
        gameStateManager.setPlayerName(trimmedName);
        navigateTo(moduleIdMap.INTRO, "stage-picker");
        return;
      }

      await dataSourceManager.createPlayer(trimmedName);
      gameStateManager.setPlayerName(trimmedName);
      navigateTo(moduleIdMap.INTRO, "stage-picker");
    } catch (error) {
      const defaultMessage = "Nie udalo sie zweryfikowac nazwy gracza. Sprobuj ponownie.";
      if (error instanceof ApiError) {
        if (error.status === 409) {
          setNameError("Ktos wlasnie zajal te nazwe! Wpisz inna propozycje.");
        } else if (error.status >= 500) {
          setNameError("Serwer chwilowo nie odpowiada. Daj nam moment i sprobuj ponownie.");
        } else {
          setNameError(defaultMessage);
        }
      } else {
        setNameError(defaultMessage);
      }
    } finally {
      setIsCheckingName(false);
    }
  };

  const handleShowLeaderboard = () => {
    navigateTo(moduleIdMap.INTRO, "leader-board");
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
            placeholder="Podaj nazwe gracza"
            value={playerName}
            onChange={setPlayerName}
            onSubmit={handleStartGame}
            className="w-full"
          />

          {!isCheckingName && nameError && (
            <div className="min-h-[3rem] space-y-3">
              <div className="rounded-base border-2 border-border bg-secondary-background px-4 py-3 text-sm font-base text-red-600 shadow-shadow">
                {nameError}
              </div>
            </div>
          )}

          <ButtonLarge
            onClick={handleShowLeaderboard}
            className="bg-secondary-background text-foreground">
            Zobacz ranking <Trophy className="mt-1" />
          </ButtonLarge>

          <ButtonLarge onClick={handleAbout}>
            O projekcie <BookText className="mt-1" />
          </ButtonLarge>
        </div>
      </div>
    </div>
  );
}
