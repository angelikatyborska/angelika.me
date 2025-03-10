// @ts-check
import { defineConfig, envField } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import rehypeWrapTables from "./src/lib/rehype-wrap-tables";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
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
  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        // exclude style test page
        if (/\/style-test/.test(item.url)) {
          return undefined;
        }

        // exclude blog paginated pages
        const blogPage = /blog\/(\d+)\/$/;

        if (blogPage.test(item.url)) {
          return undefined;
        }

        // Code for setting lastmod - I'm not sure I want to use it
        // if (item.url === "https://angelika.me/blog/") {
        //   item.lastmod = new Date().toUTCString();
        // }
        //
        // const blogPostDate = /\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)/;
        // const blogPostDateMatch = item.url.match(blogPostDate)
        //
        // if (blogPostDateMatch) {
        //   const [, year, month, day] = blogPostDateMatch;
        //   item.lastmod = [year, month, day].join("-");
        // }
        return item;
      },
    }),
  ],
  image: {
    // Used for all `<Image />` and `<Picture />` components unless overridden
    experimentalLayout: "responsive",
  },
  experimental: {
    responsiveImages: true,
  },
  markdown: {
    rehypePlugins: [
      rehypeWrapTables,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "prepend",
          content: {
            type: "text",
            value: "#",
          },
          headingProperties: {
            className: ["anchor"],
          },
          properties: {
            className: ["anchor-link"],
          },
        },
      ],
    ],
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
  redirects: {
    "/blog/page/[...page]": "/blog/[...page]",
  },
});
