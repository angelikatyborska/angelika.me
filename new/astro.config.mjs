// @ts-check
import { defineConfig, envField } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://angelika.me",
  integrations: [mdx(), sitemap()],
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
