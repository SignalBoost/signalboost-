/**
 * ==========================================================
 * SIGNALBOOST /api/intent
 * ==========================================================
 *
 * PURPOSE
 * - Accept a natural-language query from the public homepage
 * - Classify the user’s intent into a business-friendly structure
 * - Return a clean decision object for the frontend
 * - Fall back to local heuristics if the AI request fails
 *
 * PUBLIC PRODUCT GOAL
 * - The site can be AI-driven without looking AI-driven.
 * - Users should feel guided, not exposed to backend complexity.
 *
 * EXPECTED FRONTEND INPUT
 * ----------------------------------------------------------
 * POST /api/intent
 * {
 *   "query": "cheap flight and hotel to miami",
 *   "sessionId": "sb_xxxxx",
 *   "lastDepartment": "travel",
 *   "lastClicks": [...],
 *   "searchHistory": [...]
 * }
 *
 * RESPONSE SHAPE
 * ----------------------------------------------------------
 * {
 *   department: "travel",
 *   subdepartment: "packages",
 *   confidence: "high",
 *   reasoning: "...",
 *   primaryGoal: "...",
 *   providerOrder: ["expedia_packages", "expedia_hotels", "vrbo"],
 *   upsells: ["esim", "car_rental"],
 *   needsClarification: false,
 *   clarificationQuestion: ""
 * }
 *
 * DEPLOYMENT NOTES
 * ----------------------------------------------------------
 * 1. Put this file at: /api/intent.js
 * 2. Add OPENAI_API_KEY in Vercel environment variables
 * 3. Install the OpenAI package in your project
 * 4. Redeploy
 *
 * OPTIONAL ENV VARS
 * ----------------------------------------------------------
 * OPENAI_API_KEY=...
 * OPENAI_INTENT_MODEL=gpt-4.1-mini
 *
 * DESIGN PRINCIPLE
 * ----------------------------------------------------------
 * - Return stable JSON
 * - Keep the frontend simple
 * - Avoid leaking technical language to the public UI
 * - Always fail safely
 */

import OpenAI from "openai";

/**
 * ==========================================================
 * CONFIG
 * ==========================================================
 */
const CONFIG = {
  model: process.env.OPENAI_INTENT_MODEL || "gpt-4.1-mini",
  temperature: 0.2,
  maxQueryLength: 500,
  maxHistoryItems: 8,
  maxClicksItems: 8,
  allowedDepartments: ["travel", "tech", "business", "general"],
  allowedSubdepartments: [
    "hotels",
    "packages",
    "rentals",
    "connectivity",
    "gadgets",
    "tools",
    "marketing",
    "general"
  ],
  allowedConfidence: ["low", "medium", "high"],
  allowedProviders: [
    "expedia_hotels",
    "expedia_packages",
    "hotels_com",
    "vrbo",
    "esim",
    "gadgets",
    "website_builder",
    "marketing_tools"
  ],
  allowedUpsells: [
    "esim",
    "car_rental",
    "travel_insurance",
    "airport_transfer",
    "activities",
    "gadgets",
    "marketing_tools",
    "website_builder",
    "none"
  ]
};

/**
 * ==========================================================
 * OPENAI CLIENT
 * ==========================================================
 */
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * ==========================================================
 * RESPONSE HELPERS
 * ==========================================================
 */
function sendJson(res, statusCode, body) {
  res.status(statusCode).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body, null, 2));
}

function safeString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function safeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function truncate(str, maxLen) {
  return safeString(str).slice(0, maxLen);
}

/**
 * ==========================================================
 * REQUEST VALIDATION / NORMALIZATION
 * ==========================================================
 */
function normalizeRequestBody(body) {
  const query = truncate(body?.query || "", CONFIG.maxQueryLength).trim();
  const sessionId = truncate(body?.sessionId || "", 200).trim();
  const lastDepartment = truncate(body?.lastDepartment || "", 100).trim();

  const lastClicks = safeArray(body?.lastClicks, [])
    .slice(0, CONFIG.maxClicksItems)
    .map((item) => ({
      title: truncate(item?.title || "", 120),
      department: truncate(item?.department || "", 60),
      query: truncate(item?.query || "", 200),
      timestamp: truncate(item?.timestamp || "", 80)
    }));

  const searchHistory = safeArray(body?.searchHistory, [])
    .slice(0, CONFIG.maxHistoryItems)
    .map((item) => truncate(item, 200));

  return {
    query,
    sessionId,
    lastDepartment,
    lastClicks,
    searchHistory
  };
}

