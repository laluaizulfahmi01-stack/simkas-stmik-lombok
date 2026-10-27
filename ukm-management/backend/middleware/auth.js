// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

// Verify JWT and attach user to request
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  const secret = process.env.JWT_SECRET || 'simkas_stmik_lombok_super_secret_jwt_2024';
  jwt.verify(token, secret, async (err, payload) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    try {
      const user = await User.findByPk(payload.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      req.user = user; // attach full user instance
      next();
    } catch (e) {
      return res.status(500).json({ message: 'Server error' });
    }
  });
}

// Role‑based access control
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
