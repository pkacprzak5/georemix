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
  abstract getLevel(id: string): Promise<null>;

  /**
   * Get the next level based on current progress
   * @param currentLevelId - The current level ID (optional)
   * @returns Promise resolving to LevelInfo or null if no next level
   */
  abstract loadNextLevelInfo(currentLevelId?: string): Promise<null>;

}
