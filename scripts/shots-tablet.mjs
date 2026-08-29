import { chromium } from 'playwright';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const BASE = 'https://mygirivalam.in';
const ROOT = 'C:\\Users\\Administrator\\Documents\\Projects\\chandru\\girivalam-screenshots';

const pages = [
  ['01-home', '/'],
  ['02-next-pournami', '/next-pournami'],
  ['03-ai-guide', '/ai-guide'],
  ['04-services', '/girivalam-services'],
  ['05-map', '/girivalam-map-preview'],
];

// 810x1440 CSS = exact 9:16. DSF 1 => 810x1440 (7"), DSF 2 => 1620x2880 (10").
const sizes = [
  ['tablet-7', 1],
  ['tablet-10', 2],
];

const browser = await chromium.launch();

for (const [folder, dsf] of sizes) {
  const out = path.join(ROOT, folder);
  await mkdir(out, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 810, height: 1440 },
    deviceScaleFactor: dsf,
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation'],
    geolocation: { latitude: 12.2253, longitude: 79.0747 },
    locale: 'en-IN',
  });
  for (const [name, route] of pages) {
    const page = await ctx.newPage();
    try { await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 }); }
    catch (e) { console.log(`warn ${folder}/${name}: ${e.message}`); }
    if (route.includes('map-preview')) {
      const has = await page.waitForSelector('.leaflet-container', { timeout: 25000 }).then(()=>true).catch(()=>false);
      if (has) { await page.$eval('.leaflet-container', el => el.scrollIntoView({ block: 'center' })); }
      await page.waitForTimeout(6000);
    } else {
      await page.waitForTimeout(3500);
    }
    const file = path.join(out, `${name}.png`);
    await page.screenshot({ path: file });
    console.log('saved', file);
    await page.close();
  }
  await ctx.close();
}

await browser.close();
console.log('DONE');
