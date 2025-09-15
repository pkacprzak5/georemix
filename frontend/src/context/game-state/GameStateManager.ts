import { type LevelInfo, type LevelResult, type LevelResultInfo, type MapCoordinates } from "@/types/project";
import { BASE_URL } from "@/constants";

// TODO:  I truly grieve that this is not a zustand store.
export class GameStateManager {
  // TODO: remove mock static level / round numbers
  private _currentRoundNumber: number | null = null;
  private _currentLevelNumber: number | null = null;
  private _levels: LevelInfo[] = []
  private _levelResults: LevelResult[] = [];
  private _currentTheme: "light" | "dark" = "light";
  private _playerName: string = "";

  // Current Gameplay
  private _currentCoordinates: MapCoordinates | null = null;
  private _submittedCoordinates: MapCoordinates | null = null;
  // TODO UPDATE TO NOT BE CONSTANT VALUE
  private _timeTaken: number | null = 12;
  private _currentDistance: number | null = null;

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

  get numberOfLevels(): number {
    if (this._levels.length === 0) {
      throw new Error("No levels loaded");
    }
    return this._levels.length;
  }

  get levelResult(): LevelResultInfo {
    if (
      !this._currentDistance ||
      !this._timeTaken ||
      !this._currentCoordinates ||
      !this._submittedCoordinates
    ) {
      throw new Error("No distance or no time taken")
    }

    return {
      distance: this._currentDistance,
      timeTaken: this._timeTaken,
      answerPosition: this._currentCoordinates,
      submittedPosition: this._submittedCoordinates,
    }
  }

  setTimeTaken(time: number) {
    this._timeTaken = time;
  }

  setPlayerName(name: string) {
    this._playerName = name;
  }

  setCoordinates(coordinates: MapCoordinates) {
    this._currentCoordinates = coordinates;
  }

  resetGameplayeInfo() {
    this._timeTaken = null;
    this._currentCoordinates = null;
  }

  calculateResult(submittedPosition: MapCoordinates) {
    // Calculate straight-line (Haversine) distance between submittedPosition and _currentCoordinates
    if (!this._currentCoordinates) {
      throw new Error("No current coordinates set");
    }

    this._submittedCoordinates = submittedPosition;

    const toRad = (value: number) => value * Math.PI / 180;
    const { lng: lng1, lat: lat1 } = this._currentCoordinates;
    const { lng: lng2, lat: lat2 } = submittedPosition;

    const R = 6371e3; // Earth radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lng2 - lng1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // in meters

    this._currentDistance = distance;
  }

  async loadRound(roundNumber: number | null) {
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
        this._currentRoundNumber = roundNumber;
        const metadataArray = data;
        this._levels = metadataArray.map((level: LevelInfo, i: number) => ({
          initialNode: level.initialNode,
          theme: level.theme,
          name: level.name,
          thumbnail: level.thumbnail,
          number: i + 1
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
