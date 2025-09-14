import { useState, useRef, useEffect, type CSSProperties } from "react";
import { Viewer, type ViewerOptions } from "mapillary-js";
import { cn } from "@/lib/utils";

const MAPILLARY_KEY = import.meta.env.VITE_MAPILLARY_ACCESS_TOKEN;

interface PanoramaViewerProps {
  imageId: string;
  className?: string;
}

export function PanoramaViewer({ imageId, className }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const accessToken = MAPILLARY_KEY || "YOUR_MAPILLARY_ACCESS_TOKEN";

    const options: ViewerOptions = {
      accessToken: accessToken, // Required by Mapillary.js itself and by MockDataProvider's internal API client
      container: container,
      imageId: imageId,
      // combinedPanning: false,
      component: {
        cover: false, // Prevents the initial cover UI to show the image directly
      },
    };

    try {
      viewerRef.current = new Viewer(options);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Failed to initialize Mapillary viewer:", err);
      setError(
        `Failed to initialize Mapillary viewer: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }

    // Clean up the viewer instance when the component unmounts
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.remove(); // Removes the viewer and its DOM elements
        } catch (err) {
          console.warn("Error removing viewer:", err);
        }
        viewerRef.current = null;
      }
    };
  }, [imageId]); // Re-initialize if imageId or mock provider usage changes

  // Apply the width and height to the container div
  const containerStyle: CSSProperties = {
    position: "relative", // Necessary for Mapillary.js internal positioning
    marginBottom: "20px",
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className={cn("mapillary-viewer-container", className)}>
      {error ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            backgroundColor: "#f5f5f5",
            border: "2px dashed #ccc",
            borderRadius: "8px",
            color: "#666",
            textAlign: "center",
            padding: "20px",
          }}>
          <div>
            <h3>Mapillary Viewer Error</h3>
            <p>{error}</p>
            <p style={{ fontSize: "0.9em", marginTop: "10px" }}>
              Try using a different image ID or check your access token.
            </p>
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
