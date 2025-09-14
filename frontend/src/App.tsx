import { MainWindow } from "./components/MainWindow";
import { MinimapWindow } from "./features/minimap/MinimapWindow";
import { GameStateProvider } from "./context/game-state/GameStateContext";
import { NavigationProvider } from "./lib/navigation-system/NavigationProvider";

function App() {
  return (
    <NavigationProvider>
      <GameStateProvider>
        <MainWindow />
        <MinimapWindow />
      </GameStateProvider>
    </NavigationProvider>
  );
}

export default App;
