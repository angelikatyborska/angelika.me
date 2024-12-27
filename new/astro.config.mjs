// @ts-check
import { defineConfig, envField } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  build: { assets: "_assets" },
  site: "https://angelika.me",
  integrations: [mdx(), sitemap()],
  image: {
    // Used for all `<Image />` and `<Picture />` components unless overridden
    experimentalLayout: 'responsive',
  },
  experimental: {
    responsiveImages: true,
  },
  env: {
    schema: {
      MODE: envField.enum({
        values: ["draft", "published"],
        context: "server",
        access: "public",
        default: "published",
      }),
    },
  },
});
