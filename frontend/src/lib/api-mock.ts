/** Temporary structure for player results. */
export type PlayerResults = {
  playerName: string;
  totalTime: number;
  totalScore: number;
  closestCall: number;
};

/** Temporary structure for leaderboard results. */
export type Leaderboard = Array<{
  roundNumber: number;
  results: Array<PlayerResults>;
}>;

export const mockLeaderboard: Leaderboard = (() => {
  // IIFE that loads leaderboard data from local storage
  // or creates a new one if it doesn't exist.
  try {
    return JSON.parse(localStorage.getItem("leaderboard-mock") ?? "");
  } catch {
    return [
      { roundNumber: 1, results: [] },
      { roundNumber: 2, results: [] },
      { roundNumber: 3, results: [] },
    ];
  }
})();
