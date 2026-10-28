// src/index.js  –  Express entry point with Enterprise Cyber Security
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const { sequelize } = require('../models');
const {
  securityHeaders,
  generalApiLimiter,
  sanitizeInput,
  auditLog,
} = require('../security');

const app = express();

// ── Enterprise Cyber Security Suite ─────────────────────────────────────────
app.use(securityHeaders);

const allowedOrigins = [
  'http://localhost:5173', 'http://127.0.0.1:5173',
  'http://localhost:5174', 'http://127.0.0.1:5174',
  'http://localhost:3000', 'http://127.0.0.1:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
      /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);
app.use('/api', generalApiLimiter);

// ── Security Request Logger Middleware ──────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      auditLog('HTTP_WARNING', req.user?.id || null, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        ip: req.ip || req.connection.remoteAddress,
        durationMs: Date.now() - start,
      });
    }
  });
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('../routes/auth'));
app.use('/api/profile',      require('../routes/profile'));
app.use('/api/ukm',          require('../routes/ukm'));
app.use('/api/transactions', require('../routes/transactions'));
app.use('/api/attendance',   require('../routes/attendance'));
app.use('/api/admin',        require('../routes/admin'));
app.use('/api/applications', require('../routes/applications'));
app.use('/api/dues',         require('../routes/dues'));
app.use('/api/events',       require('../routes/events'));

// Health check
app.get('/', (req, res) => res.json({
  status: 'ok',
  app: 'SIMKAS UKM STMIK Lombok',
  security: 'Enterprise Shield Active (Helmet + RateLimit + XSS Sanitize + AuditLog)',
}));

// ── Secure Global Error Handler (Prevents stack trace leaks) ───────────────
app.use((err, req, res, next) => {
  console.error('⚠️  Internal Error caught by Security Handler:', err.message);
  auditLog('UNHANDLED_EXCEPTION', req.user?.id || null, {
    error: err.message,
    path: req.originalUrl,
    ip: req.ip,
  });
  res.status(err.status || 500).json({
    message: err.message && process.env.NODE_ENV === 'development'
      ? err.message
      : 'Terjadi kesalahan pada sistem. Silakan hubungi administrator.',
  });
});

// ── Global Process Guards ────────────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection caught:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught Exception caught:', err.message);
});

// ── Sync DB & Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  sequelize.sync({ force: false }).then(() => {
    console.log('✅  Database connected & synced');
    console.log('🛡️  Cyber Security Shield Active (Helmet, RateLimiter, Sanitizer, AuditLogger)');
    const server = app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️  Port ${PORT} sedang digunakan oleh proses lain (Server API sudah aktif di background).`);
      } else {
        console.error('❌  Server error:', err);
      }
    });
  }).catch(err => {
    console.error('❌  DB connection failed:', err);
    process.exit(1);
  });
}

module.exports = app;