function validateNormalizedBody(normalized) {
  const errors = [];

  if (!normalized.query) {
    errors.push("query is required");
  }

  if (normalized.query.length > CONFIG.maxQueryLength) {
    errors.push("query is too long");
  }

  return errors;
}

/**
 * ==========================================================
 * SCHEMA
 * ==========================================================
 * Structured Outputs shape returned by the model.
 */
const intentJsonSchema = {
  name: "signalboost_intent_classification",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      department: {
        type: "string",
        enum: CONFIG.allowedDepartments
      },
      subdepartment: {
        type: "string",
        enum: CONFIG.allowedSubdepartments
      },
      confidence: {
        type: "string",
        enum: CONFIG.allowedConfidence
      },
      reasoning: {
        type: "string"
      },
      primaryGoal: {
        type: "string"
      },
      providerOrder: {
        type: "array",
        items: {
          type: "string",
          enum: CONFIG.allowedProviders
        }
      },
      upsells: {
        type: "array",
        items: {
          type: "string",
          enum: CONFIG.allowedUpsells
        }
      },
      needsClarification: {
        type: "boolean"
      },
      clarificationQuestion: {
        type: "string"
      }
    },
    required: [
      "department",
      "subdepartment",
      "confidence",
      "reasoning",
      "primaryGoal",
      "providerOrder",
      "upsells",
      "needsClarification",
      "clarificationQuestion"
    ]
  }
};

/**
 * ==========================================================
 * PROMPT BUILDERS
 * ==========================================================
 */
function buildDeveloperMessage() {
  return [
    "You are the intent-classification engine for SignalBoost.",
    "SignalBoost is a public shopping/discovery platform.",
    "Your job is to classify user intent for routing, ranking, and monetization.",
    "",
    "BUSINESS RULES",
    "- Prefer travel when the user asks about hotels, stays, rentals, flights, vacations, trips, packages, destinations, resorts, or cities in a travel context.",
    "- Prefer tech when the user asks about esim, phone data, gadgets, chargers, laptops, accessories, or connectivity.",
    "- Prefer business when the user asks about websites, website builders, domains, hosting, marketing tools, launching a business, or online business tools.",
    "- Use general only if no strong match exists.",
    "",
    "SUBDEPARTMENT RULES",
    "- travel/hotels for hotel/stay/city accommodation searches",
    "- travel/packages for bundled flight + hotel style searches",
    "- travel/rentals for villas, homes, family rentals, vacation rentals",
    "- tech/connectivity for esim, roaming, mobile data, travel connectivity",
    "- tech/gadgets for gear, chargers, devices, accessories",
    "- business/tools for website builders, domains, hosting, generic business software",
    "- business/marketing for outreach, campaigns, email marketing, ads",
    "- general/general when intent is vague",
    "",
    "PROVIDER ORDER RULES",
    "- travel/hotels usually favor: expedia_hotels, hotels_com, vrbo",
    "- travel/packages usually favor: expedia_packages, expedia_hotels, vrbo",
    "- travel/rentals usually favor: vrbo, expedia_hotels, hotels_com",
    "- tech/connectivity usually favor: esim, gadgets",
    "- tech/gadgets usually favor: gadgets, esim",
    "- business/tools usually favor: website_builder, marketing_tools",
    "- business/marketing usually favor: marketing_tools, website_builder",
    "",
    "UPSSELL RULES",
    "- travel may upsell: esim, car_rental, travel_insurance, airport_transfer, activities",
    "- tech may upsell: gadgets, none",
    "- business may upsell: marketing_tools, website_builder, none",
    "",
    "OUTPUT RULES",
    "- Return only valid schema-matching JSON.",
    "- reasoning must be short, clear, and product-friendly.",
    "- primaryGoal should summarize the user’s core task.",
    "- If the query is ambiguous, set needsClarification=true and provide a short clarificationQuestion.",
    "- If no clarification is needed, clarificationQuestion must be an empty string."
  ].join("\n");
}

function buildUserMessage(normalized) {
  return JSON.stringify(
    {
      query: normalized.query,
      sessionId: normalized.sessionId || "",
      lastDepartment: normalized.lastDepartment || "",
      searchHistory: normalized.searchHistory,
      lastClicks: normalized.lastClicks
    },
    null,
    2
  );
}

/**
 * ==========================================================
 * OPENAI CLASSIFICATION
 * ==========================================================
 */
