import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Card } from "./card";

export interface TimerProps {
  className?: string;
  onTimeUpdate?: (seconds: number) => void;
}

export function Timer({ className, onTimeUpdate }: TimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => {
        const newTime = prev + 1;
        onTimeUpdate?.(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTimeUpdate]);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`flex flex-row items-center justify-center gap-2 px-3 py-2 h-10 min-w-0 ${className || ''}`}>
      <Clock size={16} className="text-foreground flex-shrink-0" />
      <span className="text-sm font-mono tabular-nums text-foreground whitespace-nowrap">
        {formatTime(seconds)}
      </span>
    </Card>
  );
}