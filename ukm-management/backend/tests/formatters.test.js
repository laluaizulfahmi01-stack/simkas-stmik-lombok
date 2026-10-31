// tests/formatters.test.js - Unit Test Format Rupiah dan Angka SIMKAS
const test = require('node:test');
const assert = require('node:assert/strict');

// Implementasi fungsi formatShortRupiah sesuai REFERENCES.md & code aplikasi
const formatShortRupiah = val => {
  const n = Math.abs(Number(val) || 0);
  const prefix = Number(val) < 0 ? '-' : '';
  if (n >= 1000000) return prefix + 'Rp ' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return prefix + 'Rp ' + Math.round(n / 1000) + 'k';
  return prefix + 'Rp ' + n.toLocaleString('id-ID');
};

const formatRupiah = val => {
  const n = Number(val) || 0;
  return 'Rp ' + n.toLocaleString('id-ID');
};

test('Formatters Suite - formatShortRupiah()', async (t) => {
  await t.test('Format nominal jutaan ke M (contoh: 2.500.000 -> "Rp 2.5M")', () => {
    assert.strictEqual(formatShortRupiah(2500000), 'Rp 2.5M');
    assert.strictEqual(formatShortRupiah(10000000), 'Rp 10.0M');
    assert.strictEqual(formatShortRupiah('1500000'), 'Rp 1.5M');
  });

  await t.test('Format nominal ribuan ke k (contoh: 75.000 -> "Rp 75k")', () => {
    assert.strictEqual(formatShortRupiah(75000), 'Rp 75k');
    assert.strictEqual(formatShortRupiah(1000), 'Rp 1k');
    assert.strictEqual(formatShortRupiah(999499), 'Rp 999k');
  });

  await t.test('Format nominal di bawah seribu (contoh: 500 -> "Rp 500")', () => {
    assert.strictEqual(formatShortRupiah(500), 'Rp 500');
    assert.strictEqual(formatShortRupiah(0), 'Rp 0');
  });

  await t.test('Mendukung dan mempertahankan tanda minus pada nilai defisit/negatif', () => {
    assert.strictEqual(formatShortRupiah(-1500000), '-Rp 1.5M');
    assert.strictEqual(formatShortRupiah(-50000), '-Rp 50k');
    assert.strictEqual(formatShortRupiah(-750), '-Rp 750');
  });

  await t.test('Robust terhadap input null, undefined, atau string kosong', () => {
    assert.strictEqual(formatShortRupiah(null), 'Rp 0');
    assert.strictEqual(formatShortRupiah(undefined), 'Rp 0');
    assert.strictEqual(formatShortRupiah(''), 'Rp 0');
    assert.strictEqual(formatShortRupiah('invalid_text'), 'Rp 0');
  });
});

test('Formatters Suite - formatRupiah()', async (t) => {
  await t.test('Format nominal lengkap dengan pemisah ribuan id-ID', () => {
    const formatted = formatRupiah(1500000);
    assert.ok(formatted.startsWith('Rp '));
    assert.ok(formatted.includes('1.500.000') || formatted.includes('1,500,000'));
  });

  await t.test('Menangani nilai 0 dan fallback', () => {
    assert.strictEqual(formatRupiah(0), 'Rp 0');
    assert.strictEqual(formatRupiah(null), 'Rp 0');
  });
});

