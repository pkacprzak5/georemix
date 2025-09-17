import { useEffect, useState } from "react";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";

const INTRO_DURATION = 5000; // 5 seconds
const LOGO_DELAY = 500; // 0.5 seconds

export function TitlePage() {
  const { navigateTo } = useNavigation();
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    // Show logo after 0.5 seconds
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, LOGO_DELAY);

    // Navigate after 5 seconds
    const navigationTimer = setTimeout(() => {
      navigateTo(moduleIdMap.INTRO, "player-name-input");
    }, INTRO_DURATION);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigateTo]);

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="text-center">
        <div className="mb-8">
          {showLogo && (
            <div className="animate-fade-in flex items-center justify-center gap-8">
              <img 
                src="/Nvidia_logo.svg" 
                alt="NVIDIA Logo" 
                className="w-48 h-auto"
              />
              <img 
                src="/bit-logo-signed-transparent.svg" 
                alt="BIT Logo" 
                className="w-32 h-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
