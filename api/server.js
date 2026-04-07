const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, "data");
const requestsFile = path.join(dataDir, "requests.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(requestsFile)) {
  fs.writeFileSync(requestsFile, "[]", "utf8");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SignalBoostAI backend is running" });
});

app.get("/api/requests", (req, res) => {
  try {
    const raw = fs.readFileSync(requestsFile, "utf8");
    const requests = JSON.parse(raw);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Could not read requests" });
  }
});

app.post("/api/requests", (req, res) => {
  try {
    const { name, email, service, details } = req.body;

    if (!name || !email || !service) {
      return res.status(400).json({
        error: "Name, email, and service are required"
      });
    }

    const raw = fs.readFileSync(requestsFile, "utf8");
    const requests = JSON.parse(raw);

    const newRequest = {
      id: Date.now(),
      name,
      email,
      service,
      details: details || "",
      createdAt: new Date().toISOString()
    };

    requests.push(newRequest);
    fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2), "utf8");

    res.status(201).json({
      message: "Request submitted successfully",
      request: newRequest
    });
  } catch (error) {
    res.status(500).json({ error: "Could not save request" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`SignalBoostAI running on http://localhost:${PORT}`);
});
