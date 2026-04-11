import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  const { cursor = 0 } = req.query;
  const response = await fetch(
    `https://api.trivago.com/hotels?start=${cursor}&count=10&apikey=${process.env.TRIVAGO_KEY}`
  );
  const data = await response.json();
  res.json(data);
});

export default router;
