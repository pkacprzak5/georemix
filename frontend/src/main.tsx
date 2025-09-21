import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { NavigationProvider } from "@/lib/navigation-system/navigation-provider.tsx";
import { GameStateProvider } from "@/context/game-state/GameStateContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NavigationProvider>
      <GameStateProvider>
        <App />
      </GameStateProvider>
    </NavigationProvider>
  </StrictMode>
);
