const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
const feedRoutes = require('./api/feed');
const businessRoutes = require('./api/business');

app.use('/api/feed', feedRoutes);
app.use('/api/business', businessRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('SignalBoost API is running...');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
