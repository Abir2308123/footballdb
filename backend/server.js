// Express server entry point - configures middleware, CORS, and API routes
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/leagues', require('./routes/leagues'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/players', require('./routes/players'));
app.use('/api/managers', require('./routes/managers'));
app.use('/api/venues', require('./routes/venues'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/standings', require('./routes/standings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n⚽ Football League API Server`);
  console.log(`🚀 Running on http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api\n`);
});