async function classifyWithOpenAI(normalized) {
  if (!client) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const response = await client.chat.completions.create({
    model: CONFIG.model,
    temperature: CONFIG.temperature,
    response_format: {
      type: "json_schema",
      json_schema: intentJsonSchema
    },
    messages: [
      {
        role: "developer",
        content: buildDeveloperMessage()
      },
      {
        role: "user",
        content: buildUserMessage(normalized)
      }
    ]
  });

  const content = response?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Model returned empty content");
  }

  const parsed = JSON.parse(content);
  return sanitizeModelResult(parsed);
}

/**
 * ==========================================================
 * MODEL RESULT SANITIZATION
 * ==========================================================
 */
function sanitizeModelResult(result) {
  const department = CONFIG.allowedDepartments.includes(result?.department)
    ? result.department
    : "general";

  const subdepartment = CONFIG.allowedSubdepartments.includes(result?.subdepartment)
    ? result.subdepartment
    : "general";

  const confidence = CONFIG.allowedConfidence.includes(result?.confidence)
    ? result.confidence
    : "medium";

  const providerOrder = safeArray(result?.providerOrder, []).filter((item) =>
    CONFIG.allowedProviders.includes(item)
  );

  const upsells = safeArray(result?.upsells, []).filter((item) =>
    CONFIG.allowedUpsells.includes(item)
  );

  return {
    department,
    subdepartment,
    confidence,
    reasoning: truncate(result?.reasoning || "SignalBoost selected this path based on the request.", 400),
    primaryGoal: truncate(result?.primaryGoal || "Help the user take the next useful step.", 240),
    providerOrder: providerOrder.length ? providerOrder : getDefaultProviderOrder(department, subdepartment),
    upsells: upsells.length ? upsells : getDefaultUpsells(department, subdepartment),
    needsClarification: Boolean(result?.needsClarification),
    clarificationQuestion: result?.needsClarification
      ? truncate(result?.clarificationQuestion || "Can you clarify what you want most?", 240)
      : ""
  };
}

/**
 * ==========================================================
 * LOCAL FALLBACK INTELLIGENCE
 * ==========================================================
 * Used if OpenAI is unavailable or errors.
 */
function classifyWithFallback(normalized) {
  const q = normalized.query.toLowerCase();

  if (
    q.includes("flight") ||
    q.includes("package") ||
    q.includes("hotel") ||
    q.includes("stay") ||
    q.includes("trip") ||
    q.includes("travel") ||
    q.includes("vacation") ||
    q.includes("rental") ||
    q.includes("villa") ||
    q.includes("resort")
  ) {
    if (q.includes("flight") || q.includes("package")) {
      return {
        department: "travel",
        subdepartment: "packages",
        confidence: "high",
        reasoning: "This looks like a bundled trip request, so package-style travel options are prioritized.",
        primaryGoal: "Find a flight + hotel style travel path.",
        providerOrder: ["expedia_packages", "expedia_hotels", "vrbo"],
        upsells: ["esim", "car_rental", "travel_insurance"],
        needsClarification: false,
        clarificationQuestion: ""
      };
    }

    if (
      q.includes("rental") ||
      q.includes("villa") ||
      q.includes("family") ||
      q.includes("home")
    ) {
      return {
        department: "travel",
        subdepartment: "rentals",
        confidence: "high",
        reasoning: "This looks like a rental-focused trip, so larger-stay options are shown first.",
        primaryGoal: "Find a rental-style place to stay.",
        providerOrder: ["vrbo", "expedia_hotels", "hotels_com"],
        upsells: ["esim", "car_rental", "activities"],
        needsClarification: false,
        clarificationQuestion: ""
      };
    }

    return {
      department: "travel",
      subdepartment: "hotels",
      confidence: "high",
      reasoning: "This looks like a hotel or stay search, so hotel-focused travel paths are shown first.",
      primaryGoal: "Find accommodation for a trip.",
      providerOrder: ["expedia_hotels", "hotels_com", "vrbo"],
      upsells: ["esim", "car_rental", "airport_transfer"],
      needsClarification: false,
      clarificationQuestion: ""
    };
  }

  if (
    q.includes("esim") ||
    q.includes("sim") ||
    q.includes("roaming") ||
    q.includes("data plan") ||
    q.includes("charger") ||
    q.includes("gadget") ||
    q.includes("laptop") ||
    q.includes("phone")
  ) {
    if (
      q.includes("esim") ||
      q.includes("sim") ||
      q.includes("roaming") ||
      q.includes("data")
    ) {
      return {
        department: "tech",
        subdepartment: "connectivity",
        confidence: "high",
        reasoning: "This looks like a connectivity request, so eSIM-style options are prioritized.",
        primaryGoal: "Get connected with mobile data or travel connectivity.",
        providerOrder: ["esim", "gadgets"],
        upsells: ["gadgets"],
        needsClarification: false,
        clarificationQuestion: ""
      };
    }

    return {
      department: "tech",
      subdepartment: "gadgets",
      confidence: "medium",
      reasoning: "This looks like a gear or device request, so gadgets are prioritized.",
      primaryGoal: "Find practical tech or accessories.",
      providerOrder: ["gadgets", "esim"],
      upsells: ["none"],
      needsClarification: false,
      clarificationQuestion: ""
    };
  }

  if (
    q.includes("website") ||
    q.includes("domain") ||
    q.includes("hosting") ||
    q.includes("business") ||
    q.includes("email marketing") ||
    q.includes("marketing") ||
    q.includes("builder")
  ) {
    if (q.includes("marketing") || q.includes("email marketing") || q.includes("campaign")) {
      return {
        department: "business",
        subdepartment: "marketing",
        confidence: "high",
        reasoning: "This looks like a marketing request, so marketing-tool paths are prioritized.",
        primaryGoal: "Find tools to promote or grow a business.",
        providerOrder: ["marketing_tools", "website_builder"],
        upsells: ["website_builder"],
        needsClarification: false,
        clarificationQuestion: ""
      };
    }

    return {
      department: "business",
      subdepartment: "tools",
      confidence: "high",
      reasoning: "This looks like a business setup request, so website and business tools are prioritized.",
      primaryGoal: "Find tools to launch or run a business online.",
      providerOrder: ["website_builder", "marketing_tools"],
      upsells: ["marketing_tools"],
      needsClarification: false,
      clarificationQuestion: ""
    };
  }

  return {
    department: "general",
    subdepartment: "general",
    confidence: "low",
    reasoning: "The request is broad, so SignalBoost would benefit from one more detail.",
    primaryGoal: "Understand the user’s main category and next step.",
    providerOrder: [],
    upsells: ["none"],
    needsClarification: true,
    clarificationQuestion: "Are you looking for travel, tech, or business tools?"
  };
}

