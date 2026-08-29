// Generates Google Play store assets from the brand logo.
//  - playstore-icon-512.png : 512x512 opaque PNG (sRGB), logo centered in safe zone
//  - feature-graphic-1024x500.png : store feature graphic
import sharp from 'sharp';
import path from 'node:path';

const root = path.resolve(process.cwd());
const logo = path.join(root, 'src/assets/newlogo-optimized.svg');
const out = path.join(root, 'store-assets');
import { mkdir } from 'node:fs/promises';
await mkdir(out, { recursive: true });

const WHITE = { r: 255, g: 255, b: 255 };

async function logoPng(size) {
  return sharp(logo, { density: 1024 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

// 512x512 store icon: opaque white square, logo ~76% (kept out of the 30% corner mask).
const iconSize = 512;
const logoInIcon = Math.round(iconSize * 0.68);
await sharp({ create: { width: iconSize, height: iconSize, channels: 4, background: { ...WHITE, alpha: 1 } } })
  .composite([{ input: await logoPng(logoInIcon), gravity: 'center' }])
  .withMetadata({ density: 72 })
  .png({ compressionLevel: 9 })
  .toColourspace('srgb')
  .toFile(path.join(out, 'playstore-icon-512.png'));

// Feature graphic 1024x500: white bg, logo left, wordmark space right kept simple (logo centered-left).
const fw = 1024, fh = 500;
const fLogo = Math.round(fh * 0.62);
await sharp({ create: { width: fw, height: fh, channels: 4, background: { ...WHITE, alpha: 1 } } })
  .composite([{ input: await logoPng(fLogo), left: Math.round(fw * 0.06), top: Math.round((fh - fLogo) / 2) }])
  .png({ compressionLevel: 9 })
  .toColourspace('srgb')
  .toFile(path.join(out, 'feature-graphic-1024x500.png'));

console.log('Store assets written to', out);
