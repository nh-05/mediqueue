/**
 * routes/appointments.js — Appointment CRUD
 */

const express = require('express');
const { Appointment, Department, Doctor } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/appointments  — list (filtered by role)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { date, status, department } = req.query;
    const filter = {};

    if (req.user.role === 'patient') filter.patient = req.user.id;
    if (req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ user: req.user.id });
      if (doc) filter.doctor = doc._id;
    }
    if (status)     filter.status     = status;
    if (department) filter.department = department;
    if (date) {
      const d = new Date(date); d.setHours(0,0,0,0);
      const next = new Date(d); next.setDate(d.getDate()+1);
      filter.date = { $gte: d, $lt: next };
    }

    const appts = await Appointment.find(filter)
      .populate('patient',    'name age phone patientId')
      .populate('department', 'name room prefix')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ priorityScore: -1, tokenNumber: 1 });

    res.json(appts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/appointments/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('patient',    'name age gender phone bloodGroup')
      .populate('department', 'name room')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });
    if (!appt) return res.status(404).json({ error: 'Not found' });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/appointments/:id  — cancel
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'patient' && appt.patient.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    appt.status = 'cancelled';
    await appt.save();
    res.json({ message: 'Appointment cancelled', appt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
