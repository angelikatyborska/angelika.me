const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });

  console.log(`visiting /`);
  await page.goto(`http://localhost:4321/og/default`);
  await page.screenshot({ path: `public/og/default.png` });

  const slugs = fs.readdirSync("src/content/blog/");

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];

    if (slug.startsWith(".")) {
      continue;
    }

    console.log(`visiting ${slug}`);
    await page.goto(`http://localhost:4321/og/${slug}`);
    await page.screenshot({ path: `public/og/${slug}.png` });
  }

  await browser.close();
})();
