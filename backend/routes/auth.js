/**
 * routes/auth.js — Register / Login / Me
 */

const express = require('express');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password, phone, age, gender, bloodGroup } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const patientId = 'MQ-' + Math.floor(100000 + Math.random() * 900000);
    const user = await User.create({ name, email, password, phone, age, gender, bloodGroup, patientId, role: 'patient' });
    const token = signToken(user);

    res.status(201).json({ token, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me  (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
