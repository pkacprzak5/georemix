import { useEffect, useState } from "react";
import { ButtonLarge } from "@/components/ui/button";
import { useDataSourceManager, useGameStateManager } from "@/context/game-state";
import { ApiError } from "@/context/game-state/DataSourceManager";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import StylisedSpan from "@/components/ui/stylised-span";
import { InputButton } from "@/components/ui/input-button";
import { BookText, Trophy } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function WelcomePage() {
  const gameStateManager = useGameStateManager();
  const dataSourceManager = useDataSourceManager();
  const { navigateTo } = useNavigation();
  const [playerName, setPlayerName] = useState("");
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [existingPlayerName, setExistingPlayerName] = useState<string | null>(null);

  useEffect(() => {
    gameStateManager.resetAll();
  }, [gameStateManager]);

  useEffect(() => {
    if (nameError) {
      setNameError(null);
    }
  }, [playerName]);

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
    setExistingPlayerName(null);

    try {
      const isAvailable = await dataSourceManager.checkUsernameAvailability(trimmedName);
      console.log("avialable", isAvailable)

      if (!isAvailable) {
        setExistingPlayerName(trimmedName);
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

  const handleConfirmExistingPlayer = () => {
    const trimmedName = existingPlayerName ?? playerName.trim();
    if (!trimmedName) {
      return;
    }

    gameStateManager.setPlayerName(trimmedName);
    setExistingPlayerName(null);
    setNameError(null);
    navigateTo(moduleIdMap.INTRO, "stage-picker");
  };

  const handleRejectExistingPlayer = () => {
    setExistingPlayerName(null);
    setNameError("Wybierz inna nazwe gracza, aby utworzyc nowy profil.");
  };

  return (
    <div className="flex items-center justify-center min-h-full px-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="leading-normal">
            Witaj w <StylisedSpan showStars>GeoRemix</StylisedSpan>
          </h1>
          <p className="leading-snug mx-auto w-full md:mt-[50px] md:mb-[60px] sm:mt-12 my-5 sm:mb-10 2xl:text-3xl xl:text-2xl lg:text-2xl xl:w-full lg:w-2/3 md:w-full md:text-2xl sm:text-xl text-xl">
            Od futurystycznych metropolii po fantastyczne krainy - sprawdz czy potrafisz rozpoznac
            znajome miejsca w nowej odslonie!
          </p>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <InputButton
            placeholder="Podaj nazwe gracza"
            value={playerName}
            onChange={setPlayerName}
            onSubmit={handleStartGame}
            className="w-full"
            disabled={nameError !== null}
          />

          <AlertDialog open={!isCheckingName && existingPlayerName !== null}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Wykorzystana nazwa</AlertDialogTitle>
                <AlertDialogDescription>
                  Nazwa <span className="font-heading uppercase">{existingPlayerName}</span> jest
                  juz aktywna. Kontynuuj jako ten gracz, aby nadpisac jego aktualne wyniki, lub
                  wybierz inna nazwe.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleRejectExistingPlayer}>Wybierz inna nazwe</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmExistingPlayer}>Kontynuuj jako {existingPlayerName}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {!isCheckingName && !existingPlayerName && nameError && (
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
