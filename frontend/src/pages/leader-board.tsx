import { useMemo } from "react";
import { RankingTable, type RankingColumn } from "@/components/leaderboard/RankingTable";
import { mockLeaderboard } from "@/lib/api-mock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameStateManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import { ButtonLarge } from "@/components/ui/button";
import { ScrollText, ArrowLeft } from "lucide-react";
import type { PlayerResults } from "@/types/project";

function formatScore(value: number): string {
  return Number.isFinite(value) ? Math.round(value).toLocaleString() : "0";
}

function formatSeconds(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "--";
  }

  const totalSeconds = Math.max(0, Math.round(value));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDistance(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "--";
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} km`;
  }

  return `${Math.round(value)} m`;
}

/** Defines columns for round leaderboard. */
const leaderboardColumns: RankingColumn<PlayerResults>[] = [
  {
    key: "playerName",
    header: "Gracz",
    render: (row) => row.playerName,
  },
  {
    key: "overallScore",
    header: "Suma Punktów",
    align: "right",
    render: (row) => formatScore(row.totalScore),
  },
  {
    key: "overallTime",
    header: "Całkowity Czas",
    align: "right",
    render: (row) => formatSeconds(row.totalTime),
  },
  {
    key: "overallDistance",
    header: "Minimalna Odległość",
    align: "right",
    render: (row) => formatDistance(row.closestCall),
  },
];

export function LeaderBoardPage() {
  const { navigateTo } = useNavigation();
  const gameStateManager = useGameStateManager();

  const rounds = mockLeaderboard.map((round) => round.roundNumber);
  const defaultRound = useMemo(() => rounds[0], []);

  return (
    <div className="flex justify-center min-h-full p-8">
      <div className="w-[900px] flex flex-col gap-8">
        <Tabs className="shadow-shadow rounded-base" defaultValue={defaultRound.toString()}>
          <TabsList className="grid p-0 w-full rounded-b-none grid-cols-3 gap-0 overflow-hidden h-12 border-b-0">
            {rounds
              .map((round) => round.toString())
              .map((round) => (
                <TabsTrigger
                  className="h-full m-0 rounded-none border-0 border-r-2 last:border-r-0 border-border bg-white"
                  value={round}>
                  Runda {round}
                </TabsTrigger>
              ))}
          </TabsList>
          {rounds.map((round) => (
            <TabsContent className="border-t-0 mt-0" value={round.toString()} key={round}>
              <RankingTable
                className="rounded-t-none shadow-none"
                rows={mockLeaderboard
                  .find(({ roundNumber }) => roundNumber === round)!
                  .results.slice(-10)}
                columns={leaderboardColumns}
              />
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex w-full gap-8">
          <ButtonLarge onClick={() => navigateTo(moduleIdMap.INTRO, "welcome-page")}>
            <ArrowLeft className="mt-1" /> Powrót do Menu
          </ButtonLarge>
          {gameStateManager.isRoundFinished && (
            <ButtonLarge onClick={() => navigateTo(moduleIdMap.FINAL, "final-result")}>
              Powrót do Podsumowania <ScrollText className="mt-1" />
            </ButtonLarge>
          )}
        </div>
      </div>
    </div>
  );
}
