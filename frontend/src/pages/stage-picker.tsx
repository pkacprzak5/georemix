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
      <h1 className="leading-normal text-center mb-20">
          <StylisedSpan showStars>Wybierz rozgrywkę!</StylisedSpan>
        </h1>
      <div className="w-full max-w-xl 3xl:max-w-xl 4xl:max-w-2xl 5xl:max-w-3xl space-y-6 3xl:space-y-8 4xl:space-y-10">
        {/* Header */}
        

        <div className="space-y-10 3xl:space-y-12 4xl:space-y-16">
          <ButtonLarge onClick={() => handleRoundSelect(1)} className="w-full 3xl:text-lg 4xl:text-xl 5xl:text-2xl">
            Rozgrywka 1
          </ButtonLarge>

          <ButtonLarge disabled onClick={() => handleRoundSelect(2)} className="w-full 3xl:text-lg 4xl:text-xl 5xl:text-2xl">
            Rozgrywka 2: Dostępna wkrótce
          </ButtonLarge>

          <ButtonLarge disabled onClick={() => handleRoundSelect(3)} className="w-full 3xl:text-lg 4xl:text-xl 5xl:text-2xl">
            Rozgrywka 3: Dostępna wkrótce
          </ButtonLarge>
        </div>
      </div>
    </div>
  );
}
