import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RankingTable, type RankingColumn } from "@/components/leaderboard/RankingTable";
import { useDataSourceManager } from "@/context/game-state";
import type { OverallScoreSummary, StageLeaderboard, StageScoreSummary } from "@/types/leaderboard";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { moduleIdMap } from "@/lib/navigation-system/types";
import { ArrowLeft, Loader2, RefreshCcw } from "lucide-react";

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

function stageLabel(stage: StageLeaderboard, index: number): string {
  if (stage.stageName && stage.stageName.trim().length > 0) {
    return stage.stageName;
  }
  return `Rozgrywka ${index + 1}`;
}

export function LeaderBoardPage() {
  const dataSourceManager = useDataSourceManager();
  const { navigateTo } = useNavigation();
  const initialStageCache = useMemo(() => dataSourceManager.getStageLeaderboardsSnapshot() ?? [], [dataSourceManager]);
  const initialOverallCache = useMemo(() => dataSourceManager.getOverallLeaderboardSnapshot() ?? [], [dataSourceManager]);
  const [stageLeaderboards, setStageLeaderboards] = useState<StageLeaderboard[]>(initialStageCache);
  const [overallLeaderboard, setOverallLeaderboard] = useState<OverallScoreSummary[]>(initialOverallCache);
  const [activeStageId, setActiveStageId] = useState<string>(() => initialStageCache[0]?.stageId ?? "");
  const [isLoading, setIsLoading] = useState(initialStageCache.length === 0 && initialOverallCache.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadScoreboards = useCallback(
    async (showSpinner: boolean) => {
      if (showSpinner) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const [stageData, overallData] = await Promise.all([
          dataSourceManager.fetchStageLeaderboards(),
          dataSourceManager.fetchOverallLeaderboard(),
        ]);

        if (!isMountedRef.current) {
          return;
        }

        setStageLeaderboards(stageData);
        setOverallLeaderboard(overallData);
        if (stageData.length > 0) {
          setActiveStageId((current) =>
            current && stageData.some((stage) => stage.stageId === current) ? current : stageData[0].stageId
          );
        }
      } catch (err) {
        if (!isMountedRef.current) {
          return;
        }
        setError("Nie udalo sie pobrac danych rankingu. Sprobuj ponownie pozniej.");
      } finally {
        if (!isMountedRef.current) {
          return;
        }
        if (showSpinner) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [dataSourceManager]
  );

  useEffect(() => {
    loadScoreboards(initialStageCache.length === 0 && initialOverallCache.length === 0);
  }, [loadScoreboards, initialStageCache.length, initialOverallCache.length]);

  const activeStage = useMemo(() => {
    if (!activeStageId) {
      return stageLeaderboards[0] ?? undefined;
    }
    return stageLeaderboards.find((stage) => stage.stageId === activeStageId) ?? stageLeaderboards[0] ?? undefined;
  }, [activeStageId, stageLeaderboards]);

  const stageRows: StageScoreSummary[] = activeStage?.scores ?? [];

  const stageColumns: RankingColumn<StageScoreSummary>[] = useMemo(() => {
    const totalLevels = activeStage?.totalLevels;
    return [
      {
        key: "player",
        header: "Gracz",
        render: (row) => row.username ?? "Anonim",
      },
      {
        key: "score",
        header: "Punkty",
        align: "right",
        render: (row) => formatScore(row.totalScore),
      },
      {
        key: "time",
        header: "Czas",
        align: "right",
        render: (row) => formatSeconds(row.totalTime ?? undefined),
      },
      {
        key: "distance",
        header: "Dystans",
        align: "right",
        render: (row) => formatDistance(row.totalDistance ?? undefined),
      },
      {
        key: "levels",
        header: "Poziomy",
        align: "right",
        render: (row) =>
          totalLevels && totalLevels > 0 ? `${row.completedLevels}/${totalLevels}` : `${row.completedLevels}`,
      },
    ];
  }, [activeStage]);

  const overallColumns: RankingColumn<OverallScoreSummary>[] = useMemo(
    () => [
      {
        key: "username",
        header: "Gracz",
        render: (row) => row.username,
      },
      {
        key: "overallScore",
        header: "Punkty",
        align: "right",
        render: (row) => formatScore(row.overallScore),
      },
      {
        key: "overallTime",
        header: "Czas",
        align: "right",
        render: (row) => formatSeconds(row.overallTime),
      },
      {
        key: "overallDistance",
        header: "Dystans",
        align: "right",
        render: (row) => formatDistance(row.overallDistance),
      },
      {
        key: "stagesCompleted",
        header: "Rozgrywki",
        align: "right",
        render: (row) => row.stagesCompleted,
      },
    ],
    []
  );

  const handleRefresh = () => {
    loadScoreboards(false);
  };

  const handleBack = () => {
    navigateTo(moduleIdMap.INTRO, "welcome-page");
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-base border-2 border-border bg-secondary-background px-6 py-5 shadow-shadow">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-heading uppercase leading-tight tracking-[0.2em] text-foreground">
                Ranking graczy
              </h1>
              <p className="mt-3 max-w-3xl text-sm font-base text-foreground/70">
                Sprawdz jak radza sobie pozostali odkrywcy. Wyniki aktualizuja sie po zakonczonej rozgrywce, a tabela
                uwzglednia tylko w pelni ukonczone etapy.
              </p>
            </div>
            <Button variant="neutral" size="sm" onClick={handleBack} className="shrink-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Wroc
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-base border-2 border-border bg-secondary-background px-6 py-4 text-sm font-base text-red-600 shadow-shadow">
            {error}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-base border-2 border-border bg-secondary-background px-6 py-4 shadow-shadow">
            <div>
              <h2 className="text-xl font-heading uppercase tracking-[0.18em] text-foreground">Ranking etapow</h2>
              {activeStage ? (
                <p className="mt-1 text-sm font-base text-foreground/70">
                  Wyniki dla: {stageLabel(activeStage, stageLeaderboards.indexOf(activeStage))}
                  {activeStage.totalLevels ? ` - Poziomy: ${activeStage.totalLevels}` : null}
                  {activeStage.scores.length ? ` - Gracze: ${activeStage.scores.length}` : " - Brak wynikow"}
                </p>
              ) : (
                <p className="mt-1 text-sm font-base text-foreground/70">Brak rozgrywek do wyswietlenia.</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {stageLeaderboards.map((stage, index) => (
                <Button
                  key={stage.stageId}
                  variant={stage.stageId === activeStage?.stageId ? "default" : "neutral"}
                  size="sm"
                  onClick={() => setActiveStageId(stage.stageId)}>
                  {stageLabel(stage, index)}
                </Button>
              ))}
              <Button variant="neutral" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}Odswiez
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center rounded-base border-2 border-border bg-secondary-background px-6 py-12 text-sm font-base text-foreground shadow-shadow">
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              <span>Trwa ladowanie rankingu etapow...</span>
            </div>
          ) : (
            <RankingTable
              rows={stageRows}
              columns={stageColumns}
              getRowKey={(row) => row.id}
              emptyState={<p className="text-sm font-base text-foreground/70">Brak wynikow dla tej rozgrywki. Bedziesz pierwszy!</p>}
            />
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-base border-2 border-border bg-secondary-background px-6 py-4 shadow-shadow">
            <div>
              <h2 className="text-xl font-heading uppercase tracking-[0.18em] text-foreground">Ranking globalny</h2>
              <p className="mt-1 text-sm font-base text-foreground/70">
                Zsumowane wyniki wszystkich rozgrywek. Licza sie punkty, nastepnie czas i dystans.
              </p>
            </div>
            {isRefreshing && !isLoading ? (
              <span className="flex items-center gap-2 text-xs font-base uppercase tracking-[0.2em] text-foreground/60">
                <Loader2 className="h-4 w-4 animate-spin" /> Aktualizuje
              </span>
            ) : null}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center rounded-base border-2 border-border bg-secondary-background px-6 py-12 text-sm font-base text-foreground shadow-shadow">
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              <span>Trwa ladowanie wynikow globalnych...</span>
            </div>
          ) : (
            <RankingTable
              rows={overallLeaderboard}
              columns={overallColumns}
              getRowKey={(row) => row.username}
              emptyState={<p className="text-sm font-base text-foreground/70">Brak wynikow globalnych. Rozpocznij rozgrywke, aby otworzyc ranking.</p>}
            />
          )}
        </section>
      </div>
    </div>
  );
}
