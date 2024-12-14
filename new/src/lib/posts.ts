import { getCollection } from "astro:content";

export const getPosts = async () => {
  const posts = await getCollection("blog");

  // TODO: unit tests
  const reformatDateInId = (postId: string) => {
    return postId.replace(
      /^(\d{4})-(\d{2})-(\d{2})-(.*)/,
      (_, year, month, day, title) => `${year}/${month}/${day}/${title}`,
    );
  };

  return posts.map((post) => ({
    ...post,
    id: reformatDateInId(post.id),
  }));
};