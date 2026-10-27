// security/index.js - Enterprise Cyber Security Module for SIMKAS
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

// 1. Rate Limiting Configurations (Anti Brute-Force & DDoS)
const isDev = process.env.NODE_ENV !== 'production';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 30, // Relaxed in dev to prevent blocking user testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Terlalu banyak percobaan akses (Rate limit tercapai). Silakan coba lagi setelah 15 menit demi keamanan sistem.',
  },
});

const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 1000, // Generous limit for smooth testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Permintaan melebihi batas wajar. Mohon tunggu beberapa saat.',
  },
});

// 2. HTTP Security Headers with Helmet
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'http://localhost:*', 'http://127.0.0.1:*'],
    },
  },
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' }, // Anti-Clickjacking
  noSniff: true, // Anti-MIME sniffing
  xssFilter: true, // XSS filter
  hsts: isDev ? false : { maxAge: 31536000, includeSubDomains: true },
});

// 3. Input Sanitizer (XSS & Injection Protection)
function sanitizeInput(req, res, next) {
  function clean(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        // Strip common script execution patterns
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/onload=/gi, '')
          .replace(/onerror=/gi, '');
      } else if (typeof obj[key] === 'object') {
        clean(obj[key]);
      }
    }
    return obj;
  }

  if (req.body) req.body = clean(req.body);
  if (req.query) req.query = clean(req.query);
  if (req.params) req.params = clean(req.params);

  next();
}

// 4. Security Audit Logger
const auditLogPath = path.resolve(__dirname, 'audit.log');

function auditLog(action, userId, details = {}) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ACTION=${action} USER_ID=${userId || 'GUEST'} IP=${details.ip || '-'} DETAILS=${JSON.stringify(details)}\n`;
  fs.appendFile(auditLogPath, entry, (err) => {
    if (err) console.error('Gagal mencatat audit log:', err);
  });

  // DB persistence
  try {
    const { AuditLog } = require('../models');
    if (AuditLog) {
      AuditLog.create({
        action,
        userId: userId || null,
        details: typeof details === 'string' ? details : JSON.stringify(details),
        ip: details.ip || null,
      }).catch(() => {});
    }
  } catch (e) {}
}

module.exports = {
  authLimiter,
  generalApiLimiter,
  securityHeaders,
  sanitizeInput,
  auditLog,
};
