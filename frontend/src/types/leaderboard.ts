import type { PlayerResults } from "@/types/project";
export interface LevelScoreSummary {
  id: number;
  stageScoreId: number;
  levelId: string;
  levelName?: string | null;
  order?: number | null;
  score?: number | null;
  time?: number | null;
  distance?: number | null;
  createdAt: string;
}

export interface StageScoreSummary {
  id: number;
  playerId: number;
  username: string | null;
  stageId: string | null;
  stageName?: string | null;
  totalScore: number;
  totalTime?: number | null;
  totalDistance?: number | null;
  completedLevels: number;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  levels?: LevelScoreSummary[];
}

export interface StageLeaderboard {
  stageDbId?: number;
  stageId: string;
  stageName?: string | null;
  totalLevels?: number | null;
  createdAt: string;
  scores: StageScoreSummary[];
}

export interface OverallScoreSummary {
  username: string;
  overallScore: number;
  overallTime: number;
  overallDistance: number;
  stagesCompleted: number;
  lastPlayedAt?: string | null;
}

export interface PlayerScoreResponse {
  player: {
    id: number;
    username: string;
    createdAt: string;
    stagesCompleted: number;
    overallScore: number;
    overallTime: number;
    overallDistance: number;
  };
  scores: StageScoreSummary[];
}

export interface RoundLeaderboard {
  roundNumber: number;
  results: PlayerResults[];
  lastUpdated: number;
}