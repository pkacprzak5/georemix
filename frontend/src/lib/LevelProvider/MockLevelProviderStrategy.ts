import { LevelProviderStrategy } from './LevelProviderStrategy';
import type { LevelInfo } from '@/types/game';

/**
 * Mock implementation of LevelProviderStrategy using static data
 * This is useful for development and testing
 */
export class MockLevelProviderStrategy extends LevelProviderStrategy {
  private static readonly LEVELS: LevelInfo[] = [
    {
      id: '164095525622425',
      name: 'Cyberpunk City',
      isDarkMode: false,
      photoUrl: 'https://example.com/eiffel-tower.jpg',
      targetLocation: {
        lat: 48.8584,
        lng: 2.2945,
        name: 'Kraków',
        country: 'Poland'
      }
    },
  ];

  async getLevel(id: string): Promise<LevelInfo | null> {
    // Simulate network delay for realism
    await this.delay(100);

    const foundLevel = MockLevelProviderStrategy.LEVELS.find(level => level.id === id);
    return foundLevel || null;
  }

  async getNextLevel(currentLevelId?: string): Promise<LevelInfo | null> {
    // Simulate network delay for realism
    await this.delay(100);

    if (!currentLevelId) {
      // If no current level, return the first level
      return MockLevelProviderStrategy.LEVELS[0] || null;
    }

    const currentIndex = MockLevelProviderStrategy.LEVELS.findIndex(
      level => level.id === currentLevelId
    );

    if (currentIndex === -1) {
      // Current level not found, return first level
      return MockLevelProviderStrategy.LEVELS[0] || null;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= MockLevelProviderStrategy.LEVELS.length) {
      // No more levels available
      return null;
    }

    return MockLevelProviderStrategy.LEVELS[nextIndex];
  }

  async getInitialLevel(): Promise<LevelInfo> {
    // Simulate network delay for realism
    await this.delay(100);

    if (MockLevelProviderStrategy.LEVELS.length === 0) {
      throw new Error('No levels available');
    }

    return MockLevelProviderStrategy.LEVELS[0];
  }

  async getAllLevels(): Promise<LevelInfo[]> {
    // Simulate network delay for realism
    await this.delay(100);

    // Return a copy to prevent external modifications
    return [...MockLevelProviderStrategy.LEVELS];
  }

  /**
   * Get the total number of levels
   */
  getTotalLevels(): number {
    return MockLevelProviderStrategy.LEVELS.length;
  }

  /**
   * Check if a level exists
   */
  levelExists(id: string): boolean {
    return MockLevelProviderStrategy.LEVELS.some(level => level.id === id);
  }

  /**
   * Utility method to simulate network delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