/**
 * ==========================================================
 * DEFAULTS
 * ==========================================================
 */
function getDefaultProviderOrder(department, subdepartment) {
  if (department === "travel" && subdepartment === "packages") {
    return ["expedia_packages", "expedia_hotels", "vrbo"];
  }
  if (department === "travel" && subdepartment === "rentals") {
    return ["vrbo", "expedia_hotels", "hotels_com"];
  }
  if (department === "travel") {
    return ["expedia_hotels", "hotels_com", "vrbo"];
  }
  if (department === "tech" && subdepartment === "connectivity") {
    return ["esim", "gadgets"];
  }
  if (department === "tech") {
    return ["gadgets", "esim"];
  }
  if (department === "business" && subdepartment === "marketing") {
    return ["marketing_tools", "website_builder"];
  }
  if (department === "business") {
    return ["website_builder", "marketing_tools"];
  }
  return [];
}

function getDefaultUpsells(department, subdepartment) {
  if (department === "travel") {
    if (subdepartment === "packages") return ["esim", "car_rental", "travel_insurance"];
    if (subdepartment === "rentals") return ["esim", "car_rental", "activities"];
    return ["esim", "airport_transfer"];
  }
  if (department === "tech") return ["gadgets"];
  if (department === "business") return ["marketing_tools"];
  return ["none"];
}

/**
 * ==========================================================
 * MAIN HANDLER
 * ==========================================================
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, {
      ok: false,
      error: "Method not allowed. Use POST."
    });
  }

  const normalized = normalizeRequestBody(req.body);
  const errors = validateNormalizedBody(normalized);

  if (errors.length) {
    return sendJson(res, 400, {
      ok: false,
      error: "Invalid request body.",
      details: errors
    });
  }

  try {
    let result;
    let source = "fallback";

    try {
      result = await classifyWithOpenAI(normalized);
      source = "openai";
    } catch (aiError) {
      result = classifyWithFallback(normalized);
      source = "fallback";
    }

    return sendJson(res, 200, {
      ok: true,
      source,
      ...result
    });
  } catch (error) {
    return sendJson(res, 200, {
      ok: true,
      source: "fallback",
      ...classifyWithFallback(normalized)
    });
  }
}
