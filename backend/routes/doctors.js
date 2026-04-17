/**
 * routes/doctors.js
 */
const express = require('express');
const { Doctor, User, Department } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/doctors
router.get('/', async (req, res) => {
  try {
    const { department } = req.query;
    const filter = department ? { department } : {};
    const doctors = await Doctor.find(filter)
      .populate('user',       'name email phone')
      .populate('department', 'name room');
    res.json(doctors);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id)
      .populate('user',       'name email phone')
      .populate('department', 'name room');
    if (!doc) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/doctors/:id/status  (admin or the doctor themselves)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active','break','off'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });
    const doc = await Doctor.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/doctors  (admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { userId, departmentId, specialization, room, avgConsultTime } = req.body;
    if (!userId || !departmentId) return res.status(400).json({ error: 'userId and departmentId required' });
    const doc = await Doctor.create({ user: userId, department: departmentId, specialization, room, avgConsultTime });
    await User.findByIdAndUpdate(userId, { role: 'doctor' });
    res.status(201).json(doc);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
