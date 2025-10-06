import { useEffect, useState } from "react";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
// @ts-ignore
import BitLogo from "../../public/bitv4.svg?react";
// @ts-ignore
import NvidiaLogo from "../../public/Nvidia_logo.svg?react";
import { X } from "lucide-react";

// const INTRO_DURATION = 5000; // 5 seconds
const INTRO_DURATION = 1;
const LOGO_DELAY = 500; // 0.5 seconds

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
    <div className="flex items-center justify-center min-h-full">
      <div className="text-center">
        <div className="mb-8">
          {showLogo && (
            <div className="animate-fade-in flex items-center justify-center gap-20 3xl:gap-24 4xl:gap-32 5xl:gap-40">
              <NvidiaLogo className="w-[30%] h-[50%] 3xl:w-[32%] 4xl:w-[35%] 5xl:w-[38%]" />
              <X size={"80px"} className="ml-[-50px] 3xl:w-24 3xl:h-24 4xl:w-28 4xl:h-28 5xl:w-32 5xl:h-32 3xl:ml-[-60px] 4xl:ml-[-70px] 5xl:ml-[-80px]" />
              <BitLogo className="w-[30%] h-[50%] 3xl:w-[32%] 4xl:w-[35%] 5xl:w-[38%]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
