import { useEffect, useState } from "react";
import { ButtonLarge } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGameStateManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import StylisedSpan from "@/components/ui/stylised-span";
import { Map } from "lucide-react";

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
  } | null>(null);

  useEffect(() => {
    try {
      const levelResult = gameStateManager.levelResult;

      setResultData({
        distance: levelResult.distance,
        timeTaken: levelResult.timeTaken,
        score: levelResult.score,
      });
    } catch (error) {
      console.error("Error loading result data:", error);
      // Fallback to mock data
      setResultData({
        distance: 1230,
        timeTaken: 45,
        score: 3770,
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

        <div className="max-w-lg 3xl:max-w-xl 4xl:max-w-2xl 5xl:max-w-3xl w-full flex flex-col items-center justify-center space-y-8 3xl:space-y-10 4xl:space-y-12">
          {/* Results Stats */}
          <div className="space-y-6 3xl:space-y-7 4xl:space-y-8 5xl:space-y-10 w-full">
            <div className="relative">
              <Card className="absolute -top-3 z-[100] -left-8 bg-main py-2 3xl:py-3 4xl:py-3">
                <CardContent className="px-4 3xl:px-5 4xl:px-6">
                  <div className="text-md 2xl:text-lg 3xl:text-xl 4xl:text-2xl text-foreground dark:text-shadow font-base">
                    {scoreRating}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-secondary-background gradient">
                <CardContent className="text-center">
                  <div className="text-6xl 3xl:text-7xl 4xl:text-8xl 5xl:text-9xl font-bold text-background dark:text-foreground font-outline-1 mb-2 3xl:mb-3 4xl:mb-4">
                    {animatedScore}
                  </div>
                  <div className="text-sm 3xl:text-base 4xl:text-lg 5xl:text-xl text-muted-foreground">WYNIK</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-2 gap-4 3xl:gap-5 4xl:gap-6 5xl:gap-8 w-full">
              <Card className="bg-secondary-background gradient">
                <CardContent className="text-center">
                  <div className="text-4xl 3xl:text-5xl 4xl:text-6xl 5xl:text-7xl font-bold text-background dark:text-foreground font-outline-1 mb-1 3xl:mb-2 4xl:mb-3 whitespace-nowrap">
                    {formatDistance(animatedDistance)}
                  </div>
                  <div className="text-xs 3xl:text-sm 4xl:text-base 5xl:text-lg text-muted-foreground">DYSTANS</div>
                </CardContent>
              </Card>
              <Card className="bg-secondary-background gradient">
                <CardContent className="text-center">
                  <div className="text-4xl 3xl:text-5xl 4xl:text-6xl 5xl:text-7xl font-bold text-background dark:text-foreground font-outline-1 mb-1 3xl:mb-2 4xl:mb-3">
                    {formatTime(animatedTime)}
                  </div>
                  <div className="text-xs 3xl:text-sm 4xl:text-base 5xl:text-lg text-muted-foreground">CZAS</div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Navigation Buttons */}
          <div className="space-y-4 w-full">
            <ButtonLarge onClick={handleViewMap} className="w-full 3xl:text-3xl 3xl:py-5 4xl:text-4xl 4xl:py-6">
              Pokaż na mapie <Map className="3xl:text-3xl 3xl:py-5 4xl:text-4xl 4xl:py-6" />
            </ButtonLarge>
          </div>
        </div>
      </div>
    </div>
  );
}
