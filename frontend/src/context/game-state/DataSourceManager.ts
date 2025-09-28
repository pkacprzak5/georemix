import { BASE_URL } from "@/constants";
import type {
  OverallScoreSummary,
  StageLeaderboard,
  StageScoreSummary,
  LevelScoreSummary,
  PlayerScoreResponse,
} from "@/types/leaderboard";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type StageWithScoresResponse = {
  id?: number;
  stageId?: string;
  stageName?: string | null;
  totalLevels?: number | null;
  createdAt: string;
  scores?: StageScoreSummary[];
};

type StageScoreResponse = StageScoreSummary & {
  levels?: LevelScoreSummary[] | null;
};

type UsernameAvailabilityResponse = {
  username: string;
  available: boolean;
};

type DefaultHeaders = Record<string, string>;

const JSON_HEADERS: DefaultHeaders = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

export class DataSourceManager {
  private readonly baseUrl: string;
  private stageLeaderboardsCache: StageLeaderboard[] | null = null;
  private overallLeaderboardCache: OverallScoreSummary[] | null = null;
  private readonly stageLeaderboardCacheById = new Map<string, StageLeaderboard>();

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/?$/, "");
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    if (!username.trim()) {
      throw new Error("Username is required");
    }

    const params = new URLSearchParams({ username });
    const data = await this.get<UsernameAvailabilityResponse>(
      `/players/availability?${params.toString()}`
    );
    return Boolean(data?.available);
  }

  async createPlayer(username: string): Promise<void> {
    const trimmed = username.trim();
    if (!trimmed) {
      throw new Error("Username is required");
    }

    await this.request(`/players`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ username: trimmed }),
    });
  }

  async fetchStageLeaderboards(): Promise<StageLeaderboard[]> {
    const response = await this.get<StageWithScoresResponse[]>(`/scores/stages`);
    if (!Array.isArray(response)) {
      return [];
    }

    const normalized = response
      .map((stage) => this.normalizeStageLeaderboard(stage))
      .sort((a, b) => a.stageId.localeCompare(b.stageId));
    this.stageLeaderboardsCache = normalized;
    normalized.forEach((leaderboard) => {
      this.stageLeaderboardCacheById.set(leaderboard.stageId, leaderboard);
    });

    return normalized;
  }

  async fetchStageLeaderboard(stageId: string): Promise<StageLeaderboard | null> {
    if (!stageId) {
      return null;
    }

    const data = await this.get<{ stage: StageWithScoresResponse; scores: StageScoreResponse[] }>(
      `/scores/stages/${encodeURIComponent(stageId)}`
    );

    if (!data?.stage) {
      return null;
    }

    const normalized = this.normalizeStageLeaderboard({
      ...data.stage,
      scores: data.scores,
    });

    this.stageLeaderboardCacheById.set(normalized.stageId, normalized);
    if (this.stageLeaderboardsCache) {
      const remaining = this.stageLeaderboardsCache.filter(
        (item) => item.stageId !== normalized.stageId
      );
      const merged = [...remaining, normalized];
      merged.sort((a, b) => a.stageId.localeCompare(b.stageId));
      this.stageLeaderboardsCache = merged;
    }

    return normalized;
  }

  async fetchOverallLeaderboard(): Promise<OverallScoreSummary[]> {
    const data = await this.get<OverallScoreSummary[]>(`/scores/overall`);

    if (!Array.isArray(data)) {
      return [];
    }

    const normalized = data
      .filter((entry) => Boolean(entry?.username))
      .map((entry) => ({
        username: entry.username,
        overallScore: Number(entry.overallScore) || 0,
        overallTime: Number(entry.overallTime) || 0,
        overallDistance: Number(entry.overallDistance) || 0,
        stagesCompleted: Number(entry.stagesCompleted) || 0,
        lastPlayedAt: entry.lastPlayedAt ?? null,
      }))
      .sort((a, b) => {
        if (b.overallScore !== a.overallScore) {
          return b.overallScore - a.overallScore;
        }
        if (a.overallTime || b.overallTime) {
          return (
            (a.overallTime || Number.POSITIVE_INFINITY) -
            (b.overallTime || Number.POSITIVE_INFINITY)
          );
        }
        return a.username.localeCompare(b.username);
      });

    this.overallLeaderboardCache = normalized;

    return normalized;
  }

  async fetchPlayerScores(username: string): Promise<PlayerScoreResponse | null> {
    if (!username.trim()) {
      return null;
    }

    try {
      const data = await this.get<PlayerScoreResponse>(
        `/scores/players/${encodeURIComponent(username)}`
      );
      if (!data?.player) {
        return null;
      }

      return {
        ...data,
        scores: this.sortStageScores(data.scores ?? []),
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  private normalizeStageLeaderboard(stage: StageWithScoresResponse): StageLeaderboard {
    const stageId = stage.stageId ?? "";
    const sortedScores = this.sortStageScores(stage.scores ?? []);

    return {
      stageDbId: stage.id,
      stageId,
      stageName: stage.stageName ?? null,
      totalLevels: stage.totalLevels,
      createdAt: stage.createdAt,
      scores: sortedScores,
    };
  }

  private sortStageScores(scores: StageScoreSummary[]): StageScoreSummary[] {
    return scores
      .filter((score) => Boolean(score?.isComplete ?? true))
      .map((score) => ({
        ...score,
        totalScore: Number(score.totalScore) || 0,
        totalTime:
          typeof score.totalTime === "number"
            ? score.totalTime
            : score.totalTime
              ? Number(score.totalTime)
              : null,
        totalDistance:
          typeof score.totalDistance === "number"
            ? score.totalDistance
            : score.totalDistance
              ? Number(score.totalDistance)
              : null,
        completedLevels: Number(score.completedLevels) || 0,
        levels: Array.isArray(score.levels)
          ? score.levels.map((level) => ({
              ...level,
              score:
                typeof level.score === "number"
                  ? level.score
                  : level.score
                    ? Number(level.score)
                    : null,
              time:
                typeof level.time === "number"
                  ? level.time
                  : level.time
                    ? Number(level.time)
                    : null,
              distance:
                typeof level.distance === "number"
                  ? level.distance
                  : level.distance
                    ? Number(level.distance)
                    : null,
            }))
          : undefined,
      }))
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        const aTime = a.totalTime ?? Number.POSITIVE_INFINITY;
        const bTime = b.totalTime ?? Number.POSITIVE_INFINITY;
        if (aTime !== bTime) {
          return aTime - bTime;
        }
        const aUser = a.username ?? "";
        const bUser = b.username ?? "";
        return aUser.localeCompare(bUser);
      });
  }

  private async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  private async request<T>(endpoint: string, init: RequestInit): Promise<T> {
    const headers = new Headers(init.headers as HeadersInit | undefined);
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new ApiError(message, response.status);
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    // If no JSON body is expected, return undefined as T to avoid parsing errors.
    return undefined as unknown as T;
  }

  private async extractErrorMessage(response: Response): Promise<string> {
    try {
      const data = await response.json();
      if (typeof data === "string") {
        return data;
      }
      if (data?.error) {
        return String(data.error);
      }
      if (data?.message) {
        return String(data.message);
      }
    } catch (error) {
      // ignore JSON parsing errors
    }

    return response.statusText || "Request failed";
  }

  getStageLeaderboardsSnapshot(): StageLeaderboard[] | null {
    if (!this.stageLeaderboardsCache) {
      return null;
    }

    return this.stageLeaderboardsCache.map((leaderboard) => ({
      ...leaderboard,
      scores: leaderboard.scores.map((score) => ({
        ...score,
        levels: score.levels?.map((level) => ({ ...level })),
      })),
    }));
  }

  getStageLeaderboardSnapshot(stageId: string): StageLeaderboard | null {
    const cached = this.stageLeaderboardCacheById.get(stageId);
    if (!cached) {
      return null;
    }

    return {
      ...cached,
      scores: cached.scores.map((score) => ({
        ...score,
        levels: score.levels?.map((level) => ({ ...level })),
      })),
    };
  }

  getOverallLeaderboardSnapshot(): OverallScoreSummary[] | null {
    if (!this.overallLeaderboardCache) {
      return null;
    }

    return this.overallLeaderboardCache.map((entry) => ({ ...entry }));
  }
}
