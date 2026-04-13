// ===============================
// SignalBoost — Main Server File
// ===============================

const express = require('express');
const path = require('path');
const cors = require('cors'); // ✅ IMPORTANT

const app = express();
const port = process.env.PORT || 3000;

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json());

// ✅ THIS FIXES YOUR ERROR (CORS)
app.use(cors());

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
// TEST ROUTE (VERY IMPORTANT)
// ===============================
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server is working' });
});

// ===============================
// ROOT
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
