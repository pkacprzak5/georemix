import { type LevelInfo, type LevelResult } from "@/types/project";
import { BASE_URL } from "@/constants";

// TODO:  I truly grieve that this is not a zustand store.
export class GameStateManager {
  // TODO: remove mock static level / round numbers
  private _currentRoundNumber: number | null = 1;
  private _currentLevelNumber: number | null = 1;
  private _levels: LevelInfo[] = []
  private _levelResults: LevelResult[] = [];
  private _currentTheme: "light" | "dark" = "light";
  private _playerName: string = "";


  // Getters
  get currentRoundNumber(): number {
    if (this._currentRoundNumber === null) {
      throw new Error("No current round set");
    }
    return this._currentRoundNumber;
  }

  get playerName(): string {
    return this._playerName;
  }

  set playerName(name: string) {
    this._playerName = name;
  }

  get gameTheme(): "light" | "dark" {
    return this._currentTheme;
  }

  get currentLevelInfo(): LevelInfo {
    if (this._currentLevelNumber === null) {
      throw new Error("No current level set");
    }
    if (this._levels.length === 0) {
      throw new Error("No levels loaded");
    }

    return this._levels[this._currentLevelNumber]
  }

  async loadRound(roundNumber: number | null = this._currentRoundNumber) {
    if (!roundNumber) {
      throw new Error("No current round set");
    }

    return fetch(`${BASE_URL}/round${roundNumber}/metadata`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Round ${roundNumber} - Network response was not ok`);
        }
        return response.json();
      })
      .then(data => {
        this._currentLevelNumber = 0;
        const metadataArray = data;
        this._levels = metadataArray.map((level: LevelInfo, i: number) => ({
          initialNode: level.initialNode,
          theme: level.theme,
          name: level.name,
          thumbnail: level.thumbnail,
          number: i+1
        }))

      })
      .catch(error => {
        console.error('Fetch error:', error);
      });
  }

  async loadLevel(levelNumber: number | null = this._currentLevelNumber) {
    if (!levelNumber) {
      throw new Error("No current round set");
    }
    const level = this._levels[levelNumber]
    this._currentTheme = level.theme;
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
