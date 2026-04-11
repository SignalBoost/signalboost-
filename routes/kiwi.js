import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  const { cursor = 0 } = req.query;
  const response = await fetch(
    `https://api.kiwi.com/v2/search?offset=${cursor}&limit=10&apikey=${process.env.KIWI_KEY}`
  );
  const data = await response.json();
  res.json(data);
});

export default router;
