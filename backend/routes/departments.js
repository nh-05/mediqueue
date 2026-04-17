/**
 * routes/departments.js
 */
const express = require('express');
const { Department } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/departments
router.get('/', async (_req, res) => {
  try {
    const depts = await Department.find({ isActive: true }).sort({ name: 1 });
    res.json(depts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/departments  (admin)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { name, prefix, room, description } = req.body;
    if (!name || !prefix) return res.status(400).json({ error: 'name and prefix required' });
    const dept = await Department.create({ name, prefix: prefix.toUpperCase(), room, description });
    res.status(201).json(dept);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/departments/:id  (admin)
router.patch('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ error: 'Not found' });
    res.json(dept);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/departments/:id  (soft delete)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await Department.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Department deactivated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
