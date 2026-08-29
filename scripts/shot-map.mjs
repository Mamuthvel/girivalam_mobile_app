import { chromium } from 'playwright';

const OUT = 'C:\\Users\\Administrator\\Documents\\Projects\\chandru\\girivalam-screenshots\\07-map-preview.png';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 360, height: 640 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  permissions: ['geolocation'],
  geolocation: { latitude: 12.2253, longitude: 79.0747 },
  locale: 'en-IN',
});
const page = await ctx.newPage();
await page.goto('https://mygirivalam.in/girivalam-map-preview', { waitUntil: 'networkidle', timeout: 60000 });
// wait for Leaflet tiles to appear + settle
const hasMap = await page.waitForSelector('.leaflet-container', { timeout: 25000 }).then(()=>true).catch(()=>false);
console.log('leaflet present:', hasMap);
if (hasMap) {
  await page.$eval('.leaflet-container', el => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(6000); // let tiles load
  const box = await page.$eval('.leaflet-container', el => { const r = el.getBoundingClientRect(); return {w: r.width, h: r.height, top: r.top}; });
  console.log('map box', JSON.stringify(box));
}
await page.waitForTimeout(2000);
await page.screenshot({ path: OUT });
console.log('saved', OUT);
await browser.close();
