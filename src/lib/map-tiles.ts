import L from "leaflet";

// ─── Basemap Tile Sources ────────────────────────────────────────────────────
//
// We must NOT point at OpenStreetMap's volunteer tile servers
// (tile.openstreetmap.org, tile.openstreetmap.fr). Their Tile Usage Policy
// forbids using them as the basemap of an app/product, and they block clients
// that do — which is what produced the "not following the tile usage policy"
// banner. See https://operations.osmfoundation.org/policies/tiles/
//
// Provider is picked from whichever key is configured, so the app renders a
// real basemap out of the box and upgrades when a key is added:
//
//   VITE_MAPTILER_KEY   → MapTiler       (account required; untested here)
//   VITE_CARTO_API_KEY  → CARTO          (detail to z18, free key, no account)
//   neither             → Esri ArcGIS    (key-free, but street detail stops
//                                         at z17 and is upscaled past that)
//
// CARTO's raster tiles stopped serving key-free traffic on 2026-09-25 — without
// a key they return an "API KEY REQUIRED" watermark tile with HTTP 200, so a
// status check alone will not tell you the basemap is broken. Esri's open
// services still serve real tiles without a key, which is why they are the
// fallback rather than CARTO. `npm run verify:tiles` checks the bytes.
//
// Deliberately raster-only: a vector basemap (MapLibre/OpenFreeMap) renders
// sharper at high zoom, but costs ~300 KB gzipped and needs WebGL plus an
// es2020 build target — the opposite of what this app's audience runs. See
// docs/map-tiles.md.
//
// Attribution is required by every provider's licence; it is baked into each
// source's `attribution` string and rendered by Leaflet's attribution control.

const MAPTILER_KEY = (import.meta.env.VITE_MAPTILER_KEY as string | undefined)?.trim();
const CARTO_KEY = (import.meta.env.VITE_CARTO_API_KEY as string | undefined)?.trim();

export type TileProvider = "maptiler" | "carto" | "esri";

export const TILE_PROVIDER: TileProvider = MAPTILER_KEY
  ? "maptiler"
  : CARTO_KEY
    ? "carto"
    : "esri";

const OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const CARTO_ATTR = '&copy; <a href="https://carto.com/attributions">CARTO</a>';
const ESRI_ATTR = '&copy; <a href="https://www.esri.com">Esri</a>';
const MAPTILER_ATTR = '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a>';

export type MapTheme = "standard" | "dark" | "spiritual" | "satellite";

export interface TileSource {
  label: string;
  url: string;
  attribution: string;
  /**
   * Highest zoom the provider actually ships tiles for at Tiruvannamalai.
   * Past this Leaflet upscales the last real tile — without it the provider
   * serves a "data not available" placeholder instead.
   */
  maxNativeZoom: number;
}

const esri = (path: string, maxNativeZoom: number, label: string, attribution: string): TileSource => ({
  label,
  url: `https://server.arcgisonline.com/ArcGIS/rest/services/${path}/MapServer/tile/{z}/{y}/{x}`,
  attribution,
  maxNativeZoom,
});

// Zoom ceilings below were probed tile-by-tile over Tiruvannamalai; the Canvas
// (gray) services stop at z16 and World_Street_Map at z17 in this region.
const ESRI_THEMES: Record<MapTheme, TileSource> = {
  standard: esri("World_Street_Map", 17, "Standard", `${ESRI_ATTR}, ${OSM_ATTR}`),
  dark: esri("Canvas/World_Dark_Gray_Base", 16, "Dark", `${ESRI_ATTR}, ${OSM_ATTR}`),
  spiritual: esri("Canvas/World_Light_Gray_Base", 16, "Light", `${ESRI_ATTR}, ${OSM_ATTR}`),
  satellite: esri("World_Imagery", 18, "Satellite", `${ESRI_ATTR}, Maxar, Earthstar Geographics`),
};

const carto = (style: string, label: string): TileSource => ({
  label,
  url: `https://basemaps.cartocdn.com/rastertiles/${style}/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
  attribution: `${CARTO_ATTR} ${OSM_ATTR}`,
  // The free Basemaps key is capped at z18 worldwide (verified at
  // Tiruvannamalai, London and New York — z19+ returns HTTP 403).
  maxNativeZoom: 18,
});

const CARTO_THEMES: Record<MapTheme, TileSource> = {
  standard: carto("voyager", "Standard"),
  dark: carto("dark_all", "Dark"),
  spiritual: carto("light_all", "Light"),
  // CARTO ships no imagery layer — keep Esri's for the satellite view.
  satellite: ESRI_THEMES.satellite,
};

const maptiler = (style: string, ext: string, label: string): TileSource => ({
  label,
  url: `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.${ext}?key=${MAPTILER_KEY}`,
  attribution: `${MAPTILER_ATTR} ${OSM_ATTR}`,
  maxNativeZoom: 20,
});

const MAPTILER_THEMES: Record<MapTheme, TileSource> = {
  standard: maptiler("streets-v2", "png", "Standard"),
  dark: maptiler("streets-v2-dark", "png", "Dark"),
  spiritual: maptiler("streets-v2-light", "png", "Light"),
  satellite: maptiler("satellite", "jpg", "Satellite"),
};

export const MAP_THEMES: Record<MapTheme, TileSource> =
  TILE_PROVIDER === "maptiler"
    ? MAPTILER_THEMES
    : TILE_PROVIDER === "carto"
      ? CARTO_THEMES
      : ESRI_THEMES;

export const DEFAULT_MAP_THEME: MapTheme = "standard";

/** Tile options shared by every map so caching + attribution stay consistent. */
export const tileLayerOptions = (source: TileSource): L.TileLayerOptions => ({
  maxZoom: 19,
  maxNativeZoom: source.maxNativeZoom,
  attribution: source.attribution,
  crossOrigin: true,
  // Keep requests down: don't refetch tiles while panning/zooming is in flight.
  updateWhenIdle: true,
  keepBuffer: 2,
});

/** Build the basemap layer for a theme (or an explicit source). */
export const createTileLayer = (theme: MapTheme | TileSource = DEFAULT_MAP_THEME): L.TileLayer => {
  const source = typeof theme === "string" ? MAP_THEMES[theme] : theme;
  return L.tileLayer(source.url, tileLayerOptions(source));
};

/** The plain raster basemap, for maps that don't offer a theme switcher. */
export const rasterFallbackFor = (theme: MapTheme): TileSource => ESRI_THEMES[theme];

/** Show the (legally required) attribution without Leaflet's "Leaflet" prefix. */
export const trimAttributionPrefix = (map: L.Map): void => {
  map.attributionControl?.setPrefix("");
};
