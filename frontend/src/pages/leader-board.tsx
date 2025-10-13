import { useEffect, useMemo, useState, useRef } from "react";
import { ArrowLeft, Earth } from "lucide-react";
import { RankingTable, type RankingColumn } from "@/components/ui/ranking-table";
import { type RoundLeaderboard } from "@/context/game-state/DataSourceManager";
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
    header: "Najbliższy traf",
    align: "right",
    render: (row) => formatDistance(row.closestCall),
  },
];

export function LeaderBoardPage() {
  const { navigateTo } = useNavigation();
  const gameStateManager = useGameStateManager();
  const dataSourceManager = useDataSourceManager();
  const [leaderboardData, setLeaderboardData] = useState<RoundLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxRows, setMaxRows] = useState(10);
  
  // Refs to measure actual DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

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
    const calculateMaxRows = () => {
      if (!containerRef.current || !tabsRef.current) return;

      // Get the table element (first child of TabsContent)
      const tableWrapper = tabsRef.current.querySelector('[role="tabpanel"]:not([hidden])');
      if (!tableWrapper) return;

      const table = tableWrapper.querySelector('table');
      if (!table) return;

      // Measure actual heights
      const containerHeight = containerRef.current.clientHeight;
      const tabsHeaderHeight = tabsRef.current.querySelector('[role="tablist"]')?.clientHeight || 0;
      const buttonsHeight = buttonsRef.current?.clientHeight || 0;
      
      // Get padding/gap values from container
      const containerStyles = window.getComputedStyle(containerRef.current);
      const containerPadding = parseFloat(containerStyles.paddingTop) + parseFloat(containerStyles.paddingBottom);
      
      // Get gap between tabs and buttons
      const gapMatch = containerStyles.gap.match(/(\d+)/);
      const gap = gapMatch ? parseFloat(gapMatch[0]) * 2 : 0; // multiply by 2 for gaps between elements

      // Measure a single row height from the table
      const tableHeader = table.querySelector('thead');
      const tableRow = table.querySelector('tbody tr');
      const headerHeight = tableHeader?.clientHeight || 0;
      const rowHeight = tableRow?.clientHeight || 65; // fallback to 65 if no rows yet

      // Calculate available height for table body
      const availableHeight = containerHeight - tabsHeaderHeight - buttonsHeight - containerPadding - gap - headerHeight - 100;
      
      // Calculate max rows that can fit
      const calculatedMaxRows = Math.max(1, Math.floor(availableHeight / rowHeight));
      setMaxRows(calculatedMaxRows);
    };

    // Use ResizeObserver for more accurate tracking
    const resizeObserver = new ResizeObserver(() => {
      calculateMaxRows();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Initial calculation with a small delay to ensure DOM is ready
    const timeout = setTimeout(calculateMaxRows, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeout);
    };
  }, [leaderboardData]);

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
    <div ref={containerRef} className="flex justify-center items-center min-h-full p-8 3xl:p-10 4xl:p-12 5xl:p-16">
      <div className="w-[900px] 3xl:w-[1100px] 4xl:w-[1400px] 5xl:w-[1800px] flex flex-col gap-8 3xl:gap-10 4xl:gap-12">
        <Tabs ref={tabsRef} className="shadow-shadow rounded-base" defaultValue={defaultRound.toString()}>
          <TabsList className="grid p-0 w-full rounded-b-none grid-cols-3 gap-0 overflow-hidden h-12 3xl:h-16 4xl:h-20 5xl:h-24 border-b-0">
            {rounds.map((round) => (
              <TabsTrigger
                key={round}
                className="h-full m-0 rounded-none border-0 border-r-2 last:border-r-0 border-border bg-white text-base 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl"
                value={round.toString()}>
                Runda {round}
              </TabsTrigger>
            ))}
          </TabsList>
          {rounds.map((round) => {
            const roundData = leaderboardData.find((r) => r.roundNumber === round);
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

        <div ref={buttonsRef} className="flex w-full gap-8">
          {gameStateManager.isRoundFinished && (
            <ButtonLarge
              className="whitespace-nowrap 3xl:text-3xl 3xl:py-5 4xl:text-4xl 4xl:py-6"
              onClick={() => navigateTo(moduleIdMap.FINAL, "final-result")}>
              <ArrowLeft className="w-6 h-6 3xl:w-7 3xl:h-7 4xl:w-10 4xl:h-10 mt-1 3xl:mt-2" /> Powrót do Podsumowania
            </ButtonLarge>
          )}
          <ButtonLarge
            className="whitespace-nowrap 3xl:text-3xl 3xl:py-5 4xl:text-4xl 4xl:py-6"
            onClick={() => navigateTo(moduleIdMap.INTRO, "welcome-page")}>
             Powrót do Menu  <Earth className="whitespace-nowrap w-6 h-6 3xl:w-7 3xl:h-7 4xl:w-10 4xl:h-10 mt-1 3xl:mt-2" />
          </ButtonLarge>
        </div>
      </div>
    </div>
  );
}
