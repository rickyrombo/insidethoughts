import rssPlugin, { feedPlugin } from "@11ty/eleventy-plugin-rss";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import dotenv from "dotenv";
import { encryptionTools } from "./encryptionTools.js";

dotenv.config();
dayjs.extend(utc);

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);

  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("encryptionTools.js");

  eleventyConfig.addFilter("formatDate", (value) =>
    dayjs(value).utc(true).format("MMMM DD, YYYY")
  );

  eleventyConfig.addFilter("encrypt", async function (content) {
    const password = process.env.PASSWORD;
    return JSON.stringify(await encryptionTools.encrypt(content, password));
  });
}
