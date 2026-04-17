/**
 * routes/analytics.js — Admin Analytics Endpoints
 */
const express = require('express');
const { Appointment, Department } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/analytics/summary?date=YYYY-MM-DD
router.get('/summary', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0,0,0,0);
    const next = new Date(date); next.setDate(date.getDate() + 1);

    const [total, completed, waiting, emergency] = await Promise.all([
      Appointment.countDocuments({ date: { $gte: date, $lt: next } }),
      Appointment.countDocuments({ date: { $gte: date, $lt: next }, status: 'completed' }),
      Appointment.countDocuments({ date: { $gte: date, $lt: next }, status: 'waiting' }),
      Appointment.countDocuments({ date: { $gte: date, $lt: next }, priority: 'emergency' }),
    ]);

    // avg actual wait of completed
    const completed_appts = await Appointment.find({
      date: { $gte: date, $lt: next }, status: 'completed', actualWait: { $exists: true }
    });
    const avgWait = completed_appts.length
      ? Math.round(completed_appts.reduce((s,a) => s + (a.actualWait||0), 0) / completed_appts.length)
      : 0;

    res.json({ date, total, completed, waiting, emergency, avgWaitTime: avgWait });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/analytics/hourly?date=YYYY-MM-DD
router.get('/hourly', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0,0,0,0);
    const next = new Date(date); next.setDate(date.getDate() + 1);

    const appts = await Appointment.find({ date: { $gte: date, $lt: next } });
    const hourly = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${h}:00`,
      count: appts.filter(a => new Date(a.createdAt).getHours() === h).length,
    }));

    res.json(hourly.filter(h => h.count > 0));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/analytics/department-load
router.get('/department-load', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const date = new Date(); date.setHours(0,0,0,0);
    const next = new Date(date); next.setDate(date.getDate() + 1);

    const depts = await Department.find({ isActive: true });
    const load = await Promise.all(depts.map(async d => {
      const waiting   = await Appointment.countDocuments({ department: d._id, status: 'waiting',   date: { $gte: date, $lt: next } });
      const completed = await Appointment.countDocuments({ department: d._id, status: 'completed', date: { $gte: date, $lt: next } });
      return { department: d.name, room: d.room, waiting, completed };
    }));

    res.json(load);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
