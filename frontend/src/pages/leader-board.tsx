import { useEffect, useMemo, useState } from "react";
import { ScrollText, ArrowLeft } from "lucide-react";
import { RankingTable, type RankingColumn } from "@/components/leaderboard/RankingTable";
import { 
  type RoundLeaderboard 
} from "@/context/game-state/DataSourceManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameStateManager, useDataSourceManager } from "@/context/game-state";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import { ButtonLarge } from "@/components/ui/button";
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

const ESTIMATED_PAGE_CONTENT_HEIGHT = 300;
const ESTIMATED_ROW_HEIGHT = 65;

export function LeaderBoardPage() {
  const { navigateTo } = useNavigation();
  const gameStateManager = useGameStateManager();
  const dataSourceManager = useDataSourceManager();
  const [leaderboardData, setLeaderboardData] = useState<RoundLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxRows, setMaxRows] = useState(10);

  // Load and update leaderboard cache when component mounts
  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      
      // Get cached data immediately
      const cached = dataSourceManager.getAllRoundsLeaderboard();
      setLeaderboardData(cached);
      
      // Update cache from backend
      try {
        await dataSourceManager.updateAllRoundsCache();
        const updated = dataSourceManager.getAllRoundsLeaderboard();
        setLeaderboardData(updated);
      } catch (error) {
        console.error("Failed to update leaderboard cache:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [dataSourceManager]);

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      const availableHeight = height - ESTIMATED_PAGE_CONTENT_HEIGHT; // estimate for header, tabs, buttons, padding
      const rowHeight = ESTIMATED_ROW_HEIGHT; // estimated row height
      const calculatedMaxRows = Math.max(1, Math.floor(availableHeight / rowHeight));
      setMaxRows(calculatedMaxRows);
    };

    handleResize(); // initial calculation
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rounds = useMemo(() => [1, 2, 3], []);
  const defaultRound = useMemo(() => rounds[0], [rounds]);

  if (isLoading && leaderboardData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-full">
        <p>Ładowanie rankingu...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-full p-8">
      <div className="w-[900px] flex flex-col gap-8">
        <Tabs className="shadow-shadow rounded-base" defaultValue={defaultRound.toString()}>
          <TabsList className="grid p-0 w-full rounded-b-none grid-cols-3 gap-0 overflow-hidden h-12 border-b-0">
            {rounds.map((round) => (
              <TabsTrigger
                key={round}
                className="h-full m-0 rounded-none border-0 border-r-2 last:border-r-0 border-border bg-white"
                value={round.toString()}>
                Runda {round}
              </TabsTrigger>
            ))}
          </TabsList>
          {rounds.map((round) => {
            const roundData = leaderboardData.find(r => r.roundNumber === round);
            return (
              <TabsContent className="border-t-0 mt-0" value={round.toString()} key={round}>
                <RankingTable
                  className="rounded-t-none shadow-none"
                  rows={roundData?.results || []}
                  columns={leaderboardColumns}
                  maxRows={maxRows}
                />
              </TabsContent>
            );
          })}
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
