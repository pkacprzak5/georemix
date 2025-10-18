import { useRef, useEffect } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { VirtualTourPlugin } from "@photo-sphere-viewer/virtual-tour-plugin";
import { Viewer } from "@photo-sphere-viewer/core";
import { useEventBridge, useGameStateManager, useDataSourceManager } from "@/context/game-state";
import type { MapCoordinates } from "@/types/project";
import "@photo-sphere-viewer/virtual-tour-plugin/index.css";
import "@photo-sphere-viewer/core/index.css";

interface Node {
  id: string;
  name: string;
  panorama: string;
  gps: [number, number];
}

const PanoramaViewer = () => {
  const pSRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const eventBridge = useEventBridge();
  const gameStateManager = useGameStateManager();
  const dataSourceManager = useDataSourceManager();

  // Get node function that fetches from server
  const getNode = async (nodeId: string): Promise<Node | null> => {
    const roundNumber = gameStateManager.currentRoundNumber;
    const levelNumber = gameStateManager.currentLevelInfo.number;

    try {
      const nodeData = await dataSourceManager.getNode<Node>(roundNumber, levelNumber, nodeId);
      return nodeData;
    } catch (error) {
      console.error("Error fetching node:", error);
      return null;
    }
  };

  const handleReady = (instance: Viewer) => {
    const virtualTour = instance.getPlugin(VirtualTourPlugin) as VirtualTourPlugin;

    if (!virtualTour) {
      return;
    }

    getNode(gameStateManager.currentLevelInfo.initialNode).then((node: Node | null) => {
      if (!node) {
        throw new Error("Can not get starting node!");
      }
      const location: MapCoordinates = {
        lat: node.gps[1],
        lng: node.gps[0],
      };
      gameStateManager.setCoordinates(location);
    });

    // Listen for node changes
    // virtualTour.addEventListener("node-changed", (e: any) => {
    //   // eslint-disable-line @typescript-eslint/no-explicit-any
    //   const location: MapCoordinates = {
    //     lat: e.node.gps[1],
    //     lng: e.node.gps[0],
    //   };
    //   gameStateManager.setCoordinates(location);
    // });

    setTimeout(() => {
      eventBridge.emit("viewerLoaded", {});
    }, 1000);
  };

  const plugins = [
    [
      VirtualTourPlugin,
      {
        dataMode: "server",
        positionMode: "gps",
        renderMode: "3d",
        getNode: getNode,
        showLinkTooltip: false,
        startNodeId: gameStateManager.currentLevelInfo.initialNode, // Start with the first node
        preload: true,
        transitionOptions: {
          showLoader: false,
          speed: "20rpm",
          effect: "fade",
          rotation: true,
        },
      },
    ],
  ] as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  // Listen for reset event
  useEffect(() => {
    const cleanup = eventBridge.addEventListener("resetToStartingNode", () => {
      if (pSRef.current) {
        const viewer = pSRef.current as Viewer;
        const virtualTour = viewer.getPlugin(VirtualTourPlugin) as VirtualTourPlugin;
        
        if (virtualTour) {
          virtualTour.setCurrentNode(gameStateManager.currentLevelInfo.initialNode);
        }
      }
    });

    return cleanup;
  }, [eventBridge, gameStateManager.currentLevelInfo.initialNode]);

  return (
    <div id={"container-360"} style={{ width: "100%", height: "100%" }}>
      {/* @ts-ignore */}
      <ReactPhotoSphereViewer
        ref={pSRef}
        height={"100%"}
        width={"101%"}
        hideNavbarButton={true}
        navbar={false}
        onReady={handleReady}
        plugins={plugins}
        container={"container-360"}
        requestHeaders={{ "Cache-Control": "no-store" }}
        defaultZoomLvl={40}
        // src={`${IMAGES_ENDPOINT}/${gameState.currentLevelInfo.initialNode}.jpg`} // Default image, will be replaced by server-mode loading
      />
    </div>
  );
};

export default PanoramaViewer;
