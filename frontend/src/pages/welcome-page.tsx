import { useEffect, useState } from "react";
import { Button, ButtonLarge } from "@/components/ui/button";
import { useDataSourceManager, useGameStateManager } from "@/context/game-state";
import { ApiError } from "@/context/game-state/DataSourceManager";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import StylisedSpan from "@/components/ui/stylised-span";
import { InputButton } from "@/components/ui/input-button";
import { BookText, Trophy } from "lucide-react";
import { GlobeLogo } from "@/components/ui/globe-logo";
import { Window, WindowContent } from "@/components/layout/window";
import { useResizableWindow } from "@/hooks/use-resizable-window";

const WINDOW_WIDTH_MINIMIZED = 400;
const WINDOW_HEIGHT_MINIMIZED = 200;
const WINDOW_WIDTH_MAXIMIZED_RATIO = 0.3;
const WINDOW_HEIGHT_MAXIMIZED_RATIO = 0.3;

const WINDOW_CLOSE_TIMEOUT = 300;

export function WelcomePage() {
  const gameStateManager = useGameStateManager();
  const dataSourceManager = useDataSourceManager();
  const { navigateTo } = useNavigation();
  const [playerName, setPlayerName] = useState("");
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [existingPlayerName, setExistingPlayerName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    position,
    setPosition,
    isVisible,
    style,
    windowClass,
    handleMaximize,
    handleMinimize,
    handleClose,
    handleOpen,
  } = useResizableWindow({
    minimizedSize: {
      width: WINDOW_WIDTH_MINIMIZED,
      height: WINDOW_HEIGHT_MINIMIZED,
    },
    maximizedRatio: {
      width: WINDOW_WIDTH_MAXIMIZED_RATIO,
      height: WINDOW_HEIGHT_MAXIMIZED_RATIO,
    },
    initialVisibility: true,
    initialOpened: false,
    initialPosition: {
      x: window.innerWidth / 2 - WINDOW_WIDTH_MINIMIZED / 2,
      y: window.innerHeight / 2 - WINDOW_HEIGHT_MINIMIZED / 2,
    },
  });

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
    setErrorMessage(null);

    try {
      const isAvailable = await dataSourceManager.checkUsernameAvailability(trimmedName);

      if (!isAvailable) {
        setExistingPlayerName(trimmedName);
        handleOpen();
        return;
      }

      await dataSourceManager.createPlayer(trimmedName);
      gameStateManager.setPlayerName(trimmedName);
      navigateTo(moduleIdMap.INTRO, "stage-picker");
    } catch (error) {
      const defaultMessage =
        "Nie udało się zweryfikować nazwy gracza. Daj nam moment i spróbuj ponownie później.";
      let message: string | null = defaultMessage;

      if (error instanceof ApiError) {
        if (error.status === 409) {
          message = null;
        } else if (error.status >= 500) {
          message = "Serwer chwilowo nie odpowiada. Daj nam moment i spróbuj ponownie później.";
        }
      }

      setErrorMessage(message);
      handleOpen();
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
    navigateTo(moduleIdMap.INTRO, "stage-picker");
  };

  const handleRejectExistingPlayer = () => {
    handleClose();
    setExistingPlayerName(null);
  };

  const handleCloseError = () => {
    handleClose();
    setTimeout(() => {
      setErrorMessage(null);
    }, WINDOW_CLOSE_TIMEOUT);
  };

  return (
    <div className="flex items-center justify-center h-full w-full px-4">
      <div className="w-full max-w-4xl 3xl:max-w-5xl 4xl:max-w-6xl 5xl:max-w-7xl space-y-8 3xl:space-y-10 4xl:space-y-12">
        <div className="text-center mb-10 3xl:mb-12 4xl:mb-16">
          <div className="flex justify-center mb-4 3xl:mb-6 4xl:mb-8">
            <div className="w-1/3 aspect-square max-w-sm 3xl:max-w-md 4xl:max-w-lg 5xl:max-w-2xl">
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

        <div className="space-y-4 3xl:space-y-5 4xl:space-y-6 max-w-md 2xl:max-w-xl 4xl:max-w-xl 5xl:max-w-2xl mx-auto">
          <InputButton
            placeholder="Wprowadź nazwę gracza"
            value={playerName}
            onChange={setPlayerName}
            onSubmit={handleStartGame}
            className="w-full 3xl:text-xl 4xl:text-2xl 5xl:text-2xl"
            disabled={nameError !== null}
          />

          {isVisible && (
            <Window
              disableMaximize
              disableMinimize
              title="alert.exe"
              position={position}
              setPosition={setPosition}
              className={windowClass}
              style={style}
              onMaximize={handleMaximize}
              onMinimize={handleMinimize}
              onClose={errorMessage ? handleCloseError : handleRejectExistingPlayer}>
              <WindowContent className="w-full h-full relative p-4">
                <div className="flex flex-col justify-between h-full">
                  {errorMessage ? (
                    <>
                      <span>{errorMessage}</span>
                      <div className="flex justify-center mt-4">
                        <Button onClick={handleCloseError} className="bg-main text-foreground">
                          Zamknij
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>
                        Nazwa <span className="font-heading">{existingPlayerName}</span>
                        jest już aktywna. Kontynuując nadpiszesz aktualne wyniki tego gracza.
                      </span>
                      <div className="flex flex-wrap justify-around mt-4 gap-4">
                        <Button
                          onClick={handleRejectExistingPlayer}
                          className="bg-secondary-background text-foreground">
                          Wybierz inną nazwę
                        </Button>
                        <Button
                          onClick={handleConfirmExistingPlayer}
                          className="bg-main text-foreground">
                          Kontynuuj jako
                          <span className="font-heading">{existingPlayerName}</span>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </WindowContent>
            </Window>
          )}

          <ButtonLarge
            onClick={handleShowLeaderboard}
            className="bg-secondary-background text-foreground 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl 3xl:py-6 4xl:py-7 5xl:py-8">
            Zobacz ranking <Trophy className="mt-1 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10" />
          </ButtonLarge>

          <ButtonLarge onClick={handleAbout} className="3xl:text-2xl 4xl:text-3xl 5xl:text-4xl 3xl:py-6 4xl:py-7 5xl:py-8">
            O projekcie <BookText className="mt-1 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10" />
          </ButtonLarge>
        </div>
      </div>
    </div>
  );
}
