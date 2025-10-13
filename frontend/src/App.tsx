import { useEffect } from "react";
import { Window, WindowContent } from "@/components/layout/window";
import { Router } from "@/lib/navigation-system/router";
import { Minimap } from "./features/minimap/Minimap";
import { useDataSourceManager } from "@/context/game-state";

function App() {
  const dataSourceManager = useDataSourceManager();

  // Initialize leaderboard cache when app launches
  useEffect(() => {
    const initializeCache = async () => {
      try {
        await dataSourceManager.updateAllRoundsCache();
      } catch (error) {
        console.error("Failed to initialize leaderboard cache:", error);
      }
    };

    initializeCache();
  }, [dataSourceManager]);

  return (
    <>
      <Window
        title="GeoRemix.exe"
        initialPosition={{
          x: (window.innerWidth / 2) * 0.05,
          y: (window.innerHeight / 2) * 0.05,
        }}
        disableMaximize
        disableMinimize
        disableClose
        isTitleResponsive
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
