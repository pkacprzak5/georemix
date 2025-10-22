export const BASE_URL = import.meta.env.VITE_API_URL;
export const IMAGES_ENDPOINT = `${BASE_URL}/images`;
export const THUMBNAIL_ENDPOINT = `${BASE_URL}/thumbnails`;
export const DEFAULT_COLORS = {
  background: "#eaf7cf",
  main: "#77b900",
};
export const MAP_TILE_URL = "https://tiles.openfreemap.org/styles/positron"