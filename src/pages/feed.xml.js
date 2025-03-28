import rss from "@astrojs/rss";
import { getPublishedPosts } from "@lib/posts.ts";
import { SITE_TITLE, SITE_DESCRIPTION, ITEMS_IN_RSS_FEED } from "@lib/consts";

export async function GET(context) {
  const posts = (await getPublishedPosts()).slice(0, ITEMS_IN_RSS_FEED);
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.pubDate,
      link: post.id,
    })),
  });
}
