import { useEffect, useState } from "react";
import { Button, ButtonLarge } from "@/components/ui/button";
import { useDataSourceManager, useGameStateManager } from "@/context";
import { ApiError } from "@/context/DataSourceManager";
import { useNavigation } from "@/lib/navigation/navigation-provider";
import { moduleIdMap } from "@/types/navigation";
import StylisedSpan from "@/components/ui/stylised-span";
import { InputButton } from "@/components/ui/input-button";
import { BookText, Trophy } from "lucide-react";
import { GlobeLogo } from "@/components/ui/globe-logo";
import { Window, WindowContent } from "@/components/ui/window";
import { useResizableWindow } from "@/hooks/use-resizable-window";

const WINDOW_CLOSE_TIMEOUT = 300;

// Function to get responsive window size based on viewport
const getWindowSize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Check for short screen first
  if (height <= 960) {
    return { width: 400, height: 200 };
  }
  
  // Check breakpoints (112rem = 1792px, 128rem = 2048px)
  if (width >= 2048) { // 4xl
    return { width: 550, height: 280 };
  } else if (width >= 1792) { // 3xl
    return { width: 480, height: 240 };
  }
  
  return { width: 400, height: 200 };
};

export function WelcomePage() {
  const gameStateManager = useGameStateManager();
  const dataSourceManager = useDataSourceManager();
  const { navigateTo } = useNavigation();
  const [windowSize, setWindowSize] = useState(getWindowSize());
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
      width: windowSize.width,
      height: windowSize.height,
    },
    maximizedRatio: {
      width: 0.3,
      height: 0.3,
    },
    initialVisibility: true,
    initialOpened: false,
    initialPosition: {
      x: window.innerWidth / 2 - windowSize.width / 2,
      y: window.innerHeight / 2 - windowSize.height / 2,
    },
  });

  // Update window size on viewport changes
  useEffect(() => {
    const handleResize = () => {
      setWindowSize(getWindowSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <div className="text-center mb-10 3xl:mb-12 4xl:mb-16 ">
          <div className="flex justify-center mb-4 3xl:mb-6 4xl:mb-8 ">
            <div className="w-[40%] short-screen-5xl:[w-15%] short-screen-4xl:w-[20%] short-screen-3xl:w-[25%] 4xl:w-[30%] aspect-square max-w-sm 3xl:max-w-xl 4xl:max-w-lg max-h-[960px]:max-w-sm">
              <GlobeLogo />
            </div>
          </div>
          <h1 className="leading-normal 3xl:text-[5em] 4xl:text-[5.8em] mb-4 whitespace-nowrap">
            Witaj w <StylisedSpan showStars>GeoRemix!</StylisedSpan>
          </h1>
          {/* <p className="leading-snug mx-auto my-0 w-full 2xl:text-lg xl:text-lg lg:text-lg xl:w-full lg:w-2/3 md:w-full md:text-2xl sm:text-xl text-xl">
            Od futurystycznych metropolii po fantastyczne krainy - Spradź, czy potrafisz rozpoznać
            znajome miejsca w nowej odsłonie!
          </p> */}
        </div>

        <div className="space-y-4 3xl:space-y-5 4xl:spacey-6 max-w-md xl:max-w-lg 3xl:max-w-3xl 4xl:max-w-4xl mx-auto">
          <InputButton
            placeholder="Wprowadź nazwę gracza"
            value={playerName}
            onChange={setPlayerName}
            onSubmit={handleStartGame}
            className="w-full 2xl:text-2xl"
            disabled={nameError !== null || isCheckingName || !!existingPlayerName}
          />

          <ButtonLarge
            onClick={handleShowLeaderboard}
            className="bg-secondary-background text-foreground 3xl:text-3xl 3xl:py-5 4xl:text-4xl 4xl:py-6">
            Zobacz ranking{" "}
            <Trophy className=" w-6 h-6 3xl:w-7 3xl:h-7 4xl:w-10 4xl:h-10 mt-1 3xl:mt-2" />
          </ButtonLarge>

          <ButtonLarge
            onClick={handleAbout}
            className=" 3xl:text-3xl 3xl:py-5 4xl:text-4xl 4xl:py-6">
            O projekcie{" "}
            <BookText className=" w-6 h-6 3xl:w-7 3xl:h-7 4xl:w-10 4xl:h-10 mt-1 3xl:mt-2" />
          </ButtonLarge>
        </div>
      </div>
      {isVisible && (
        <Window
          disableMaximize
          disableMinimize
          isTitleResponsive
          title="Alert.exe"
          position={position}
          setPosition={setPosition}
          className={windowClass}
          style={style}
          onMaximize={handleMaximize}
          onMinimize={handleMinimize}
          onClose={errorMessage ? handleCloseError : handleRejectExistingPlayer}>
          <WindowContent className="w-full h-full relative p-4 3xl:p-6 4xl:p-8 short-screen:p-4">
            <div className="flex flex-col justify-between h-full">
              {errorMessage ? (
                <>
                  <span className="text-base 3xl:text-lg 4xl:text-xl short-screen:text-base">{errorMessage}</span>
                  <div className="flex justify-center mt-4 3xl:mt-5 4xl:mt-6 short-screen:mt-4">
                    <Button onClick={handleCloseError} className="bg-main text-foreground 3xl:text-lg 3xl:px-6 3xl:py-3 4xl:text-xl 4xl:px-8 4xl:py-4 short-screen:text-base short-screen:px-4 short-screen:py-2">
                      Zamknij
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-lg 3xl:text-xl 4xl:text-2xl short-screen:text-lg leading-tight text-center">
                    Nazwa <span className="font-heading">{existingPlayerName} </span>
                    jest już aktywna. Kontynuując nadpiszesz aktualne wyniki tego gracza.
                  </span>
                  <div className="flex justify-center items-center mt-2 3xl:mt-3 4xl:mt-4 short-screen:mt-2 gap-2 3xl:gap-3 4xl:gap-4 short-screen:gap-2">
                    <Button
                      onClick={handleRejectExistingPlayer}
                      className="bg-secondary-background text-foreground text-md 3xl:text-lg 4xl:text-xl short-screen:text-md px-3 py-5 3xl:px-4 3xl:py-6 4xl:px-5 4xl:py-7 short-screen:px-3 short-screen:py-2 flex items-center justify-center">
                      Wybierz inną nazwę
                    </Button>
                    <Button
                      onClick={handleConfirmExistingPlayer}
                      className="bg-main text-foreground text-md 3xl:text-lg 4xl:text-xl short-screen:text-md px-3 py-2 3xl:px-4 3xl:py-5 4xl:px-6 4xl:py-7 short-screen:px-3 short-screen:py-2 whitespace-nowrap">
                      Kontynuuj jako <span className="font-bold">{existingPlayerName}</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </WindowContent>
        </Window>
      )}
    </div>
  );
}
