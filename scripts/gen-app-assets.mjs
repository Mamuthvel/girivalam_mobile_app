// Generates Capacitor asset sources (icon + splash) from the brand logo.
// Run: node scripts/gen-app-assets.mjs  →  then: npx capacitor-assets generate
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const logo = path.join(root, 'src/assets/newlogo-optimized.svg');
const outDir = path.join(root, 'assets');
await mkdir(outDir, { recursive: true });

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const DARK = { r: 15, g: 23, b: 42, alpha: 1 }; // slate-900

// Render the logo to a PNG buffer sized to `size` (contained, transparent bg).
async function logoPng(size) {
  return sharp(logo, { density: 512 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

// Logo centered on a solid-color square canvas.
async function composed(canvas, bg, logoRatio) {
  const logoSize = Math.round(canvas * logoRatio);
  const buf = await logoPng(logoSize);
  return sharp({ create: { width: canvas, height: canvas, channels: 4, background: bg } })
    .composite([{ input: buf, gravity: 'center' }])
    .png()
    .toBuffer();
}

// App icon (opaque white bg — iOS forbids transparency), logo fills ~86%.
await sharp(await composed(1024, WHITE, 0.86)).toFile(path.join(outDir, 'icon-only.png'));

// Adaptive icon pieces (Android): transparent foreground + solid background.
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: await logoPng(Math.round(1024 * 0.62)), gravity: 'center' }])
  .png()
  .toFile(path.join(outDir, 'icon-foreground.png'));

await sharp({ create: { width: 1024, height: 1024, channels: 4, background: WHITE } })
  .png()
  .toFile(path.join(outDir, 'icon-background.png'));

// Splash screens (logo ~34% of a 2732 square canvas).
await sharp(await composed(2732, WHITE, 0.34)).toFile(path.join(outDir, 'splash.png'));
await sharp(await composed(2732, DARK, 0.34)).toFile(path.join(outDir, 'splash-dark.png'));

console.log('Generated icon/splash sources in', outDir);
