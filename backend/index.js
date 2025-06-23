import express from "express";
import cors from "cors";
import { scrapeAndSave } from "./scraper.js";
import prisma from "./db.js";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const data = await scrapeAndSave(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/data", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const record = await prisma.scrapedData.findUnique({ where: { url } });
    if (!record) return res.status(404).json({ error: "No data found" });

    res.json({ success: true, data: record.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log("Server running on http://localhost:3000");
});
