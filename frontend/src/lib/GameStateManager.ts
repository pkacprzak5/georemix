import type { LevelProviderStrategy } from "@/lib/LevelProvider/LevelProviderStrategy";
import { MockLevelProviderStrategy } from "@/lib/LevelProvider/MockLevelProviderStrategy";
import type { EventBridge } from "./EventBridge";
import { ROUNDS, type LevelInfo, type LevelResult, type RoundInfo } from "./constants";

export class GameStateManager {
  private _currentRoundNumber: number | null = null;
  private _currentLevelNumber: number | null = null;
  private _levelResults: LevelResult[] = [];
  private _gameLevelProvider: LevelProviderStrategy;
  private _currentTheme: "light" | "dark" = "light";

  // Mock data for development
  constructor(private _eventBridge: EventBridge) {
    this._gameLevelProvider = new MockLevelProviderStrategy();
  }

  // Getters
  get currentRound(): RoundInfo {
    if (this._currentRoundNumber === null) {
      throw new Error("No current round set");
    }
    return ROUNDS[this._currentRoundNumber];
  }

  get gameTheme(): "light" | "dark" {
    return this._currentTheme;
  }

  get currentLevelInfo(): LevelInfo {
    if (this._currentLevelNumber === null) {
      throw new Error("No current level set");
    }
    return this.currentRound[this._currentLevelNumber];
  }

  getLevelInfo(i: number): LevelInfo {
    const currentLevelInfo = this.currentRound[i]
    if (!currentLevelInfo) {
      throw new Error("No level info found for index " + i);
    }
    return currentLevelInfo;
  }

  get currentLevelNumber(): number | null {
    return this._currentLevelNumber;
  }

  get currentLevelResult(): LevelResult[] {
    if (this._currentLevelNumber === null) {
      throw new Error("No current level set");
    }
    return [this._levelResults[this._currentLevelNumber]];
  }

  setCurrentRound(round: number): void {
    this._currentRoundNumber = round;
  }

  loadNextLevel(): Promise<null> {
    return new Promise((resolve) => {
      

      // Async function to fetch the next level info
      // The LevelProviderStrategy should somehow handle passing
      // the level needed info to the game
      const nextLevelNumber = (this._currentLevelNumber ?? -1) + 1;
      this._gameLevelProvider.loadNextLevelInfo(this.getLevelInfo(nextLevelNumber).levelId).then(() => {
        this._currentLevelNumber = nextLevelNumber;
        this._currentTheme = this.currentLevelInfo.level_theme;
        resolve(null);
      });
    });
  }

  setLevelResult(result: LevelResult): void {
    if (this._currentLevelNumber === null) {
      throw new Error("No current level set");
    }
    this._levelResults[this._currentLevelNumber] = result;
  }

  resetAll() {
    this._currentRoundNumber = null;
    this._currentLevelNumber = null;
    this._levelResults = [];
  }

}
