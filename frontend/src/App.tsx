import { MinimapWindow } from "./features/minimap/MinimapWindow";
import { GameStateProvider } from "./context/game-state/GameStateContext";
import { NavigationProvider } from "./lib/navigation-system/navigation-provider";
import { Window, WindowContent } from "@/components/layout/window";
import { Router } from "@/lib/navigation-system/router";

function App() {
  return (
    <NavigationProvider>
      <GameStateProvider>
        <Window
          title="guesser.exe"
          initialPosition={{
            x: (window.innerWidth / 2) * 0.05,
            y: (window.innerHeight / 2) * 0.05,
          }}
          className="h-[95vh] w-[95vw] overflow-hidden">
          <WindowContent className="w-full h-full relative">
            <div className="w-full h-full relative">
              <Router />
            </div>
          </WindowContent>
        </Window>
        <MinimapWindow />
      </GameStateProvider>
    </NavigationProvider>
  );
}

export default App;
