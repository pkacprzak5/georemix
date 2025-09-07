// Game-related type definitions

export interface LevelInfo {
  id: string;
  name: string;
  isDarkMode: boolean;
  photoUrl: string;
  targetLocation: {
    lat: number;
    lng: number;
    name: string;
    country: string;
  };
}

export interface LevelResult {
  levelId: string;
  levelName: string;
  score: number;
  accuracy: number; // distance in meters
  timeTaken: number; // in seconds
  stage: GameStage;
}

export interface GameResult {
    totalScore: number
    totalTime: number
}

// Event types for EventBridge
export enum GameStage {
  GAMEPLAY = 'gameplay',
  LOADING = 'loading',
  MENU_SCREEN = 'menuScreen',
  PAUSE_SCREEN = 'pauseScreen',
  LEVEL_RESULT_SCREEN = 'levelResultScreen',
  NEXT_LEVEL_SCREEN = 'nextLevelScreen',
  FINAL_SCREEN = 'finalScreen',
}

export enum GameEvent {
  STAGE_CHANGED = 'stageChanged',
  ANSWER_SUBMITTED = 'answerSubmitted',
}

export interface GameEventData {
  [GameEvent.STAGE_CHANGED]: {stage: GameStage},
  [GameEvent.ANSWER_SUBMITTED]: {answer: string}
}