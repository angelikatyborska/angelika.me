const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({width: 1200, height: 630});

  console.log(`visiting /`)
  await page.goto(`http://0.0.0.0:3333/default_og_image/`);
  await page.screenshot({ path: `_assets/images/og_images/default.png`})

  const slugs = fs.readdirSync('./_site/og_images')

  for ( let i = 0; i < slugs.length; i++){
    const slug = slugs[i]
    console.log(`visiting ${slug}`)
    await page.goto(`http://0.0.0.0:3333/og_images/${slug}/index.html`);
    await page.screenshot({ path: `_assets/images/og_images/${slug}.png`})
  }

  await browser.close();
})();
