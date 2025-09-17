import React, { createContext, useContext, useMemo } from "react";
import { EventBridge } from "@/context/game-state/EventBridge";
import { GameStateManager } from "@/context/game-state/GameStateManager";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import type { ModuleId } from "@/lib/navigation-system/types";
import ThemeManager from "@/context/game-state/ThemeManager";

interface GameStateContextType {
  eventBridge: EventBridge;
  gameStateManager: GameStateManager;
  navigateToNewGroup: (newGroup: ModuleId) => void;
}

const GameStateContext = createContext<GameStateContextType | null>(null);

interface GameStateProviderProps {
  children: React.ReactNode;
}

export function GameStateProvider({ children }: GameStateProviderProps) {
  const themeManager = useMemo(() => new ThemeManager(), []);
  const eventBridge = useMemo(() => new EventBridge(), []);
  const gameStateManager = useMemo(() => new GameStateManager(themeManager), []);
  const { navigateToNewGroup } = useNavigation();

  const contextValue = useMemo(
    () => ({
      eventBridge,
      gameStateManager,
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

export function useEventBridge(): EventBridge {
  const { eventBridge } = useGameState();
  return eventBridge;
}

export function useGameStateManager(): GameStateManager {
  const { gameStateManager } = useGameState();
  return gameStateManager;
}
