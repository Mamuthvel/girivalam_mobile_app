# Map basemap tiles

## Current setup

No API key required. Tile sources live in one place: `src/lib/map-tiles.ts`.

| Key in `.env` | Provider | Street detail |
|---|---|---|
| *(none)* | Esri ArcGIS | to z17, upscaled past that |
| `VITE_CARTO_API_KEY` | CARTO | to z18, upscaled past that |
| `VITE_MAPTILER_KEY` | MapTiler | untested — no key available when this was written |

The CARTO free Basemaps key is capped at **z18 worldwide** — z19 and z20 return
HTTP 403 (verified at Tiruvannamalai, London and New York). Set
`maxNativeZoom` to 18 for CARTO or Leaflet will request tiles it cannot get.

Run `npm run verify:tiles` after changing providers or keys.

## Why not OpenStreetMap's tile servers

`tile.openstreetmap.org` and `tile.openstreetmap.fr` are volunteer-run. Their
[Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)
forbids using them as an app's basemap, and they block clients that do — which
is what produced the "app is not following the tile usage policy" message.

## Verify the bytes, not the status code

Every cut-off tile provider still answers **HTTP 200 with a valid image**:

- OSM serves a "Blocked" tile
- CARTO (since 2026-09-25, without a key) serves an "API KEY REQUIRED" watermark
- Esri serves "Map data not yet available" past its zoom ceiling

So a status check proves nothing. `scripts/check-map-tiles.mjs` fetches two
tiles of *different* places and fails if they come back byte-identical or under
4 KB, which is the signature all three share.

The `maxNativeZoom` values in `map-tiles.ts` were probed tile-by-tile over
Tiruvannamalai. Without them Leaflet requests past the provider's ceiling and
users see the placeholder instead of an upscaled tile.

## Why this is raster-only (MapLibre / OpenFreeMap was tried and reverted)

A vector basemap stays sharp at every zoom, and OpenFreeMap serves vector tiles
free with no API key — attractive on paper. It was implemented and reverted.
What it actually cost:

1. **Build target.** `vite.config.ts` sets `target: "es2015"` on purpose, for
   the budget Android phones pilgrims carry. MapLibre ships BigInt literals
   that esbuild cannot downlevel, so the build fails without relaxing that.
2. **Bundle size.** 1 MB raw / ~297 KB gzipped, on top of the map page, over
   rural 3G.
3. **WebGL.** Required. The devices most likely to lack it are exactly the ones
   in this audience, so it needs a raster fallback regardless — meaning both
   code paths must be maintained.
4. **Chunking trap.** `maplibre-gl.css` matched the `manualChunks` rule for
   `maplibre-gl` and was assigned to the MapLibre chunk, which gave *every*
   page a static import of it and silently defeated the lazy loading. The JS
   rule must exclude `.css`.
5. **Unresolved blocker.** Under Vite, `@maplibre/maplibre-gl-leaflet` fails
   with `Error: Worker failed to load. Check that the worker URL is correct.`
   The GL canvas mounts at the right size and tiles download, but nothing
   paints — 0 opaque pixels. `maplibregl.setWorkerUrl()` with a
   `?worker&url` import did not resolve it.

If you revisit this, start at (5), and verify with a real screenshot: the
canvas being present proves nothing, because the blank canvas is present too.
