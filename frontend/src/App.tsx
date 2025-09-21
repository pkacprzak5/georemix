import { Window, WindowContent } from "@/components/layout/window";
import { Router } from "@/lib/navigation-system/router";
import { Minimap } from "./features/minimap/Minimap";

function App() {
  return (
    <>
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
      <Minimap />
    </>
  );
}

export default App;
