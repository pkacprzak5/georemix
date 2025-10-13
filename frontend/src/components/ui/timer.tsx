import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Card } from "./card";
import { useEventBridge } from "@/context/game-state";

export interface TimerProps {
  className?: string;
  onTimeUpdate?: (seconds: number) => void;
}

export function Timer({ className, onTimeUpdate }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(true); // Start paused
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const eventBridge = useEventBridge();

  useEffect(() => {
    const startedCleanup = eventBridge.addEventListener("gameStarted", () => {
      setHasStarted(true);
      setIsPaused(false);
    });
    const pausedCleanup = eventBridge.addEventListener("gamePaused", () => {
      setIsPaused(true);
    });
    const unpausedCleanup = eventBridge.addEventListener("gameUnpaused", () => {
      setIsPaused(false);
    });

    return () => {
      startedCleanup();
      pausedCleanup();
      unpausedCleanup();
    };
  }, [eventBridge]);

  useEffect(() => {
    if (isPaused || !hasStarted) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const newTime = prev + 1;
        onTimeUpdate?.(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, hasStarted, onTimeUpdate]);

  const handleClick = () => {
    setIsCompact(!isCompact);
  };

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      className={`flex flex-row items-center cursor-pointer transition-all ease-in-out hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none overflow-hidden ${
        isCompact 
          ? "aspect-square h-10 w-10 3xl:h-12 3xl:w-12 4xl:h-14 4xl:w-14 short-screen:h-10 short-screen:w-10 justify-center p-0" 
          : "h-10 w-24 3xl:h-12 3xl:w-28 4xl:h-14 4xl:w-32 short-screen:h-10 short-screen:w-24 justify-between gap-3 px-[10px] 3xl:pl-3 4xl:pl-4 short-screen:px-[10px] py-2"
      } ${className || ""}`}
      onClick={handleClick}>
      <Clock className={`text-foreground flex-shrink-0 transition-all ease-out w-4 h-4 3xl:w-5 3xl:h-5 4xl:w-6 4xl:h-6 short-screen:w-4 short-screen:h-4 ${!isCompact ? 'ml-0' : ''}`} />
      {!isCompact && (
        <span
          className={`text-sm 3xl:text-base 4xl:text-lg short-screen:text-sm mt-auto mb-auto font-mono tabular-nums text-foreground whitespace-nowrap `}>
          {formatTime(seconds)}
        </span>
      )}
    </Card>
  );
}
