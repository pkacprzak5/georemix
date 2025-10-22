import { useEffect, useState } from "react";
import { useNavigation } from "@/lib/navigation/navigation-provider";
import { moduleIdMap } from "@/types/navigation";
import EdgeStars from "@/components/stars/edge-stars";
// @ts-ignore
import BitLogo from "../../public/bitv4.svg?react";

const INTRO_DURATION = 7000; // 7 seconds
const LOGO_DELAY = 1500; // 1.5 seconds
const STARS_DELAY = 200; // 0.2 seconds - delay for stars animation

export function TitlePage() {
  const { navigateTo } = useNavigation();
  const [showLogo, setShowLogo] = useState(false);
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, LOGO_DELAY);

    const starsTimer = setTimeout(() => {
      setShowStars(true);
    }, STARS_DELAY);

    const navigationTimer = setTimeout(() => {
      navigateTo(moduleIdMap.INTRO, "welcome-page");
    }, INTRO_DURATION);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(starsTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigateTo]);

  return (
    <div className="flex items-center justify-center min-h-full relative">
      {/* Left EdgeStars */}
      {showStars && (
        <div className="absolute left-0 top-0 w-[20%] h-full">
          <EdgeStars className="h-full" starClassName="animate-fade-in-fast" />
        </div>
      )}

      {/* Main content */}
      <div className="text-center z-10">
        <div className="mb-8">
          {showLogo && (
            <div className="animate-fade-in flex items-center justify-center gap-20 3xl:gap-24 4xl:gap-32 5xl:gap-40">
              <BitLogo className="w-[50%] h-[50%]" />
            </div>
          )}
        </div>
      </div>

      {/* Right EdgeStars */}
      {showStars && (
        <div className="absolute right-0 top-0 w-[20%] h-full">
          <EdgeStars className="h-full" reverse starClassName="animate-fade-in-fast" />
        </div>
      )}
    </div>
  );
}
