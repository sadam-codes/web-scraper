import axios from "axios";
import * as cheerio from "cheerio";
import prisma from "./db.js";

export const scrapeAndSave = async (url) => {
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);

  const text = $("body").text().replace(/\s+/g, " ").trim();
  const images = $("img").map((i, el) => $(el).attr("src")).get().filter(Boolean);

  const scrapedData = {
    html,
    text: text.slice(0, 2000),
    images,
  };

  await prisma.scrapedData.upsert({
    where: { url },
    update: { data: scrapedData },
    create: { url, data: scrapedData },
  });

  return scrapedData;
};
