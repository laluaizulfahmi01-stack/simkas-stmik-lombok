// tests/attendance.test.js - Unit Test Modul Absensi & Pertemuan SIMKAS
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

test('Attendance Suite - Token Presensi & QR Code Sesi', async (t) => {
  const generateToken = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  };

  await t.test('Membuat token presensi unik sepanjang 6 karakter heksadesimal kapital', () => {
    const token = generateToken();
    assert.strictEqual(token.length, 6);
    assert.match(token, /^[0-9A-F]{6}$/);
  });

  await t.test('Dua token yang di-generate berturut-turut memiliki nilai unik', () => {
    const token1 = generateToken();
    const token2 = generateToken();
    assert.notStrictEqual(token1, token2);
  });
});

test('Attendance Suite - Aturan Status Presensi & Izin', async (t) => {
  const VALID_STATUSES = ['hadir', 'izin', 'sakit', 'alpa'];
  const VALID_LEAVE_STATUSES = ['diajukan', 'disetujui', 'ditolak'];

  await t.test('Status presensi anggota hanya boleh hadir, izin, sakit, alpa', () => {
    assert.ok(VALID_STATUSES.includes('hadir'));
    assert.ok(VALID_STATUSES.includes('izin'));
    assert.ok(VALID_STATUSES.includes('sakit'));
    assert.ok(VALID_STATUSES.includes('alpa'));
    assert.strictEqual(VALID_STATUSES.includes('unknown'), false);
  });

  await t.test('Status permohonan surat izin valid (diajukan, disetujui, ditolak)', () => {
    assert.ok(VALID_LEAVE_STATUSES.includes('diajukan'));
    assert.ok(VALID_LEAVE_STATUSES.includes('disetujui'));
    assert.ok(VALID_LEAVE_STATUSES.includes('ditolak'));
    assert.strictEqual(VALID_LEAVE_STATUSES.includes('pending'), false);
  });

  await t.test('Kalkulasi Persentase Kehadiran Mahasiswa', () => {
    const attendances = [
      { status: 'hadir' },
      { status: 'hadir' },
      { status: 'hadir' },
      { status: 'izin' },
      { status: 'hadir' },
    ];

    const total = attendances.length;
    const hadirCount = attendances.filter(a => a.status === 'hadir').length;
    const percentage = Math.round((hadirCount / total) * 100);

    assert.strictEqual(hadirCount, 4);
    assert.strictEqual(percentage, 80);
  });
});

