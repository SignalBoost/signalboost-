// ======================================
// MAIN EXPRESS BACKEND SERVER
// ======================================

const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static frontend
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// API ROUTES
// ===============================

// Column 2 Feed Server
const feedServer = require("./server/feedServer");
app.use("/api", feedServer);

// Partners / Business API
const partnersServer = require("./server/partnersServer");
app.use("/api", partnersServer);

// ===============================
// FALLBACK ROUTE (SPA support)
// ===============================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
