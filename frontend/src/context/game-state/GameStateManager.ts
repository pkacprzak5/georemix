import {
  type Colors,
  type LevelInfo,
  type LevelResultInfo,
  type MapCoordinates,
  DEFAULT_COLORS,
} from "@/types/project";
import { BASE_URL } from "@/constants";

// TODO:  I truly grieve that this is not a zustand store.
export class GameStateManager {
  // TODO: remove mock static level / round numbers
  private _currentRoundNumber: number | null = null;
  private _currentLevelNumber: number | null = null;
  private _levels: LevelInfo[] = [];
  private _levelResults: LevelResultInfo[] = [];
  private _currentTheme: "light" | "dark" = "light";
  private _currentColors: Colors = DEFAULT_COLORS;
  private _playerName: string = "";

  // Current Gameplay
  private _currentCoordinates: MapCoordinates | null = null;
  private _submittedCoordinates: MapCoordinates | null = null;
  // time taken in seconds
  private _timeTaken: number | null = 0;
  private _currentDistance: number | null = null;
  private _currentScore: number | null = null;

  // Result calculation factors
  private readonly _maxPoints: number = 5000;
  private readonly _distanceFactor: number = 2_000_000; // 2km
  private readonly _timeFactor: number = 120;
  private readonly _timeCap: number = 10; // 10secs
  private readonly _metersCap: number = 50;

  constructor() { }

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

  get colorTheme(): Colors {
    return this._currentColors;
  }

  get currentLevelInfo(): LevelInfo {
    if (this._currentLevelNumber === null) {
      throw new Error("No current level set");
    }
    if (this._levels.length === 0) {
      throw new Error("No levels loaded");
    }
    return this._levels[this._currentLevelNumber];
  }

  get numberOfLevels(): number {
    if (this._levels.length === 0) {
      throw new Error("No levels loaded");
    }
    return this._levels.length;
  }

  get levelResult(): LevelResultInfo {
    if (this._currentLevelNumber === null) {
      throw new Error("No level set");
    }

    return this._levelResults[this._currentLevelNumber];
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

  calculateResult(submittedPosition: MapCoordinates) {
    // Calculate straight-line (Haversine) distance between submittedPosition and _currentCoordinates
    if (!this._currentCoordinates || this._timeTaken === null) {
      throw new Error("No current coordinates set");
    }

    if (this._currentLevelNumber === null) {
      throw new Error("No current level set");
    }

    this._submittedCoordinates = submittedPosition;

    const toRad = (value: number) => (value * Math.PI) / 180;
    const { lng: lng1, lat: lat1 } = this._currentCoordinates;
    const { lng: lng2, lat: lat2 } = submittedPosition;

    const R = 6371e3; // Earth radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lng2 - lng1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // in meters
    this._currentDistance = distance;

    let distanceFactor: number;
    if (this._currentDistance <= this._metersCap) {
      distanceFactor = 1.0;
    } else {
      distanceFactor = Math.exp(-this._currentDistance / this._distanceFactor);
    }

    // --- Time contribution ---
    let timeFactor: number;
    if (this._timeTaken <= this._timeCap) {
      timeFactor = 1.0;
    } else {
      timeFactor = Math.exp(-(this._timeTaken - this._timeCap) / this._timeFactor);
    }

    const levelScore = Math.round(this._maxPoints * distanceFactor * timeFactor);

    this._currentScore = Math.max(0, levelScore);

    this._levelResults[this._currentLevelNumber] = {
      distance: this._currentDistance,
      timeTaken: this._timeTaken,
      answerPosition: this._currentCoordinates,
      submittedPosition: this._submittedCoordinates,
      score: this._currentScore,
    };
  }

  async loadRound(roundNumber: number | null) {
    if (!roundNumber) {
      throw new Error("No current round set");
    }

    return fetch(`${BASE_URL}/round${roundNumber}/metadata`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Round ${roundNumber} - Network response was not ok`);
        }
        return response.json();
      })
      .then((data) => {
        this._currentRoundNumber = roundNumber;
        const metadataArray = data;
        this._levels = metadataArray.map((level: LevelInfo, i: number) => ({
          initialNode: level.initialNode,
          theme: level.theme,
          name: level.name,
          thumbnail: level.thumbnail,
          number: i + 1,
          colors: level.colors,
        }));
        this.loadLevel(0);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }

  async loadLevel(levelNumber: number | null = this._currentLevelNumber) {
    if (levelNumber === null) {
      throw new Error("No current round set");
    }
    this._currentLevelNumber = levelNumber;
    const level = this._levels[levelNumber];
    this._currentTheme = level.theme;
    this._currentColors = level.colors;
  }

  loadNextLevel(): Promise<null> {
    return new Promise(() => {
      if (this._currentLevelNumber === null) {
        throw new Error("No current level set");
      }
      this._currentLevelNumber += 1;
      const level = this._levels[this._currentLevelNumber];
      this._currentTheme = level.theme;
    });
  }

  resetCurrentResultInfo() {
    this._currentCoordinates = null;
    this._submittedCoordinates = null;
    this._timeTaken = 0;
    this._currentDistance = null;
    this._currentScore = null;
  }

  resetAll() {
    this._currentRoundNumber = null;
    this._currentLevelNumber = null;
    this._levelResults = [];
    this._levels = [];
    this._currentColors = DEFAULT_COLORS;
    this._playerName = "";
    this._currentTheme = "light";
    this.resetCurrentResultInfo();
  }
}
