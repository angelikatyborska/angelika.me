import rss from "@astrojs/rss";
import { getPublishedPosts } from "@lib/posts.ts";
import { SITE_TITLE, SITE_DESCRIPTION } from "@lib/consts";

// TODO: channel image
export async function GET(context) {
  const posts = await getPublishedPosts();
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
