import puppeteer from 'puppeteer-core';
const routes = process.argv.slice(2);
const browser = await puppeteer.launch({
  executablePath: '/tmp/chromium',
  args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--hide-scrollbars','--font-render-hinting=none'],
  headless: 'shell', defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR', e.message));
for (const route of routes) {
  const [path, name, width, height, mode] = route.split('::');
  await page.setViewport({ width: Number(width||1440), height: Number(height||900) });
  await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible')));
  await new Promise(r => setTimeout(r, 900));
  await page.evaluate(() => window.scrollTo(0,0));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: `/tmp/${name}.png`, fullPage: mode === 'full' });
  console.log('shot', name);
}
await browser.close();
