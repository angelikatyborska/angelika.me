import { type RemarkPlugin } from "@astrojs/markdown-remark";
import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";

const remarkReadingTime: RemarkPlugin = () => {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    // readingTime.text will give us minutes read as a friendly string,
    // i.e. "3 min read"
    if (data.astro?.frontmatter) {
      data.astro.frontmatter.minutesRead = readingTime.text;
    }
  };
};

export default remarkReadingTime;
