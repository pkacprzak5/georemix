import type { PlayerResults } from "@/types/project";
import { BASE_URL } from "@/constants";

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

/**
 * Get cached leaderboard data from localStorage
 */
export function getLeaderboardCache(): LeaderboardCache {
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
export function saveLeaderboardCache(cache: LeaderboardCache): void {
  try {
    localStorage.setItem(LEADERBOARD_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error saving leaderboard cache:", error);
  }
}

/**
 * Fetch round scores from backend and transform to PlayerResults format
 */
async function fetchRoundScores(roundNumber: number): Promise<PlayerResults[]> {
  try {
    const response = await fetch(`${BASE_URL}/scores/rounds/${roundNumber}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch round ${roundNumber} scores`);
    }
    
    const data = await response.json();
    const scores = data.scores || [];
    
    // Transform backend data to PlayerResults format
    return scores.map((score: { username: string; score: number | null; time: number | null; minDistance: number | null }) => ({
      playerName: score.username,
      totalScore: score.score || 0,
      totalTime: score.time || 0,
      closestCall: score.minDistance || 0,
    }));
  } catch (error) {
    console.error(`Error fetching round ${roundNumber} scores:`, error);
    return [];
  }
}

/**
 * Update cache for a specific round
 */
export async function updateRoundCache(roundNumber: number): Promise<void> {
  const results = await fetchRoundScores(roundNumber);
  const cache = getLeaderboardCache();
  
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
  
  saveLeaderboardCache(cache);
}

/**
 * Update cache for all rounds (1, 2, 3)
 */
export async function updateAllRoundsCache(): Promise<void> {
  const rounds = [1, 2, 3];
  await Promise.all(rounds.map(round => updateRoundCache(round)));
}

/**
 * Check if cache for a round needs refresh
 */
export function needsCacheRefresh(roundNumber: number): boolean {
  const cache = getLeaderboardCache();
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
export function getRoundLeaderboard(roundNumber: number): PlayerResults[] {
  const cache = getLeaderboardCache();
  const roundData = cache.rounds.find(r => r.roundNumber === roundNumber);
  return roundData?.results || [];
}

/**
 * Get all rounds leaderboard data from cache
 */
export function getAllRoundsLeaderboard(): RoundLeaderboard[] {
  const cache = getLeaderboardCache();
  return cache.rounds;
}
