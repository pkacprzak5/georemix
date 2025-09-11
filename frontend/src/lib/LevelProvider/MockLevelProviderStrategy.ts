import { LevelProviderStrategy } from "./LevelProviderStrategy";
import type { LevelInfo } from "@/lib/constants";

/**
 * Mock implementation of LevelProviderStrategy using static data
 * This is useful for development and testing
 */
export class MockLevelProviderStrategy extends LevelProviderStrategy {
  private static readonly LEVELS: LevelInfo[] = [
    {
      levelName: "Cyberpunk City",
      levelId: "164095525622425",
      level_theme: "light",
      level_photos: [
        {
          lat: 48.8584,
          lng: 2.2945,
          name: "Kraków",
        }
      ],
    },
  ];

  async getLevel(id: string): Promise<null> {
    // Simulate network delay for realism
    await this.delay(1000);
    return null;

    // const foundLevel = MockLevelProviderStrategy.LEVELS.find(level => level.id === id);
    // return foundLevel || null;
  }

  async loadNextLevelInfo(currentLevelId?: string): Promise<null> {
    // Simulate network delay for realism
    await this.delay(1000);

    return null;
  }

  /**
   * Utility method to simulate network delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
