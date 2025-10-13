
import { Button } from "@/components/ui/button";
import StylisedSpan from "@/components/ui/stylised-span";
import { useGameStateManager } from "@/context/game-state";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";

export function StagePicker() {
  const { navigateWithLoading } = useNavigation();
  const gameStateManager = useGameStateManager();

  const handleRoundSelect = (roundIndex: number) => {
    const promise = gameStateManager.loadRound(roundIndex);
    navigateWithLoading(moduleIdMap.LEVEL_START, "level-start", promise);
  };

  const rounds = [
    {
      roundNumber: 1,
      title: "Rozgrywka 1",
      isLocked: false,
    },
    {
      roundNumber: 2,
      title: "Rozgrywka 2",
      isLocked: true,
    },
    {
      roundNumber: 3,
      title: "Rozgrywka 3",
      isLocked: true,
    },
  ];

  return (
    <div className="flex items-center flex-col justify-center min-h-full px-4">
      <h1 className="leading-normal 3xl:text-[5em] 4xl:text-[5.8em] mb-16 xl:mb-16 2xl:mb-20 3xl:mb-24 whitespace-nowrap">
        <StylisedSpan showStars>Wybierz rozgrywkę!</StylisedSpan>
      </h1>

      <div className="flex gap-6 3xl:gap-8 4xl:gap-10 justify-center flex-nowrap">
        {rounds.map((round) => (
          <Button
            key={round.roundNumber}
            onClick={!round.isLocked ? () => handleRoundSelect(round.roundNumber) : undefined}
            disabled={round.isLocked}
            className={cn(
              "relative group flex flex-col items-center justify-center flex-shrink-0 z-[5000]",
              "w-48 h-48  3xl:w-64 3xl:h-64 4xl:w-72 4xl:h-72",
              "font-heading text-3xl 3xl:text-4xl 4xl:text-5xl",
              round.isLocked
                ? "bg-foreground/10 cursor-not-allowed opacity-60"
                : "bg-main text-main-foregroun cursor-pointer"
            )}>
            {/* Round Number */}
            <div className="text-6xl 3xl:text-7xl 4xl:text-8xl font-bold mb-4 3xl:mb-6 4xl:mb-8">
              {round.roundNumber}
            </div>

            {/* Title or Lock */}
            {round.isLocked ? (
              <div className="flex flex-col items-center gap-3 3xl:gap-4">
                <span className="text-lg 3xl:text-xl 4xl:text-2xl">Wkrótce</span>
              </div>
            ) : (
              <div className="text-xl 3xl:text-2xl 4xl:text-3xl">{round.title}</div>
            )}

            {/* Hover effect overlay */}
            {!round.isLocked && (
              <div className="absolute inset-0 rounded-base bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
