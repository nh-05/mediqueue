/**
 * server.js — MediQueue Express Server
 * Entry point: mounts all routes, connects to MongoDB.
 */

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const mongoose   = require('mongoose');

const authRoutes       = require('./routes/auth');
const patientRoutes    = require('./routes/patients');
const doctorRoutes     = require('./routes/doctors');
const deptRoutes       = require('./routes/departments');
const appointmentRoutes= require('./routes/appointments');
const queueRoutes      = require('./routes/queue');
const analyticsRoutes  = require('./routes/analytics');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── MIDDLEWARE ─────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── REQUEST LOGGER (dev) ──────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ── ROUTES ─────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/departments',  deptRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue',        queueRoutes);
app.use('/api/analytics',    analyticsRoutes);

// ── HEALTH CHECK ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── 404 ────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── ERROR HANDLER ──────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── DATABASE + START ──────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mediqueue')
  .then(() => {
    console.log('✓ MongoDB connected');
    app.listen(PORT, () => console.log(`✓ MediQueue API running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('✗ MongoDB connection error:', err); process.exit(1); });
