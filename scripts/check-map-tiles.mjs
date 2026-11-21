#!/usr/bin/env node
// Verify the configured basemap actually serves map imagery.
//
// A tile provider that has cut you off still answers HTTP 200 with a valid
// image — OSM returns a "Blocked" tile, CARTO an "API KEY REQUIRED" watermark,
// Esri a "Map data not yet available" placeholder. So status codes prove
// nothing; these are all tiny (~2-3 KB) and identical across adjacent tiles,
// which is what this script checks for.
//
// Usage: node scripts/check-map-tiles.mjs

import { createHash } from "node:crypto";

// Vite loads .env for the app; Node does not, so do it here or this script
// would always report the no-key provider regardless of what is configured.
try {
  process.loadEnvFile(new URL("../.env", import.meta.url));
} catch {
  // no .env present — fall through to the key-free provider
}

// Two well-separated tiles over Tiruvannamalai at each zoom. Real map tiles of
// different places never match byte-for-byte; placeholder tiles always do.
const CENTER = { lat: 12.2253, lon: 79.0747 };
const OFFSET = { lat: 12.2553, lon: 79.1047 };

// Known placeholder tiles: CARTO "API KEY REQUIRED" 2049/2513 b, Esri "Map
// data not yet available" 2521 b, CARTO 403 body 90 b. Real tiles over rural
// Tiruvannamalai at z18 are only ~3.4 KB, so this floor has to stay well under
// that — the identical-tile comparison below is the primary signal, not size.
const PLACEHOLDER_MAX_BYTES = 2600;

const tileXY = ({ lat, lon }, z) => {
  const n = 2 ** z;
  const rad = (lat * Math.PI) / 180;
  return {
    x: Math.floor(((lon + 180) / 360) * n),
    y: Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n),
  };
};

const fill = (url, z, { x, y }) =>
  url.replace("{z}", z).replace("{x}", x).replace("{y}", y).replace("{s}", "a");

async function fetchTile(url) {
  const res = await fetch(url, { headers: { "User-Agent": "arunachala-vibe tile check" } });
  const body = Buffer.from(await res.arrayBuffer());
  return { status: res.status, bytes: body.length, md5: createHash("md5").update(body).digest("hex") };
}

// Mirrors src/lib/map-tiles.ts. Keep in sync when a provider changes.
const MAPTILER_KEY = process.env.VITE_MAPTILER_KEY?.trim();
const CARTO_KEY = process.env.VITE_CARTO_API_KEY?.trim();
const provider = MAPTILER_KEY ? "maptiler" : CARTO_KEY ? "carto" : "esri";

const esri = (path, maxNativeZoom) => ({
  kind: "raster",
  url: `https://server.arcgisonline.com/ArcGIS/rest/services/${path}/MapServer/tile/{z}/{y}/{x}`,
  maxNativeZoom,
});
const carto = (style) => ({
  kind: "raster",
  url: `https://basemaps.cartocdn.com/rastertiles/${style}/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
  maxNativeZoom: 18,
});
const maptiler = (style, ext) => ({
  kind: "raster",
  url: `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.${ext}?key=${MAPTILER_KEY}`,
  maxNativeZoom: 20,
});

const THEMES = {
  esri: {
    standard: esri("World_Street_Map", 17),
    dark: esri("Canvas/World_Dark_Gray_Base", 16),
    spiritual: esri("Canvas/World_Light_Gray_Base", 16),
    satellite: esri("World_Imagery", 18),
  },
  carto: {
    standard: carto("voyager"),
    dark: carto("dark_all"),
    spiritual: carto("light_all"),
    satellite: esri("World_Imagery", 18),
  },
  maptiler: {
    standard: maptiler("streets-v2", "png"),
    dark: maptiler("streets-v2-dark", "png"),
    spiritual: maptiler("streets-v2-light", "png"),
    satellite: maptiler("satellite", "jpg"),
  },
}[provider];

console.log(`Tile provider: ${provider}\n`);

let failed = false;
for (const [theme, source] of Object.entries(THEMES)) {
  const z = source.maxNativeZoom;
  const [a, b] = await Promise.all([
    fetchTile(fill(source.url, z, tileXY(CENTER, z))),
    fetchTile(fill(source.url, z, tileXY(OFFSET, z))),
  ]);

  const problems = [];
  if (a.status !== 200) problems.push(`HTTP ${a.status}`);
  // Primary signal: real map tiles of two different places are never identical.
  if (a.md5 === b.md5) problems.push("two different locations returned an identical tile");
  if (a.bytes < PLACEHOLDER_MAX_BYTES) problems.push(`tile is only ${a.bytes} bytes`);

  if (problems.length) {
    failed = true;
    console.log(`  FAIL  ${theme.padEnd(10)} z${z}  ${problems.join("; ")}`);
    console.log(`        ${fill(source.url, z, tileXY(CENTER, z)).replace(/key=[^&]+/, "key=***")}`);
  } else {
    console.log(`  ok    ${theme.padEnd(10)} z${z}  ${a.bytes} bytes`);
  }
}

if (failed) {
  console.log("\nBasemap is not serving real tiles. See .env.example for the API key options.");
  process.exit(1);
}
console.log("\nAll basemaps serving real tiles.");
