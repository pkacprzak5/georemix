export interface MapPosition {
  lat: number;
  lng: number;
}

export type GameEvent =
  | 'gameplayStarted'
  | 'gameplayEnded'
  | 'loadingFinished';
