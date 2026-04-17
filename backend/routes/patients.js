/**
 * routes/patients.js
 */
const express = require('express');
const { User } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/patients  (admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password').sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/patients/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Patient not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/patients/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id)
      return res.status(403).json({ error: 'Forbidden' });
    const allowed = ['name','phone','age','gender','bloodGroup','address'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
