import { useEffect, useState } from "react";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
// @ts-ignore
import BitLogo from "../../public/bitv4.svg?react";
// @ts-ignore
import NvidiaLogo from "../../public/Nvidia_logo.svg?react";
import { X } from "lucide-react";

const INTRO_DURATION = 1; // 5 seconds
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
            <div className="animate-fade-in flex items-center justify-center gap-20">
              <NvidiaLogo className=" w-[30%] h-[50%]" />
              <X size={"80px"} className="ml-[-50px]" />
              <BitLogo className=" w-[30%] h-[50%]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
