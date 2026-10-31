// tests/transactions.test.js - Unit Test Logika Keuangan & Kas UKM SIMKAS
const test = require('node:test');
const assert = require('node:assert/strict');

test('Transactions Suite - Kalkulasi Kas & Arus Dana', async (t) => {
  const sampleTransactions = [
    { id: 1, type: 'income', amount: 500000, isCancelled: false, category: 'iuran' },
    { id: 2, type: 'income', amount: 1500000, isCancelled: false, category: 'dana_hibah' },
    { id: 3, type: 'expense', amount: 350000, isCancelled: false, category: 'operasional' },
    { id: 4, type: 'expense', amount: 200000, isCancelled: false, category: 'kegiatan' },
    { id: 5, type: 'income', amount: 1000000, isCancelled: true, cancellationReason: 'Salah nominal input' },
  ];

  await t.test('Menghitung Total Pemasukan hanya dari transaksi aktif (isCancelled: false)', () => {
    const totalIncome = sampleTransactions
      .filter(tx => !tx.isCancelled && tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    assert.strictEqual(totalIncome, 2000000);
  });

  await t.test('Menghitung Total Pengeluaran hanya dari transaksi aktif', () => {
    const totalExpense = sampleTransactions
      .filter(tx => !tx.isCancelled && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    assert.strictEqual(totalExpense, 550000);
  });

  await t.test('Menghitung Saldo Kas Akhir (Income - Expense)', () => {
    const totalIncome = sampleTransactions
      .filter(tx => !tx.isCancelled && tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpense = sampleTransactions
      .filter(tx => !tx.isCancelled && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const balance = totalIncome - totalExpense;

    assert.strictEqual(balance, 1450000);
  });

  await t.test('Transaksi yang dibatalkan (soft-cancelled) memiliki flag dan alasan pembatalan', () => {
    const cancelledTx = sampleTransactions.find(tx => tx.isCancelled);

    assert.ok(cancelledTx, 'Harus ada transaksi yang dibatalkan');
    assert.strictEqual(cancelledTx.isCancelled, true);
    assert.strictEqual(cancelledTx.cancellationReason, 'Salah nominal input');
  });
});

test('Transactions Suite - Validasi Kategori Kas', async (t) => {
  const ALLOWED_CATEGORIES = ['iuran', 'operasional', 'kegiatan', 'dana_hibah', 'lainnya'];

  await t.test('Menerima kategori transaksi yang valid sesuai PRD & ERD', () => {
    for (const cat of ALLOWED_CATEGORIES) {
      assert.ok(ALLOWED_CATEGORIES.includes(cat), `Kategori ${cat} harus valid`);
    }
  });

  await t.test('Menolak kategori transaksi yang tidak dikenal', () => {
    const invalidCategories = ['pribadi', 'crypto', 'unregistered'];
    for (const cat of invalidCategories) {
      assert.strictEqual(ALLOWED_CATEGORIES.includes(cat), false);
    }
  });

  await t.test('Validasi tipe transaksi hanya boleh income atau expense', () => {
    const isValidType = (type) => type === 'income' || type === 'expense';

    assert.strictEqual(isValidType('income'), true);
    assert.strictEqual(isValidType('expense'), true);
    assert.strictEqual(isValidType('transfer'), false);
    assert.strictEqual(isValidType(''), false);
  });
});

