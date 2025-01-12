const fs = require("fs");

const slugs = fs.readdirSync("src/content/blog/");
const paths = [`public/og/default.png`, ...slugs.filter(slug => !slug.startsWith('.')).map((slug) => `public/og/${slug}.png`)];

const missingImages = paths.filter((path) => {
  return !fs.statSync(path, { throwIfNoEntry: false });
});

if (missingImages.length > 0) {
  console.log(`Missing OG images:\n${missingImages.join("\n")}`);
  process.exit(1);
} else {
  console.log("all ok");
}
