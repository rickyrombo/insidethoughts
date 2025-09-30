import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom", // or "rss", "json"
    outputPath: "/feed.xml",
    collection: {
      name: "posts", // iterate over `collections.posts`
      limit: 10, // 0 means no limit
    },
    metadata: {
      language: "en",
      title: "Inside Thoughts",
      subtitle: "Sharing my inside thoughts outside",
      base: "https://insidethoughts.me/",
      author: {
        name: "Marcus Pasell",
        email: "marcus@insidethoughts.me",
      },
    },
  });

  eleventyConfig.addPassthroughCopy("styles.css");

  eleventyConfig.addFilter("formatDate", (value) =>
    dayjs(value).utc(true).format("MMMM DD, YYYY")
  );
}
