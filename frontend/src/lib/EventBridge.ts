import type { GameEvent } from '@/types/game';

type EventCallback = (data: unknown) => void;

export class EventBridge {
  private listeners: Map<GameEvent, Set<EventCallback>> = new Map();

  /**
   * Register an event listener for a specific game event
   */
  on(event: GameEvent, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Emit an event with data to all registered listeners
   */
  emit(event: GameEvent, data: unknown): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for a specific event
   */
  off(event: GameEvent): void {
    this.listeners.delete(event);
  }

  /**
   * Remove all listeners for all events
   */
  removeAllListeners(): void {
    this.listeners.clear();
  }

  /**
   * Get all registered events
   */
  getRegisteredEvents(): GameEvent[] {
    return Array.from(this.listeners.keys());
  }
}
