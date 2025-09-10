import { MainWindow } from "./components/MainWindow";
import { MapWindow } from "./components/OpenStreetMapWindow";
import { GameStateProvider } from "./context/GameStateContext";
import { NavigationProvider } from "./lib/navigation-system/NavigationProvider";

function App() {
  return (
    <NavigationProvider>
      <GameStateProvider>
        <MainWindow />
        <MapWindow />
      </GameStateProvider>
    </NavigationProvider>
  );
}

export default App;
