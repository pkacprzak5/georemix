import React, { createContext, useContext, useMemo } from 'react';
import { EventBridge } from '@/lib/EventBridge';
import { GameStateManager } from '@/lib/GameStateManager';

interface GameStateContextType {
  eventBridge: EventBridge;
  gameStateManager: GameStateManager;
}

const GameStateContext = createContext<GameStateContextType | null>(null);

interface GameStateProviderProps {
  children: React.ReactNode;
}

export function GameStateProvider({ children }: GameStateProviderProps) {
  const eventBridge = useMemo(() => new EventBridge(), []);
  const gameStateManager = useMemo(() => new GameStateManager(eventBridge), []);

  const contextValue = useMemo(() => ({
    eventBridge,
    gameStateManager
  }), [eventBridge, gameStateManager]);

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState(): GameStateContextType {
  const context = useContext(GameStateContext);

  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }

  return context;
}

// Convenience hooks for specific functionality
export function useEventBridge(): EventBridge {
  const { eventBridge } = useGameState();
  return eventBridge;
}

export function useGameStateManager(): GameStateManager {
  const { gameStateManager } = useGameState();
  return gameStateManager;
}
