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
  | "closeMapButtonClicked";

export type LevelPhoto = {
  lat: number;
  lng: number;
  name: string;
};

export type LevelInfo = {
  initialNode: string;
  name: string;
  theme: "light" | "dark";
  thumbnail: string;
  number: number;
};

export type LevelResult = {
  levelId: string;
  score: number;
  timeTaken: number;
};

export type RoundInfo = LevelInfo[];

export type LevelResultInfo = {
  timeTaken: number;
  distance: number;
  submittedPosition: MapCoordinates;
  answerPosition: MapCoordinates;
  score: number;
};
