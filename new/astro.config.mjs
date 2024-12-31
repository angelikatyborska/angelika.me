// @ts-check
import { defineConfig, envField } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import rehypeWrapTables from "./src/lib/rehype-wrap-tables";
import { createCssVariablesTheme } from "shiki/core";
import { transformerNotationDiff } from "@shikijs/transformers";
// Create a custom CSS variables theme, the following are the default values
const myShikiTheme = createCssVariablesTheme({
  name: "css-variables",
  variablePrefix: "--shiki-",
  variableDefaults: {},
  fontStyle: true,
});

// https://astro.build/config
export default defineConfig({
  build: { assets: "_assets" },
  site: "https://angelika.me",
  integrations: [mdx(), sitemap()],
  image: {
    // Used for all `<Image />` and `<Picture />` components unless overridden
    experimentalLayout: "responsive",
  },
  experimental: {
    responsiveImages: true,
  },
  markdown: {
    rehypePlugins: [rehypeWrapTables],
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: myShikiTheme,
      transformers: [transformerNotationDiff()],
    },
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
