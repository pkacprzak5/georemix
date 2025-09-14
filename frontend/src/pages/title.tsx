import { useEffect } from "react";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";

const INTRO_DURATION = 100;

export function TitlePage() {
  const { navigateTo } = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigateTo(moduleIdMap.INTRO, "player-name-input");
    }, INTRO_DURATION);

    return () => clearTimeout(timer);
  }, [navigateTo]);

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">NVIDIA Geo-Guessing</h1>
        <p className="text-lg text-muted-foreground">Getting things ready...</p>
      </div>
    </div>
  );
}
