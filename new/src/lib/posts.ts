import { type CollectionEntry, getCollection } from "astro:content";
import { MODE } from "astro:env/server";
import getReadingTime from "reading-time";

export type Post = CollectionEntry<"blog"> & { originalId: string; readingTime: string };

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
      originalId: post.id,
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

export const prepareTags = (rawTags: string[]) => {
  const tags = rawTags.map((tag) => ({
    tag: tag.toLowerCase().replaceAll(" ", "-"),
    tagTitle: tag,
  }));

  return tags.filter((tag, index) => {
    const i = tags.findIndex((x) => x.tag === tag.tag);
    return i === index;
  });
};
