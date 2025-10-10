import { ButtonLarge } from "@/components/ui/button";
import { useGameStateManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import StylisedSpan from "@/components/ui/stylised-span";

export function StagePicker() {
  const { navigateWithLoading } = useNavigation();
  const gameStateManager = useGameStateManager();

  const handleRoundSelect = (roundIndex: number) => {
    const promise = gameStateManager.loadRound(roundIndex);
    navigateWithLoading(moduleIdMap.LEVEL_START, "level-start", promise);
  };

  return (
    <div className="flex items-center flex-col justify-center min-h-full">
      <h1 className="leading-normal 3xl:text-[5em] 4xl:text-[5.8em] mb-10 xl:mb-10 2xl:mb-14 3xl:mb-18 whitespace-nowrap">
          <StylisedSpan showStars>Wybierz rozgrywkę!</StylisedSpan>
        </h1>

      <div className="w-full max-w-xl 3xl:max-w-3xl 4xl:max-w-4xl space-y-6 3xl:space-y-8 4xl:space-y-10">
        {/* Header */}
        

        <div className="space-y-8 3xl:space-y-10 4xl:space-y-12">
          <ButtonLarge onClick={() => handleRoundSelect(1)} className="w-full 3xl:text-3xl 3xl:py-5 4xl:text-4xl 4xl:py-6">
            Rozgrywka 1
          </ButtonLarge>

          <ButtonLarge disabled onClick={() => handleRoundSelect(2)} className="w-full 3xl:text-3xl 3xl:py-5 4xl:text-4xl 4xl:py-6">
            Rozgrywka 2: Dostępna wkrótce
          </ButtonLarge>

          <ButtonLarge disabled onClick={() => handleRoundSelect(3)} className="w-full 3xl:text-3xl 3xl:py-5 4xl:text-4xl 4xl:py-6">
            Rozgrywka 3: Dostępna wkrótce
          </ButtonLarge>
        </div>
      </div>
    </div>
  );
}
