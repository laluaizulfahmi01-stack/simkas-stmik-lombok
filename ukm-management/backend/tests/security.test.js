// tests/security.test.js - Unit Test Keamanan dan Input Sanitizer SIMKAS
const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeInput } = require('../security');

test('Security Suite - Input Sanitizer Middleware', async (t) => {
  await t.test('Menghapus tag <script> berbahaya dari req.body', () => {
    const req = {
      body: {
        title: 'Laporan Kas UKM',
        description: 'Biaya konsumsi <script>alert("XSS")</script> untuk rapat',
      },
      query: {},
      params: {},
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    sanitizeInput(req, {}, next);

    assert.equal(nextCalled, true, 'Middleware harus memanggil next()');
    assert.equal(req.body.title, 'Laporan Kas UKM');
    assert.equal(req.body.description, 'Biaya konsumsi  untuk rapat');
  });

  await t.test('Menghapus skema protokol javascript: dari input', () => {
    const req = {
      body: {
        link: 'javascript:document.cookie',
        nested: {
          url: 'JAVASCRIPT:maliciousCode()',
        },
      },
      query: {},
      params: {},
    };

    sanitizeInput(req, {}, () => {});

    assert.equal(req.body.link, 'document.cookie');
    assert.equal(req.body.nested.url, 'maliciousCode()');
  });

  await t.test('Menghapus event listener inline onload= dan onerror=', () => {
    const req = {
      body: {
        imgTag: '<img src="invalid" onerror=alert(1)>',
        svgTag: '<svg onload=stealToken()>',
      },
      query: {},
      params: {},
    };

    sanitizeInput(req, {}, () => {});

    assert.equal(req.body.imgTag, '<img src="invalid" alert(1)>');
    assert.equal(req.body.svgTag, '<svg stealToken()>');
  });

  await t.test('Sanitasi pada req.query dan req.params', () => {
    const req = {
      body: {},
      query: {
        search: 'Techcode<script>bad()</script>',
      },
      params: {
        id: '123 onload=test',
      },
    };

    sanitizeInput(req, {}, () => {});

    assert.equal(req.query.search, 'Techcode');
    assert.equal(req.params.id, '123 test');
  });

  await t.test('Menjaga data bertipe non-string (number, boolean, null) tetap utuh', () => {
    const req = {
      body: {
        amount: 250000,
        isCancelled: false,
        note: null,
      },
      query: {},
      params: {},
    };

    sanitizeInput(req, {}, () => {});

    assert.strictEqual(req.body.amount, 250000);
    assert.strictEqual(req.body.isCancelled, false);
    assert.strictEqual(req.body.note, null);
  });
});

test('Security Suite - Isolasi Data Kas UKM (Multi-Tenancy Access Control)', async (t) => {
  // Evaluasi aturan akses wewenang data kas UKM
  const checkKasAccess = ({ user, ukm, userMembership }) => {
    if (user.role === 'superadmin') return { allowed: true };
    if (user.role === 'manager') {
      if (Number(ukm.managerId) === Number(user.id)) return { allowed: true };
      return { allowed: false, status: 403, reason: 'Bukan UKM binaan Anda' };
    }
    if (user.role === 'student') {
      if (userMembership && userMembership.membershipStatus === 'aktif') return { allowed: true };
      return { allowed: false, status: 403, reason: 'Bukan anggota aktif UKM ini' };
    }
    return { allowed: false, status: 403, reason: 'Role tidak memiliki wewenang' };
  };

  await t.test('Superadmin diizinkan melihat data kas dan statistik UKM manapun', () => {
    const result = checkKasAccess({
      user: { id: 1, role: 'superadmin' },
      ukm: { id: 3, name: 'UKM Haluner', managerId: 10 },
      userMembership: null,
    });
    assert.strictEqual(result.allowed, true);
  });

  await t.test('Pengelola diizinkan melihat data kas UKM yang dikelolanya sendiri', () => {
    const result = checkKasAccess({
      user: { id: 2, role: 'manager' }, // Rian Pratama (manager Techcode)
      ukm: { id: 1, name: 'UKM Techcode', managerId: 2 },
      userMembership: null,
    });
    assert.strictEqual(result.allowed, true);
  });

  await t.test('Pengelola DITOLAK (403) jika mencoba melihat transparansi/data UKM lain', () => {
    const result = checkKasAccess({
      user: { id: 2, role: 'manager' }, // Rian Pratama (manager Techcode)
      ukm: { id: 2, name: 'UKM Gumpala', managerId: 5 }, // UKM milik manager lain
      userMembership: null,
    });
    assert.strictEqual(result.allowed, false);
    assert.strictEqual(result.status, 403);
  });

  await t.test('Mahasiswa diizinkan melihat kas UKM tempatnya terdaftar aktif', () => {
    const result = checkKasAccess({
      user: { id: 20, role: 'student' },
      ukm: { id: 1, name: 'UKM Techcode', managerId: 2 },
      userMembership: { ukmId: 1, membershipStatus: 'aktif' },
    });
    assert.strictEqual(result.allowed, true);
  });

  await t.test('Mahasiswa DITOLAK (403) jika mencoba melihat kas UKM yang bukan anggotanya', () => {
    const result = checkKasAccess({
      user: { id: 20, role: 'student' },
      ukm: { id: 4, name: 'UKM Ceria', managerId: 8 },
      userMembership: null,
    });
    assert.strictEqual(result.allowed, false);
    assert.strictEqual(result.status, 403);
  });
});

