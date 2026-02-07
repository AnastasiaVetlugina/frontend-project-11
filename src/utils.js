import axios from "axios";
import { nanoid } from "nanoid";

export const fetchRssFeed = (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`;

  return axios.get(proxyUrl, { timeout: 10000 }).then((response) => {
    if (response.status !== 200 || !response.data.contents) {
      throw new Error("Ошибка при загрузке RSS");
    }
    return response.data.contents;
  });
};

export const parseRssFeed = (xmlString) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof DOMParser === "undefined") {
        throw new Error("DOMParser not available");
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");

      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        throw new Error("invalidRss");
      }

      const channel = xmlDoc.querySelector("channel");
      if (!channel) {
        throw new Error("invalidRss");
      }

      const feed = {
        id: nanoid(),
        title: channel.querySelector("title")?.textContent?.trim() || "",
        description:
          channel.querySelector("description")?.textContent?.trim() || "",
      };

      const items = xmlDoc.querySelectorAll("item");
      const posts = Array.from(items).map((item) => ({
        id: nanoid(),
        title: item.querySelector("title")?.textContent?.trim() || "",
        description:
          item.querySelector("description")?.textContent?.trim() || "",
        link: item.querySelector("link")?.textContent?.trim() || "",
      }));

      if (posts.length === 0) {
        throw new Error("invalidRss");
      }

      resolve({ feed, posts });
    } catch {
      reject(new Error("invalidRss"));
    }
  });
};

export const loadAndParseFeed = (url) => {
  return fetchRssFeed(url).then((xmlString) => parseRssFeed(xmlString));
};
