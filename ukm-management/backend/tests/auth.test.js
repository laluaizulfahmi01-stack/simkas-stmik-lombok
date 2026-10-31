// tests/auth.test.js - Unit Test Autentikasi dan Otorisasi Peran SIMKAS
const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authorizeRoles } = require('../middleware/auth');

test('Auth Suite - Password Hashing & Validasi Bcrypt', async (t) => {
  const plainPassword = 'password123';

  await t.test('Hash password menghasilkan string aman yang berbeda dari plain text', async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainPassword, salt);

    assert.notEqual(hash, plainPassword);
    assert.match(hash, /^\$2[aby]\$\d+\$/);
  });

  await t.test('Verifikasi kata sandi benar mengembalikan true', async () => {
    const hash = await bcrypt.hash(plainPassword, 10);
    const isValid = await bcrypt.compare(plainPassword, hash);

    assert.strictEqual(isValid, true);
  });

  await t.test('Verifikasi kata sandi salah mengembalikan false', async () => {
    const hash = await bcrypt.hash(plainPassword, 10);
    const isValid = await bcrypt.compare('salahpassword', hash);

    assert.strictEqual(isValid, false);
  });
});

test('Auth Suite - JWT Token Lifecycle', async (t) => {
  const secretKey = 'test_secret_key_simkas_2026';
  const payload = { id: 101, role: 'manager', ukmId: 1 };

  await t.test('Membuat dan memverifikasi payload JWT secara valid', () => {
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secretKey);

    assert.strictEqual(decoded.id, 101);
    assert.strictEqual(decoded.role, 'manager');
    assert.strictEqual(decoded.ukmId, 1);
  });

  await t.test('Verifikasi token gagal jika secret key tidak cocok', () => {
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

    assert.throws(
      () => jwt.verify(token, 'wrong_secret_key'),
      (err) => err.name === 'JsonWebTokenError'
    );
  });

  await t.test('Token kadaluarsa ditolak oleh jwt.verify', () => {
    const expiredToken = jwt.sign(payload, secretKey, { expiresIn: '-1s' });

    assert.throws(
      () => jwt.verify(expiredToken, secretKey),
      (err) => err.name === 'TokenExpiredError'
    );
  });
});

test('Auth Suite - Middleware authorizeRoles (RBAC)', async (t) => {
  const managerSuperadminOnly = authorizeRoles('manager', 'superadmin');

  await t.test('Mengizinkan akses jika user memiliki role manager', () => {
    const req = { user: { id: 1, role: 'manager' } };
    let statusReturned = null;
    const res = {
      status: (code) => { statusReturned = code; return { json: () => {} }; },
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    managerSuperadminOnly(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(statusReturned, null);
  });

  await t.test('Mengizinkan akses jika user memiliki role superadmin', () => {
    const req = { user: { id: 99, role: 'superadmin' } };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    managerSuperadminOnly(req, {}, next);

    assert.strictEqual(nextCalled, true);
  });

  await t.test('Menolak akses (403 Forbidden) jika role student mengakses endpoint manager', () => {
    const req = { user: { id: 2, role: 'student' } };
    let statusReturned = null;
    let jsonMessage = null;
    const res = {
      status: (code) => {
        statusReturned = code;
        return {
          json: (data) => { jsonMessage = data.message; },
        };
      },
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    managerSuperadminOnly(req, res, next);

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusReturned, 403);
    assert.match(jsonMessage, /Forbidden/i);
  });

  await t.test('Menolak akses (401 Unauthenticated) jika user tidak ada di request', () => {
    const req = {};
    let statusReturned = null;
    const res = {
      status: (code) => {
        statusReturned = code;
        return { json: () => {} };
      },
    };

    managerSuperadminOnly(req, res, () => {});

    assert.strictEqual(statusReturned, 401);
  });
});

