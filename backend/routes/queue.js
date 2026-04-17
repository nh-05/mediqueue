/**
 * routes/queue.js — Smart Queue Management
 * Core logic: token assignment, next-patient calling, AI wait-time estimation.
 */

const express = require('express');
const { Appointment, Queue, Department, Doctor } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── AI PRIORITY SCORING ───────────────────────────────────────
/**
 * Calculates a priority score (higher = served sooner).
 * emergency > vip > elderly > standard
 * Also weighs waiting time so no-one starves.
 */
function calcPriorityScore({ priority, waitMins = 0, age = 0 }) {
  const baseScore = { emergency: 1000, vip: 500, elderly: 300, standard: 100 }[priority] || 100;
  const ageBonus  = age >= 65 ? 50 : 0;
  const waitBonus = Math.min(waitMins * 2, 200); // reward patience
  return baseScore + ageBonus + waitBonus;
}

// ── ESTIMATE WAIT TIME ────────────────────────────────────────
/**
 * AI-based estimated wait time.
 * Uses queue position + avg consult time, adjusted by priority.
 */
async function estimateWait(departmentId, priority, date) {
  const today = new Date(date);
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  const waiting = await Appointment.countDocuments({
    department: departmentId,
    status:     { $in: ['waiting'] },
    date:       { $gte: today, $lt: tomorrow },
  });

  const queue = await Queue.findOne({ department: departmentId, date: { $gte: today, $lt: tomorrow } });
  const avgTime = queue ? queue.avgWaitTime || 10 : 10;

  const priorityMultiplier = { emergency: 0, vip: 0.2, elderly: 0.5, standard: 1 }[priority] || 1;
  return Math.round(waiting * avgTime * priorityMultiplier);
}

// GET /api/queue/department/:deptId  — live queue for a department
router.get('/department/:deptId', async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    const appointments = await Appointment.find({
      department: req.params.deptId,
      status: { $in: ['waiting', 'in-consultation'] },
      date:   { $gte: today, $lt: tomorrow },
    })
      .populate('patient', 'name age gender')
      .populate('doctor',  'room')
      .sort({ priorityScore: -1, tokenNumber: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/queue/all  — snapshot of all departments
router.get('/all', async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    const depts = await Department.find({ isActive: true });
    const snapshot = await Promise.all(depts.map(async (dept) => {
      const count   = await Appointment.countDocuments({ department: dept._id, status: 'waiting', date: { $gte: today, $lt: tomorrow } });
      const current = await Appointment.findOne({ department: dept._id, status: 'in-consultation', date: { $gte: today, $lt: tomorrow } })
        .populate('patient', 'name');
      return {
        department: dept.name,
        room:       dept.room,
        prefix:     dept.prefix,
        waiting:    count,
        current:    current ? current.token : '—',
      };
    }));

    res.json(snapshot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/queue/token  — generate a new token
router.post('/token', authMiddleware, async (req, res) => {
  try {
    const { departmentId, doctorId, priority = 'standard', reason, date, isWalkIn = false } = req.body;
    if (!departmentId) return res.status(400).json({ error: 'departmentId required' });

    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(404).json({ error: 'Department not found' });

    const apptDate = date ? new Date(date) : new Date();
    const today = new Date(apptDate); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    // Get or create today's queue
    let queue = await Queue.findOne({ department: departmentId, date: { $gte: today, $lt: tomorrow } });
    if (!queue) {
      queue = await Queue.create({ department: departmentId, doctor: doctorId || null, date: today });
    }

    const tokenNumber = ++queue.tokenCounter;
    const token = `${dept.prefix}-${String(tokenNumber).padStart(3, '0')}`;

    // Score & wait estimate
    const patientAge = req.user.age || 0;
    const score      = calcPriorityScore({ priority, age: patientAge });
    const estWait    = await estimateWait(departmentId, priority, apptDate);

    const appointment = await Appointment.create({
      patient:       req.user.id,
      doctor:        doctorId || null,
      department:    departmentId,
      token,
      tokenNumber,
      date:          apptDate,
      reason,
      priority,
      priorityScore: score,
      estimatedWait: estWait,
      isWalkIn,
    });

    await queue.save();
    res.status(201).json({ appointment, token, estimatedWait: estWait });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/queue/call-next/:doctorId  — doctor calls next patient
router.patch('/call-next/:doctorId', authMiddleware, requireRole(['doctor', 'admin']), async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    // Complete current in-consultation
    await Appointment.findOneAndUpdate(
      { doctor: req.params.doctorId, status: 'in-consultation' },
      { status: 'completed', completedAt: new Date() }
    );

    // Find next by priority score
    const next = await Appointment.findOne({
      doctor: req.params.doctorId,
      status: 'waiting',
      date:   { $gte: today, $lt: tomorrow },
    })
      .populate('patient', 'name age phone')
      .sort({ priorityScore: -1, tokenNumber: 1 });

    if (!next) return res.json({ message: 'Queue is empty', next: null });

    next.status   = 'in-consultation';
    next.calledAt = new Date();
    await next.save();

    res.json({ message: 'Patient called', next });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/queue/complete/:appointmentId  — mark complete
router.patch('/complete/:appointmentId', authMiddleware, requireRole(['doctor', 'admin']), async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.appointmentId);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    appt.status      = 'completed';
    appt.completedAt = new Date();
    if (appt.calledAt) {
      appt.actualWait = Math.round((appt.completedAt - appt.calledAt) / 60000);
    }
    if (req.body.notes) appt.notes = req.body.notes;
    await appt.save();
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
