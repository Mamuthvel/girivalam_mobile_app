import { chromium } from 'playwright';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const BASE = 'https://mygirivalam.in';
const OUT = 'C:\\Users\\Administrator\\Documents\\Projects\\chandru\\girivalam-screenshots';
await mkdir(OUT, { recursive: true });

// 360x640 CSS px @ 3x = 1080x1920 output (9:16), with phone layout.
const pages = [
  ['01-home', '/'],
  ['02-next-pournami', '/next-pournami'],
  ['03-guide', '/girivalam-guide'],
  ['04-ai-guide', '/ai-guide'],
  ['05-services', '/girivalam-services'],
  ['06-map', '/girivalam-map'],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 360, height: 640 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  permissions: ['geolocation'],
  geolocation: { latitude: 12.2253, longitude: 79.0747 }, // Tiruvannamalai
  locale: 'en-IN',
});

for (const [name, route] of pages) {
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    console.log(`warn ${name}: ${e.message}`);
  }
  await page.waitForTimeout(3500); // let data/animations settle
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file }); // viewport only => 1080x1920
  console.log('saved', file);
  await page.close();
}

await browser.close();
console.log('DONE');
