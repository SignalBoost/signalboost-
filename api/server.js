// ===============================
// SignalBoost — Main Server File
// ===============================

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json());

// Allow requests from browser previews / other origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

// ===============================
// STATIC SITE (index.html, css, js)
// ===============================
app.use(express.static(path.join(__dirname)));

// ===============================
// API ROUTES
// ===============================
const feedRoutes = require('./api/feed');
const businessRoutes = require('./api/business');
const hybridFeedRoutes = require('./api/hybrid-feed');

app.use('/api/feed', feedRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/hybrid-feed', hybridFeedRoutes);

// ===============================
// ROOT ENDPOINT
// ===============================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Optional debug route
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'SignalBoost server is running'
  });
});

// ===============================
// START SERVER
// ===============================
app.listen(port, () => {
  console.log(`SignalBoost server running at http://localhost:${port}`);
});
