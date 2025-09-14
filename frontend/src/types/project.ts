export interface MapCoordinates {
  lat: number;
  lng: number;
}

export type GameEvent = "gameplayStarted" | "gameplayEnded" | "loadingFinished" | "locationUpdate";

export type LevelPhoto = {
  lat: number;
  lng: number;
  name: string;
};

export type LevelInfo = {
  initialNode: string,
  name: string;
  theme: "light" | "dark";
  thumbnail: string,
  number: number
};

export type LevelResult = {
  levelId: string;
  score: number;
  timeTaken: number;
};

export type RoundInfo = LevelInfo[];