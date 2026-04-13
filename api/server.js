// ===============================
// SignalBoost — Main Server File
// ===============================

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ===============================
// STATIC SITE (index.html, css, js)
// ===============================
app.use(express.static(path.join(__dirname)));

// ===============================
// API ROUTES
// ===============================

// Existing routes
const feedRoutes = require('./api/feed');
const businessRoutes = require('./api/business');

// NEW hybrid feed route
const hybridFeedRoutes = require('./api/hybrid-feed');

// Register routes
app.use('/api/feed', feedRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/hybrid-feed', hybridFeedRoutes);

// ===============================
// ROOT ENDPOINT
// ===============================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ===============================
// START SERVER
// ===============================
app.listen(port, () => {
  console.log(`SignalBoost server running at http://localhost:${port}`);
});
