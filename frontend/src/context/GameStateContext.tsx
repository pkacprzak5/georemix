import React, { createContext, useContext, useMemo } from "react";
import { EventBridge } from "@/lib/EventBridge";
import { GameStateManager } from "@/lib/GameStateManager";
import { useNavigation } from "@/lib/navigation-system/NavigationProvider";
import { GroupName } from "@/lib/navigation-system/types";

interface GameStateContextType {
  eventBridge: EventBridge;
  gameStateManager: GameStateManager;
  startGameplay: () => void;
  endGameplay: () => void;
  navigateToNewGroup: (newGroup: GroupName) => void;
}

const GameStateContext = createContext<GameStateContextType | null>(null);

interface GameStateProviderProps {
  children: React.ReactNode;
}

export function GameStateProvider({ children }: GameStateProviderProps) {
  const eventBridge = useMemo(() => new EventBridge(), []);
  const gameStateManager = useMemo(() => new GameStateManager(eventBridge), []);
  const { showMenu, hideMenu, navigateToNewGroup } = useNavigation();

  function startGameplay() {
    hideMenu();
    eventBridge.emit('gameplayStarted', { timestamp: Date.now() });
  }

  function endGameplay() {
    showMenu();
    eventBridge.emit('gameplayEnded', { timestamp: Date.now() });
  }

  const contextValue = useMemo(
    () => ({
      eventBridge,
      gameStateManager,
      startGameplay,
      endGameplay,
      navigateToNewGroup,
    }),
    [eventBridge, gameStateManager]
  );

  return <GameStateContext.Provider value={contextValue}>{children}</GameStateContext.Provider>;
}

export function useGameState(): GameStateContextType {
  const context = useContext(GameStateContext);

  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
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
