// File: server.js
import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import Stripe from 'stripe';
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
app.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing search term" });

  const url = `https://www.amazon.com/s?k=${encodeURIComponent(q)}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/58.0.3029.110 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const products = [];

    $(".s-result-item").each((_, el) => {
      const name = $(el).find("h2 span").text().trim();
      const image = $(el).find("img.s-image").attr("src");
      const price = $(el).find(".a-price-whole").first().text().trim();
      const desc = $(el).find(".a-size-base-plus").text().trim();

      if (name && image && price) {
        products.push({ name, image, price: `$${price}`, description: desc });
      }
    });

    // Save only new products
    for (const product of products) {
      const exists = await prisma.product.findFirst({
        where: {
          name: product.name,
          image: product.image,
          keyword: q,
        },
      });

      if (!exists) {
        await prisma.product.create({
          data: { ...product, keyword: q },
        });
      }
    }

    res.json({ message: "Scraped (new items saved)", products });
  } catch (err) {
    console.error("❌ Scraping error:", err);
    res.status(500).json({ error: "Scraping failed", detail: err.message });
  }
});


app.get("/products", async (req, res) => {
  try {
    const { q = "", page = 1, limit = 9 } = req.query;

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;

    const products = await prisma.product.findMany({
      where: {
        keyword: {
          contains: q,
          mode: "insensitive",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: itemsPerPage,
    });

    const total = await prisma.product.count({
      where: {
        keyword: {
          contains: q,
          mode: "insensitive",
        },
      },
    });

    const totalPages = Math.ceil(total / itemsPerPage);

    res.json({ products, totalPages, page: currentPage });
  } catch (err) {
    console.error("/products error:", err);
    res.status(500).json({ error: "Failed to fetch products", detail: err.message });
  }
});
app.post("/create-payment-intent", async (req, res) => {
  try {
    let { amount } = req.body;

    // Clean currency symbols and convert to cents
    amount = amount.replace(/[^\d.]/g, ""); // remove currency symbols
    const floatAmount = parseFloat(amount); // e.g. "0.19" -> 0.19
    const finalAmount = Math.round(floatAmount * 100); // in cents

    if (finalAmount < 50) {
      return res.status(400).json({
        error: "Amount must be at least $0.50 (50 cents).",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: "usd", // or "pkr" etc.
      automatic_payment_methods: { enabled: true },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});




app.listen(3000, () =>
  console.log("✅ Server running at http://localhost:3000")
);
