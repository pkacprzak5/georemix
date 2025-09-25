import React, { createContext, useContext, useEffect, useMemo } from "react";
import { EventBridge } from "@/context/game-state/EventBridge";
import { GameStateManager } from "@/context/game-state/GameStateManager";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import type { ModuleId } from "@/lib/navigation-system/types";
import ThemeManager from "@/context/game-state/ThemeManager";
import { DEFAULT_COLORS } from "@/types/project";
import { DataSourceManager } from "@/context/game-state/DataSourceManager";

interface GameStateContextType {
  eventBridge: EventBridge;
  gameStateManager: GameStateManager;
  themeManager: ThemeManager;
  dataSourceManager: DataSourceManager;
  navigateToNewGroup: (newGroup: ModuleId) => void;
}

const GameStateContext = createContext<GameStateContextType | null>(null);

interface GameStateProviderProps {
  children: React.ReactNode;
}

export function GameStateProvider({ children }: GameStateProviderProps) {
  const themeManager = useMemo(() => new ThemeManager(), []);
  const eventBridge = useMemo(() => new EventBridge(), []);
  const gameStateManager = useMemo(() => new GameStateManager(), []);
  const dataSourceManager = useMemo(() => new DataSourceManager(), []);
  const { navigateToNewGroup } = useNavigation();

  useEffect(() => {
    const unsubscribeGameplayLeft = eventBridge.addEventListener("gameplayLeft", () => {
      themeManager.setColors(DEFAULT_COLORS) 
    })

    return () => {
      unsubscribeGameplayLeft();
    }
  }, [])

  const contextValue = useMemo(
    () => ({
      eventBridge,
      gameStateManager,
      themeManager,
      dataSourceManager,
      navigateToNewGroup,
    }),
    [eventBridge, gameStateManager, dataSourceManager]
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

export function useThemeManager(): ThemeManager {
  const { themeManager } = useGameState();
  return themeManager;
}

export function useGameStateManager(): GameStateManager {
  const { gameStateManager } = useGameState();
  return gameStateManager;
}

export function useDataSourceManager(): DataSourceManager {
  const { dataSourceManager } = useGameState();
  return dataSourceManager;
}
