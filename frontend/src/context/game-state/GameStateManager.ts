import {
  type Colors,
  type LevelInfo,
  type LevelResultInfo,
  type MapCoordinates,
  type PlayerResults,
  DEFAULT_COLORS,
} from "@/types/project";
import { BASE_URL } from "@/constants";
import type { DataSourceManager } from "./DataSourceManager";

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

  /** Whether currently selected stage is finished. */
  private _isRoundFinished: boolean = false;

  // Current Gameplay
  private _currentCoordinates: MapCoordinates | null = null;
  private _submittedCoordinates: MapCoordinates | null = null;
  // time taken in seconds
  private _timeTaken: number | null = 0;
  private _currentDistance: number | null = null;
  private _currentScore: number | null = null;

  // Result calculation factors
  private readonly _maxPoints: number = 5000;
  private readonly _distanceFactor: number = 30_000_000; // 2km
  private readonly _timeFactor: number = 120;
  private readonly _timeCap: number = 10; // 10secs
  private readonly _metersCap: number = 50;

  constructor() { }

  // Getters

  get isRoundFinished(): boolean {
    return this._isRoundFinished;
  }

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

  get maxScore(): number {
    if(this._levels.length === 0) {
      throw new Error("No levels loaded");
    }
    return this._maxPoints * this._levels.length;
  }

  get allLevelResults(): LevelResultInfo[] {
    return this._levelResults;
  }

  get allLevels(): LevelInfo[] {
    return this._levels;
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
      distanceFactor = Math.exp(-10 * this._currentDistance / this._distanceFactor);
    }

  

    const levelScore = Math.round(this._maxPoints * distanceFactor);

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
    console.log(level.colors)
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
      this._currentColors = level.colors;
    });
  }

  resetCurrentResultInfo() {
    this._currentCoordinates = null;
    this._submittedCoordinates = null;
    this._timeTaken = 0;
    this._currentDistance = null;
    this._currentScore = null;
  }

  /** Uploads user's round results to the server and updates cache. */
  async submitRoundResults(dataSourceManager: DataSourceManager): Promise<void> {
    this._isRoundFinished = true;

    if (!this._playerName) {
      console.error("No player name set");
      return;
    }

    const roundResults = this.computeRoundResults();

    try {
      // Submit to backend
      await dataSourceManager.submitRoundScore({
        username: this._playerName,
        roundNumber: this.currentRoundNumber,
        score: roundResults.totalScore,
        time: roundResults.totalTime,
        minDistance: roundResults.closestCall,
      });

      // Update cache after successful submission
      await dataSourceManager.updateRoundCache(this.currentRoundNumber);
    } catch (error) {
      console.error("Error submitting round results:", error);
      throw error;
    }
  }

  /** Computes stats included in the leaderboard from finished round. */
  private computeRoundResults(): PlayerResults {
    // Reduce over level results and gather essential stats.
    const results: PlayerResults = this._levelResults.reduce(
      (prev, curr) => {
        return {
          ...prev,
          totalTime: prev.totalTime + curr.timeTaken,
          totalScore: prev.totalScore + curr.score,
          closestCall: Math.min(prev.closestCall, curr.distance),
        };
      },
      {
        playerName: this.playerName,
        totalTime: 0,
        totalScore: 0,
        closestCall: Infinity,
      } satisfies PlayerResults
    );

    return results;
  }

  resetAll() {
    this._isRoundFinished = false;
    this._currentRoundNumber = null;
    this._currentLevelNumber = null;
    this._levelResults = [];
    this._levels = [];
    this._currentColors = DEFAULT_COLORS;
    this._playerName = "";
    this._currentTheme = "light";
    this.resetCurrentResultInfo();
  }

  // Mock data initialization for testing/development
  initializeMockData() {
    this._currentRoundNumber = 1;
    this._currentLevelNumber = 4; // Set to last level (0-indexed, so level 5)
    this._playerName = "Test Player";
    
    // Mock levels data
    this._levels = [
      {
        initialNode: "mock-node-1",
        name: "Kraków - Rynek Główny",
        theme: "light",
        thumbnail: "level_1.jpg",
        number: 1,
        colors: DEFAULT_COLORS
      },
      {
        initialNode: "mock-node-2", 
        name: "Warszawa - Pałac Kultury",
        theme: "dark",
        thumbnail: "level_2.png",
        number: 2,
        colors: DEFAULT_COLORS
      },
      {
        initialNode: "mock-node-3",
        name: "Gdańsk - Długa Ulica", 
        theme: "light",
        thumbnail: "level_1.jpg",
        number: 3,
        colors: DEFAULT_COLORS
      },
      {
        initialNode: "mock-node-4",
        name: "Wrocław - Rynek",
        theme: "dark", 
        thumbnail: "level_2.png",
        number: 4,
        colors: DEFAULT_COLORS
      },
      {
        initialNode: "mock-node-5",
        name: "Poznań - Stary Rynek",
        theme: "light",
        thumbnail: "level_1.jpg", 
        number: 5,
        colors: DEFAULT_COLORS
      },
    ];

    // Mock level results for all completed levels
    this._levelResults = [
      {
        distance: 245,
        timeTaken: 23,
        answerPosition: { lat: 50.0619, lng: 19.9368 },
        submittedPosition: { lat: 50.0643, lng: 19.9401 },
        score: 4850,
      },
      {
        distance: 1250,
        timeTaken: 35,
        answerPosition: { lat: 52.2297, lng: 21.0122 },
        submittedPosition: { lat: 52.2403, lng: 21.0189 },
        score: 3200,
      },
      {
        distance: 680,
        timeTaken: 28,
        answerPosition: { lat: 54.3520, lng: 18.6466 },
        submittedPosition: { lat: 54.3598, lng: 18.6523 },
        score: 4100,
      },
      {
        distance: 420,
        timeTaken: 31,
        answerPosition: { lat: 51.1079, lng: 17.0385 },
        submittedPosition: { lat: 51.1123, lng: 17.0428 },
        score: 4250,
      },
      {
        distance: 890,
        timeTaken: 42,
        answerPosition: { lat: 52.4064, lng: 16.9252 },
        submittedPosition: { lat: 52.4156, lng: 16.9341 },
        score: 3750,
      },
    ];

    // Set current coordinates and other state for the current level
    this._currentCoordinates = { lat: 52.4064, lng: 16.9252 };
    this._submittedCoordinates = { lat: 52.4156, lng: 16.9341 };
    this._timeTaken = 42;
    this._currentDistance = 890;
    this._currentScore = 3750;
  }
}
