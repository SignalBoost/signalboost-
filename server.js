import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AFFILIATE_RULES = [
  {
    keywords: ["flight", "flights", "airfare", "cheap flight", "air ticket"],
    links: [
      { title: "Kiwi Flights", url: "https://www.awin1.com/cread.php?awinmid=19856&awinaffid=2834806" },
      { title: "Aviasales", url: "https://aviasales.tpo.lv/VoWXgFFm" }
    ]
  },
  {
    keywords: ["hotel", "hotels", "stay", "accommodation", "resort"],
    links: [
      { title: "Hotels.com", url: "https://hotels.tpo.lv/rHr4mbOu" },
      { title: "Agoda", url: "https://agoda.tpo.lv/UEhQ1dwR" }
    ]
  },
  {
    keywords: ["sim", "esim", "internet", "data roaming", "travel data"],
    links: [
      { title: "Airalo", url: "https://airalo.tpo.lv/eXjKLiuw" },
      { title: "Yesim", url: "https://yesim.tpo.lv/3vIzBQts" }
    ]
  },
  {
    keywords: ["taxi", "transfer", "airport transfer", "pickup"],
    links: [
      { title: "Holiday Taxis", url: "https://holidaytaxis.tpo.lv/oHwpbrFt" },
      { title: "GetTransfer", url: "https://gettransfer.tpo.lv/Pb4p9ljm" }
    ]
  },
  {
    keywords: ["tour", "tickets", "museum", "activity", "things to do"],
    links: [
      { title: "Klook", url: "https://klook.tpo.lv/pTp1NljF" },
      { title: "Tiqets", url: "https://www.awin1.com/cread.php?awinmid=12428&awinaffid=2834806" }
    ]
  }
];

function getAffiliateSuggestions(query) {
  const q = query.toLowerCase();
  const out = [];
  const seen = new Set();

  for (const rule of AFFILIATE_RULES) {
    if (rule.keywords.some(k => q.includes(k))) {
      for (const link of rule.links) {
        if (!seen.has(link.url)) {
          seen.add(link.url);
          out.push(link);
        }
      }
    }
  }

  return out.slice(0, 4);
}

app.post("/api/ask", async (req, res) => {
  try {
    const query = String(req.body?.query || "").trim();
    if (!query) {
      return res.status(400).json({ error: "Missing query" });
    }

    const response = await client.responses.create({
      model: "gpt-5.4",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "Answer clearly and directly. Use live web search. Keep answers concise but useful. Include source links."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: query
            }
          ]
        }
      ],
      tools: [{ type: "web_search" }],
      include: ["web_search_call.action.sources"]
    });

    const sources = [];
    for (const item of response.output || []) {
      if (item.type === "web_search_call" && item.action?.sources) {
        for (const src of item.action.sources) {
          if (src?.url) {
            sources.push({
              title: src.title || src.url,
              url: src.url
            });
          }
        }
      }
    }

    const uniqueSources = [];
    const seen = new Set();
    for (const src of sources) {
      if (seen.has(src.url)) continue;
      seen.add(src.url);
      uniqueSources.push(src);
    }

    return res.json({
      answer: response.output_text || "No answer returned.",
      sources: uniqueSources.slice(0, 6),
      affiliates: getAffiliateSuggestions(query)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "AI request failed." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
