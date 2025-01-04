import { type CollectionEntry, getCollection } from "astro:content";
import { MODE } from "astro:env/server";
import getReadingTime from "reading-time";

export type Post = CollectionEntry<"blog"> & { cssFriendlyId: string; readingTime: string };

export const reformatDateInId = (postId: string) => {
  return postId.replace(
    /^(\d{4})-(\d{2})-(\d{2})-(.*)/,
    (_, year, month, day, title) => `${year}/${month}/${day}/${title}`,
  );
};

type blogFilter = Parameters<typeof getCollection<"blog">>[1];
export const getPosts = async (filter: blogFilter = undefined) => {
  const posts = await getCollection("blog", filter);

  return posts
    .map((post) => ({
      ...post,
      id: reformatDateInId(post.id),
      cssFriendlyId: post.id,
      readingTime: getReadingTime(post.body || "", { wordsPerMinute: 300 }).text,
    }))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
};

// To show on sitemap and blog and xml: published, not hidden
// To render page: published
export const getPublishedPosts = (includeHidden: boolean = false) =>
  getPosts(({ data }) => {
    const now = new Date();
    let isPublished = data.pubDate <= now;

    if (MODE === "draft") {
      isPublished = true;
    }

    return isPublished && (includeHidden || !data.hidden);
  });

export const getPublishedPostsIncludeHidden = () => getPublishedPosts(true);
