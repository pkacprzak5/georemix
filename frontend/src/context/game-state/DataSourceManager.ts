import { BASE_URL } from "@/constants";
import type { PlayerResults } from "@/types/project";

const LEADERBOARD_CACHE_KEY = "leaderboard-cache";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export interface RoundLeaderboard {
  roundNumber: number;
  results: PlayerResults[];
  lastUpdated: number;
}

export interface LeaderboardCache {
  rounds: RoundLeaderboard[];
}

// Backend response types
interface BackendRoundScore {
  id: number;
  playerId: number;
  username: string;
  roundNumber: number;
  minDistance: number | null;
  score: number | null;
  time: number | null;
  createdAt: string;
}

interface RoundScoresResponse {
  roundNumber: number;
  scores: BackendRoundScore[];
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type UsernameAvailabilityResponse = {
  username: string;
  available: boolean;
};

const JSON_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

export class DataSourceManager {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/?$/, "");
  }

  // Check if username is available
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

  // Create a new player
  async createPlayer(username: string): Promise<PlayerResults> {
    const trimmed = username.trim();
    if (!trimmed) {
      throw new Error("Username is required");
    }

    const response = await this.request<PlayerResults>("/players", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ username: trimmed }),
    });

    return response;
  }

  // Submit round score
  async submitRoundScore(data: {
    username: string;
    roundNumber: number;
    score?: number;
    time?: number;
    minDistance?: number;
  }): Promise<PlayerResults> {
    const backendScore = await this.request<BackendRoundScore>("/scores/round", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });

    // Transform backend data to match PlayerResults format
    return {
      playerName: backendScore.username,
      totalScore: backendScore.score || 0,
      totalTime: backendScore.time || 0,
      closestCall: backendScore.minDistance || 0,
    };
  }

  // Get scores for a specific round
  async getRoundScores(roundNumber: number): Promise<PlayerResults[]> {
    const response = await this.get<RoundScoresResponse>(`/scores/rounds/${roundNumber}`);
    const scores = response?.scores || [];

    // Transform backend data to match RoundScore/PlayerResults format
    return scores.map(score => ({
      // Map to PlayerResults fields
      playerName: score.username,
      totalScore: score.score || 0,
      totalTime: score.time || 0,
      closestCall: score.minDistance || 0,
    }));
  }

  // Cache management methods

  /**
   * Get cached leaderboard data from localStorage
   */
  getLeaderboardCache(): LeaderboardCache {
    try {
      const cached = localStorage.getItem(LEADERBOARD_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error("Error reading leaderboard cache:", error);
    }
    
    // Return empty cache
    return { rounds: [] };
  }

  /**
   * Save leaderboard data to localStorage cache
   */
  private saveLeaderboardCache(cache: LeaderboardCache): void {
    try {
      localStorage.setItem(LEADERBOARD_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error("Error saving leaderboard cache:", error);
    }
  }

  /**
   * Update cache for a specific round
   */
  async updateRoundCache(roundNumber: number): Promise<void> {
    const results = await this.getRoundScores(roundNumber);
    const cache = this.getLeaderboardCache();
    
    // Sort results by score (descending), then time (ascending)
    const sortedResults = results
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return a.totalTime - b.totalTime;
      })
      .slice(0, 10); // Keep only top 10
    
    // Update or add round data
    const existingIndex = cache.rounds.findIndex(r => r.roundNumber === roundNumber);
    const roundData: RoundLeaderboard = {
      roundNumber,
      results: sortedResults,
      lastUpdated: Date.now(),
    };
    
    if (existingIndex >= 0) {
      cache.rounds[existingIndex] = roundData;
    } else {
      cache.rounds.push(roundData);
    }
    
    this.saveLeaderboardCache(cache);
  }

  /**
   * Update cache for all rounds (1, 2, 3)
   */
  async updateAllRoundsCache(): Promise<void> {
    const rounds = [1, 2, 3];
    await Promise.all(rounds.map(round => this.updateRoundCache(round)));
  }

  /**
   * Check if cache for a round needs refresh
   */
  needsCacheRefresh(roundNumber: number): boolean {
    const cache = this.getLeaderboardCache();
    const roundData = cache.rounds.find(r => r.roundNumber === roundNumber);
    
    if (!roundData) {
      return true;
    }
    
    const timeSinceUpdate = Date.now() - roundData.lastUpdated;
    return timeSinceUpdate > CACHE_EXPIRY_MS;
  }

  /**
   * Get leaderboard for a specific round from cache
   */
  getRoundLeaderboard(roundNumber: number): PlayerResults[] {
    const cache = this.getLeaderboardCache();
    const roundData = cache.rounds.find(r => r.roundNumber === roundNumber);
    return roundData?.results || [];
  }

  /**
   * Get all rounds leaderboard data from cache
   */
  getAllRoundsLeaderboard(): RoundLeaderboard[] {
    const cache = this.getLeaderboardCache();
    return cache.rounds;
  }

  private async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  private async request<T>(endpoint: string, init: { method?: string; headers?: Record<string, string>; body?: string }): Promise<T> {
    const headers = new Headers(init.headers);
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
}
