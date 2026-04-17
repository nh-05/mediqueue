/**
 * middleware/auth.js — JWT Authentication Middleware
 */

const jwt = require('jsonwebtoken');

/**
 * Verifies the Bearer token in the Authorization header.
 * Attaches decoded user payload to req.user.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Role guard factory. Usage: requireRole('admin') or requireRole(['admin','doctor'])
 */
function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${allowed.join(' or ')}` });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
