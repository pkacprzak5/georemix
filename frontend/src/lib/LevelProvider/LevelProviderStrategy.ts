import type { LevelInfo } from '@/types/game';

/**
 * Abstract strategy for providing level data
 * This allows different implementations (mock, API, local storage, etc.)
 */
export abstract class LevelProviderStrategy {
  /**
   * Get a specific level by ID
   * @param id - The level ID to retrieve
   * @returns Promise resolving to LevelInfo or null if not found
   */
  abstract getLevel(id: string): Promise<LevelInfo | null>;

  /**
   * Get the next level based on current progress
   * @param currentLevelId - The current level ID (optional)
   * @returns Promise resolving to LevelInfo or null if no next level
   */
  abstract getNextLevel(currentLevelId?: string): Promise<LevelInfo | null>;

  /**
   * Get the initial level for new players
   * @returns Promise resolving to LevelInfo
   */
  abstract getInitialLevel(): Promise<LevelInfo>;

  /**
   * Get all available levels
   * @returns Promise resolving to array of LevelInfo
   */
  abstract getAllLevels(): Promise<LevelInfo[]>;
}
