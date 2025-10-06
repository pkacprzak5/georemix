import { useEffect, useState } from "react";
import { Clock, Map, ArrowLeft, MapPin } from "lucide-react";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { useGameStateManager } from "@/context/game-state";
import { ButtonLarge } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { moduleIdMap } from "@/lib/navigation-system/types";
import StylisedSpan from "@/components/ui/stylised-span";

const COUNT_UP_DURATION = 3000;

// Custom hook for counter animation
const useCountUp = (target: number, duration: number = 3000) => {
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

export function FinalResult() {
  const { navigateTo } = useNavigation();
  const gameStateManager = useGameStateManager();
  const [summaryData, setSummaryData] = useState<{
    totalScore: number;
    totalTime: number;
    maxPossibleScore: number;
    levelCount: number;
    averageScore: number;
    shortestDistance: number;
  } | null>(null);


  // Probably has to be moved
  useEffect(() => {
    try {
      // Calculate totals from all completed levels
      const maxPossibleScore = gameStateManager.maxScore;
      const allResults = gameStateManager.allLevelResults;

      let totalScore = 0;
      let totalTime = 0;
      let shortestDistance = Infinity;
      const completedLevels = allResults.length;

      // Calculate totals from all level results
      allResults.forEach((result) => {
        totalScore += result.score;
        totalTime += result.timeTaken;
        if (result.distance < shortestDistance) {
          shortestDistance = result.distance;
        }
      });

      // If no results, set shortestDistance to 0
      if (shortestDistance === Infinity) {
        shortestDistance = 0;
      }

      setSummaryData({
        totalScore,
        totalTime,
        maxPossibleScore,
        levelCount: completedLevels,
        averageScore: completedLevels > 0 ? Math.round(totalScore / completedLevels) : 0,
        shortestDistance,
      });
    } catch (error) {
      console.error("Error calculating final results:", error);
      // Fallback to mock data
      setSummaryData({
        totalScore: 18750,
        totalTime: 185,
        maxPossibleScore: 25000,
        levelCount: 5,
        averageScore: 3750,
        shortestDistance: 245,
      });
    }
  }, [gameStateManager]);

  const handlePlayAgain = () => {
    navigateTo(moduleIdMap.FINAL, "final-map");
  };

  const handleBackToMenu = () => {
    gameStateManager.resetAll();
    navigateTo(moduleIdMap.INTRO, "welcome-page");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(1)} km`;
    }
  };

  const getPerformanceRating = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) {
      return "Perfekcyjny wynik!";
    }
    if (percentage >= 80) {
      return "Doskonała gra!";
    }
    if (percentage >= 70) {
      return "Bardzo dobry wynik!";
    }
    if (percentage >= 60) {
      return "Dobra robota!";
    }
    if (percentage >= 50) {
      return "Niezły wynik!";
    }
    return "Będzie tylko lepiej!";
  };

  // Animated counters
  const animatedTotalScore = useCountUp(summaryData?.totalScore || 0, COUNT_UP_DURATION);
  const animatedTotalTime = useCountUp(summaryData?.totalTime || 0, COUNT_UP_DURATION);
  const animatedShortestDistance = useCountUp(
    summaryData?.shortestDistance || 0,
    COUNT_UP_DURATION
  );

  if (!summaryData) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-lg">Obliczanie wyników...</div>
      </div>
    );
  }

  const performanceRating = getPerformanceRating(
    summaryData.totalScore,
    summaryData.maxPossibleScore
  );

  return (
    <div className="flex items-center justify-center min-h-full bg-background">
      <div className="w-full space-y-8 3xl:space-y-10 4xl:space-y-12 5xl:space-y-16 p-6 3xl:p-8 4xl:p-10 5xl:p-12 flex flex-col items-center justify-center">
        {/* Header */}
        <h1 className="leading-normal text-center">
          <StylisedSpan showStars>Po bitwie opadł kurz!</StylisedSpan>
        </h1>

        <div className="max-w-4xl 3xl:max-w-5xl 4xl:max-w-6xl 5xl:max-w-7xl w-full flex flex-col items-center justify-center space-y-8 3xl:space-y-10 4xl:space-y-12">
          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-3 grid-rows-2 gap-6 3xl:gap-8 4xl:gap-10 5xl:gap-12 w-full">
            {/* Combined Score and Progress Card - spans 2 columns, 2 rows (2x2) */}
            <div className="col-span-2 row-span-2 relative">
              <Card className="absolute -top-3 z-[100] -left-8 bg-main py-2">
                <CardContent className="px-4">
                  <div className="text-md text-foreground dark:text-shadow font-base">
                    {performanceRating}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-secondary-background gradient h-full">
                <CardContent className="py-8 3xl:py-10 4xl:py-12 5xl:py-16 h-full flex flex-col justify-center">
                  {/* Main Score Section */}
                  <div className="text-center mb-6 3xl:mb-8 4xl:mb-10">
                    <div className="text-6xl 3xl:text-7xl 4xl:text-8xl 5xl:text-9xl font-bold text-background dark:text-foreground font-outline-1 mb-2 3xl:mb-3 4xl:mb-4">
                      {animatedTotalScore}
                    </div>
                    <div className="text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-3xl text-muted-foreground mb-4">CAŁKOWITY WYNIK</div>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-4">
                    <Progress
                      value={(animatedTotalScore / summaryData.maxPossibleScore) * 100}
                      className="h-6 3xl:h-8 4xl:h-10 5xl:h-12"
                    />
                    <div className="text-center mb-3">
                      <div className="text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl font-bold text-foreground dark:text-foreground mt-2 3xl:mt-3 4xl:mt-4">
                        {animatedTotalScore} / {summaryData.maxPossibleScore} punktów
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Total Time Card - spans 1 column, 1 row (1x1) */}
            <Card className="bg-secondary-background gradient">
              <CardContent className="text-center flex items-center justify-center flex-col h-full py-1 3xl:py-2 4xl:py-3">
                <Clock className="mx-auto mb-4 3xl:mb-5 4xl:mb-6 text-main 3xl:w-9 3xl:h-9 4xl:w-11 4xl:h-11 5xl:w-14 5xl:h-14" size={28} />
                <div className="text-4xl 3xl:text-5xl 4xl:text-6xl 5xl:text-7xl font-bold text-background dark:text-foreground font-outline-1 mb-1 3xl:mb-2 4xl:mb-3">
                  {formatTime(animatedTotalTime)}
                </div>
                <div className="text-xs 3xl:text-sm 4xl:text-base 5xl:text-lg text-muted-foreground">CAŁKOWITY CZAS</div>
              </CardContent>
            </Card>

            {/* Shortest Distance Card - spans 1 column, 1 row (1x1) */}
            <Card className="bg-secondary-background gradient">
              <CardContent className="text-center flex items-center justify-center flex-col h-full py-1 3xl:py-2 4xl:py-3">
                <MapPin className="mx-auto mb-4 3xl:mb-5 4xl:mb-6 text-main 3xl:w-9 3xl:h-9 4xl:w-11 4xl:h-11 5xl:w-14 5xl:h-14" size={28} />
                <div className="text-4xl 3xl:text-5xl 4xl:text-6xl 5xl:text-7xl font-bold text-background dark:text-foreground font-outline-1 mb-1 3xl:mb-2 4xl:mb-3">
                  {formatDistance(animatedShortestDistance)}
                </div>
                <div className="text-xs 3xl:text-sm 4xl:text-base 5xl:text-lg text-muted-foreground">NAJKRÓTSZY DYSTANS</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full ">
            <ButtonLarge onClick={handleBackToMenu} className="flex-1">
              <ArrowLeft className="mt-1" />
              Powrót do Menu
            </ButtonLarge>
            <ButtonLarge onClick={handlePlayAgain} className="flex-1">
              Zobacz mapę <Map className="mt-1" />
            </ButtonLarge>
          </div>
        </div>
      </div>
    </div>
  );
}
