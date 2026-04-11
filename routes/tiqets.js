import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  const { cursor = 0 } = req.query;
  const response = await fetch(
    `https://api.tiqets.com/v2/products?offset=${cursor}&limit=10&apikey=${process.env.TIQETS_KEY}`
  );
  const data = await response.json();
  res.json(data);
});

export default router;
