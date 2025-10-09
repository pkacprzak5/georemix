import { useEffect, useState } from "react";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import EdgeStars from "@/components/ui/edge-stars";
// @ts-ignore
import BitLogo from "../../public/bitv4.svg?react";

const INTRO_DURATION = 7000; // 5 seconds
// const INTRO_DURATION = 1;
const LOGO_DELAY = 1500; // 0.5 seconds

export function TitlePage() {
  const { navigateTo } = useNavigation();
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    // Show logo after 0.5 seconds
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, LOGO_DELAY);

    // Navigate after 5 seconds
    const navigationTimer = setTimeout(() => {
      navigateTo(moduleIdMap.INTRO, "welcome-page");
    }, INTRO_DURATION);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigateTo]);

  return (
    <div className="flex items-center justify-center min-h-full relative">
      {/* Left EdgeStars - 10% width */}
      <div className="absolute left-0 top-0 w-[20%] h-full">
        <EdgeStars className="h-full" starClassName="animate-fade-in-fast" />
      </div>

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

      {/* Right EdgeStars - 10% width */}
      <div className="absolute right-0 top-0 w-[20%] h-full">
        <EdgeStars className="h-full" reverse starClassName="animate-fade-in-fast" />
      </div>
    </div>
  );
}
