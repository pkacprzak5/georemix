import { useEffect, useState } from "react";
import { ButtonLarge } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGameStateManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import StylisedSpan from "@/components/ui/stylised-span";
import { Map, MapPin, Clock } from "lucide-react";

const COUNT_UP_DURATION = 2500;

// Custom hook for counter animation
const useCountUp = (target: number, duration: number = 5000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      return;
    }

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      // const easeOut = Math.sqrt(1 - (Math.pow(1 - progress, 4)));
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(3, -10 * progress);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
};

export function LevelSummary() {
  const { navigateTo } = useNavigation();
  const gameStateManager = useGameStateManager();
  const [resultData, setResultData] = useState<{
    distance: number;
    timeTaken: number;
    score: number;
    maxScore: number;
  } | null>(null);

  useEffect(() => {
    try {
      const levelResult = gameStateManager.levelResult;
      const maxScore = 5000; // Max score per level

      setResultData({
        distance: levelResult.distance,
        timeTaken: levelResult.timeTaken,
        score: levelResult.score,
        maxScore: maxScore,
      });
    } catch (error) {
      console.error("Error loading result data:", error);
      // Fallback to mock data
      setResultData({
        distance: 1230,
        timeTaken: 45,
        score: 3770,
        maxScore: 5000,
      });
    }
  }, [gameStateManager]);

  const handleViewMap = () => {
    navigateTo(moduleIdMap.LEVEL_END, "level-map");
  };

  // Animated counters
  const animatedScore = useCountUp(resultData?.score || 0, COUNT_UP_DURATION);
  const animatedDistance = useCountUp(resultData?.distance || 0, COUNT_UP_DURATION);
  const animatedTime = useCountUp(resultData?.timeTaken || 0, COUNT_UP_DURATION);

  if (!resultData) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-lg">Loading results...</div>
      </div>
    );
  }

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(1)} km`;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreRating = (score: number) => {
    if (score >= 4500) {
      return "Trafiłeś w punkt!";
    }
    if (score >= 3500) {
      return "Niewiele brakowało!";
    }
    if (score >= 2500) {
      return "W połowie drogi!";
    }
    if (score >= 1500) {
      return "Niewiele brakowało!";
    }
    return "Będzie tylko lepiej!";
  };

  const scoreRating = getScoreRating(resultData.score);

  return (
    <div className="flex items-center justify-center min-h-full bg-background">
      <div className="w-full space-y-8 3xl:space-y-10 4xl:space-y-12 5xl:space-y-16 p-6 3xl:p-8 4xl:p-10 5xl:p-12 flex flex-col items-center justify-center">
        {/* Header */}

        <h1 className="leading-normal 3xl:text-[5em] 4xl:text-[5.8em] mb-10 whitespace-nowrap ">
          <StylisedSpan showStars>Ukończono Rundę!</StylisedSpan>
        </h1>

        <div className="max-w-4xl 3xl:max-w-5xl 4xl:max-w-6xl 5xl:max-w-7xl w-full flex flex-col items-center justify-center space-y-8 3xl:space-y-10 4xl:space-y-12">
          {/* Grid Layout - 3 columns */}
          <div className="grid grid-cols-3 grid-rows-2 gap-6 3xl:gap-8 4xl:gap-10 5xl:gap-12 w-full">
            {/* Combined Score and Progress Card - spans 2 columns, 2 rows */}
            <div className="col-span-2 row-span-2 relative">
              <Card className="absolute -top-3 z-[100] -left-8 bg-main py-2">
                <CardContent className="px-4">
                  <div className="text-md 2xl:text-lg 3xl:text-xl 4xl:text-2xl text-foreground dark:text-shadow font-base">
                    {scoreRating}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-secondary-background gradient h-full">
                <CardContent className="py-8 3xl:py-10 4xl:py-12 5xl:py-16 h-full flex flex-col justify-center">
                  {/* Main Score Section */}
                  <div className="text-center mb-6 3xl:mb-8 4xl:mb-10">
                    <div className="text-6xl 3xl:text-7xl 4xl:text-8xl 5xl:text-9xl font-bold text-background dark:text-foreground font-outline-1 mb-2 3xl:mb-3 4xl:mb-4">
                      {animatedScore}
                    </div>
                    <div className="text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-3xl text-muted-foreground mb-4">
                      WYNIK
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-4">
                    <Progress
                      value={(animatedScore / (resultData?.maxScore || 5000)) * 100}
                      className="h-4 3xl:h-6"
                    />
                    <div className="text-center mb-3">
                      <div className="text-xl 3xl:text-2xl 4xl:text-3xl font-bold text-foreground dark:text-foreground mt-2 3xl:mt-3 4xl:mt-4">
                        {animatedScore} / {resultData?.maxScore || 5000} punktów
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distance Card - spans 1 column, 1 row (1x1) */}
            <Card className="bg-secondary-background gradient">
              <CardContent className="text-center flex items-center justify-center flex-col h-full py-1 3xl:py-2 4xl:py-3">
                <MapPin
                  className="mx-auto mb-4 3xl:mb-5 4xl:mb-6 text-main 3xl:w-12 3xl:h-12 4xl:w-16 4xl:h-16 5xl:w-20 5xl:h-20"
                  size={36}
                />
                <div className="text-4xl 3xl:text-5xl 4xl:text-6xl 5xl:text-7xl font-bold text-background dark:text-foreground font-outline-1 mb-1 3xl:mb-2 4xl:mb-3 whitespace-nowrap">
                  {formatDistance(animatedDistance)}
                </div>
                <div className="text-xs 3xl:text-sm 4xl:text-base 5xl:text-lg text-muted-foreground">DYSTANS</div>
              </CardContent>
            </Card>

            {/* Time Card - spans 1 column, 1 row (1x1) */}
            <Card className="bg-secondary-background gradient">
              <CardContent className="text-center flex items-center justify-center flex-col h-full py-1 3xl:py-2 4xl:py-3">
                <Clock
                  className="mx-auto mb-4 3xl:mb-5 4xl:mb-6 text-main 3xl:w-12 3xl:h-12 4xl:w-16 4xl:h-16 5xl:w-20 5xl:h-20"
                  size={36}
                />
                <div className="text-4xl 3xl:text-5xl 4xl:text-6xl 5xl:text-7xl font-bold text-background dark:text-foreground font-outline-1 mb-1 3xl:mb-2 4xl:mb-3">
                  {formatTime(animatedTime)}
                </div>
                <div className="text-xs 3xl:text-sm 4xl:text-base 5xl:text-lg text-muted-foreground">CZAS</div>
              </CardContent>
            </Card>
          </div>
          {/* Navigation Buttons */}
          <div className="space-y-4 w-full">
            <ButtonLarge onClick={handleViewMap} className="w-full 3xl:text-3xl 3xl:py-5 4xl:text-4xl 4xl:py-6">
              Pokaż na mapie <Map className="w-6 h-6 3xl:w-7 3xl:h-7 4xl:w-10 4xl:h-10 mt-1 3xl:mt-2" />
            </ButtonLarge>
          </div>
        </div>
      </div>
    </div>
  );
}
