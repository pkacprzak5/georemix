import { MainWindow } from "./components/MainWindow";
import { MapWindow } from "./components/OpenStreetMapWindow";
import { GameStateProvider } from "./context/GameStateContext";

function App() {
  return (
    <GameStateProvider>
      <MainWindow />
      <MapWindow />
    </GameStateProvider>
  );
}

export default App;
