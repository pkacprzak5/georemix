import type { LevelProviderStrategy } from "@/lib/LevelProvider/LevelProviderStrategy";
import { MockLevelProviderStrategy } from "@/lib/LevelProvider/MockLevelProviderStrategy";
import type { LevelInfo, LevelResult } from "@/types/game";
import { GameEvent, GameStage } from "@/types/game";
import type { EventBridge } from "./EventBridge";

export class GameStateManager {
  private _currentLevel: LevelInfo | null = null;
  private _nextLevel: LevelInfo | null = null;
  private _currentStage: GameStage = GameStage.LOADING;
  private _levelResults: LevelResult[] = [];
  private _gameLevelProvider: LevelProviderStrategy;

  // Mock data for development
  constructor(private _eventBridge: EventBridge) {
    this._gameLevelProvider = new MockLevelProviderStrategy();
  }

  // Getters
  get currentLevel(): LevelInfo | null {
    return this._currentLevel;
  }

  get nextLevel(): LevelInfo | null {
    return this._nextLevel;
  }

  get currentStage(): GameStage {
    return this._currentStage;
  }

  get levelResults(): LevelResult[] {
    return [...this._levelResults];
  }

  // Setters
  setCurrentLevel(level: LevelInfo | null): void {
    this._currentLevel = level;
  }

  setNextLevel(level: LevelInfo | null): void {
    this._nextLevel = level;
  }

  setCurrentStage(stage: GameStage): void {
    this._currentStage = stage;
  }

  async getNextLevelInfo(): Promise<LevelInfo | null> {
    if (!this._nextLevel) {
      return null;
    }

    const nexLevel = await this._gameLevelProvider.getNextLevel();
    return nexLevel;
  }

  // Utility methods
  resetGame(): void {
    this._levelResults = [];
    this._eventBridge.emit(GameEvent.STAGE_CHANGED, { stage: GameStage.MENU_SCREEN });
    this._currentStage = GameStage.LOADING;
  }
}
