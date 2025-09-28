import { RankingTable, type RankingColumn } from "@/components/leaderboard/RankingTable";
import { mockLeaderboard, type PlayerResults } from "@/lib/api-mock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";
import { useGameStateManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import { Button } from "@/components/ui/button";

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
      <div className="max-w-[800px] flex flex-col gap-8">
        <div className="flex w-full gap-8">
          <Button onClick={() => navigateTo(moduleIdMap.INTRO, "welcome-page")}>
            Back to Home
          </Button>
          {gameStateManager.isRoundFinished && (
            <Button onClick={() => navigateTo(moduleIdMap.FINAL, "final-result")}>
              Back to Results
            </Button>
          )}
        </div>

        <Tabs defaultValue={defaultRound.toString()} className="max-w-[800px]">
          <TabsList className="grid w-full grid-cols-3">
            {rounds
              .map((round) => round.toString())
              .map((round) => (
                <TabsTrigger value={round}>Round {round}</TabsTrigger>
              ))}
          </TabsList>
          {rounds.map((round) => (
            <TabsContent value={round.toString()}>
              <RankingTable
                rows={mockLeaderboard.find(({ roundNumber }) => roundNumber === round)!.results}
                columns={leaderboardColumns}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
