export interface MapCoordinates {
  lat: number;
  lng: number;
}

export type GameEvent =
  | "viewerLoaded"
  | "gameStarted"
  | "resultSubmitted"
  | "gamePaused"
  | "gameUnpaused"
  | "openMapButtonClicked"
  | "closeMapButtonClicked"
  | "gameplayLeft";

export type LevelPhoto = {
  lat: number;
  lng: number;
  name: string;
};

export const DEFAULT_COLORS = {
  background: "#eaf7cf",
  main: "#77b900",
};
export interface Colors {
  background: string;
  main: string;
}

export type LevelInfo = {
  initialNode: string;
  name: string;
  theme: "light" | "dark";
  thumbnail: string;
  number: number;
  colors: Colors;
};

export type RoundInfo = LevelInfo[];

export type LevelResultInfo = {
  timeTaken: number;
  distance: number;
  submittedPosition: MapCoordinates;
  answerPosition: MapCoordinates;
  score: number;
};

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
