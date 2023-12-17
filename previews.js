const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({width: 800, height: 640});

  const slugs = fs.readdirSync('./_site/previews')

  for ( let i = 0; i < slugs.length; i++){
    const slug = slugs[i]
    await page.goto(`http://0.0.0.0:3333/previews/${slug}/index.html`);
    await page.screenshot({ path: `_assets/images/previews/${slug}.png`})
  }

  await browser.close();
})();
