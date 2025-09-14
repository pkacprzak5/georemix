import type { EventBridge } from "./EventBridge";
import { ROUNDS, type LevelInfo, type LevelResult, type RoundInfo } from "@/types/project";

// TODO:  I truly grieve that this is not a zustand store.
export class GameStateManager {
  private _currentRoundNumber: number | null = null;
  private _currentLevelNumber: number | null = null;
  private _levelResults: LevelResult[] = [];
  private _currentTheme: "light" | "dark" = "light";
  private _playerName: string = "";
  private _selectedRound: number | null = null;

  // Mock data for development
  constructor(private _eventBridge: EventBridge) {}

  // Getters
  get currentRound(): RoundInfo {
    if (this._currentRoundNumber === null) {
      throw new Error("No current round set");
    }
    return ROUNDS[this._currentRoundNumber];
  }

  get playerName(): string {
    return this._playerName;
  }

  set playerName(name: string) {
    this._playerName = name;
  }

  get selectedRound(): number | null {
    return this._selectedRound;
  }

  set selectedRound(round: number | null) {
    this._selectedRound = round;
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
    const currentLevelInfo = this.currentRound[i];
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
    return new Promise(() => {
      // Async function to fetch the next level info
      // The LevelProviderStrategy should somehow handle passing
      // the level needed info to the game
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
