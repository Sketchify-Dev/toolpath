const { chromium } = await import('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/sketchify/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome',
    headless: true,
  });
  const page = await browser.newPage();

  const widths = [360, 390, 430, 768, 1024, 1440, 1920];
  const pages = [{ name: 'home', url: 'http://localhost:3000/' }, { name: 'demo', url: 'http://localhost:3000/demo' }];

  for (const p of pages) {
    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${process.cwd()}/qa-${p.name}-${w}.png`, fullPage: true });
      console.log(`${p.name} ${w}px: OK`);
    }
  }

  await browser.close();
  console.log('All screenshots saved to repo root as qa-{home,demo}-{width}.png');
})();
