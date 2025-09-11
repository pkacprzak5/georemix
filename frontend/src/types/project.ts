export interface MapPosition {
  lat: number;
  lng: number;
}

export type GameEvent =
  | 'gameplayStarted'
  | 'gameplayEnded'
  | 'loadingFinished';


export type LevelPhoto = {
  lat: number;
  lng: number;
  name: string;
};

export type LevelInfo = {
  levelName: string;
  levelId: string;
  level_theme: "light" | "dark";
  level_photos: LevelPhoto[];
};

export type LevelResult = {
  levelId: string;
  score: number;
  timeTaken: number;
}

export type RoundInfo = LevelInfo[];

export const ROUNDS: RoundInfo[] = [
  [
    {
      levelName: "Cyberpunk City",
      levelId: "cyberpunk_city",
      level_theme: "light",
      level_photos: [],
    },
  ],
];
