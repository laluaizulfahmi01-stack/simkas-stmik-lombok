// routes/transactions.js - Keuangan Kas UKM (FR-KEU-04..07, FR-KEU-10, NFR-07)
const express = require('express');
const { Transaction, Ukm, User, UserUkm, sequelize } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { auditLog } = require('../security');

const router = express.Router();

// Helper to ensure the transaction belongs to a UKM the user is allowed to access
async function verifyAccess(req, res, next) {
  const { ukmId } = req.params;
  const user = req.user;
  // Superadmin can access any
  if (user.role === 'superadmin') return next();
  // Manager can access their own UKM only
  if (user.role === 'manager') {
    const managedUkm = await Ukm.findOne({ where: { id: ukmId, managerId: user.id } });
    if (!managedUkm) return res.status(403).json({ message: 'Forbidden: bukan UKM binaan Anda' });
    return next();
  }
  // Student can access only UKMs they are member of (FR-KEU-09: Seluruh anggota dapat melihat)
  const membership = await UserUkm.findOne({ where: { userId: user.id, ukmId, membershipStatus: 'aktif' } });
  if (!membership) return res.status(403).json({ message: 'Forbidden: Anda bukan anggota resmi UKM ini' });
  next();
}

// Get all transactions for a UKM (accessible to authorized members & managers)
router.get('/:ukmId', authenticateToken, verifyAccess, async (req, res) => {
  const { ukmId } = req.params;
  try {
    const transactions = await Transaction.findAll({
      where: { ukmId },
      include: [{ model: User, as: 'user', attributes: ['id', 'nim', 'name'] }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memuat catatan transaksi kas' });
  }
});

// Get monthly analytics: income vs expense per month (FR-KEU-07, grafik analitik kas)
router.get('/:ukmId/monthly', authenticateToken, verifyAccess, async (req, res) => {
  const { ukmId } = req.params;
  try {
    const isPostgres = sequelize.getDialect() === 'postgres';
    const monthFn = isPostgres
      ? sequelize.fn('to_char', sequelize.col('date'), 'YYYY-MM')
      : sequelize.fn('strftime', '%Y-%m', sequelize.col('date'));

    const rows = await Transaction.findAll({
      where: { ukmId, isCancelled: false },
      attributes: [
        [monthFn, 'month'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal("CASE WHEN type = 'income' THEN amount ELSE 0 END")), 0), 'income'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal("CASE WHEN type = 'expense' THEN amount ELSE 0 END")), 0), 'expense'],
      ],
      group: [monthFn],
      order: [[monthFn, 'ASC']],
      raw: true,
    });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memuat analitik kas bulanan' });
  }
});

// Create a new transaction (manager of that UKM or superadmin)
router.post('/:ukmId', authenticateToken, authorizeRoles('manager', 'superadmin'), verifyAccess, async (req, res) => {
  const { ukmId } = req.params;
  const { amount, description, type, category, date, proofReceipt } = req.body;
  if (!amount || !type) return res.status(400).json({ message: 'Nominal dan tipe transaksi wajib diisi' });
  try {
    const transaction = await Transaction.create({
      amount,
      description: description || null,
      type,
      category: category || (type === 'income' ? 'iuran' : 'operasional'),
      date: date || new Date().toISOString().slice(0, 10),
      proofReceipt: proofReceipt || null,
      ukmId,
      userId: req.user.id,
    });

    auditLog('TRANSACTION_CREATED', req.user.id, {
      ukmId,
      transactionId: transaction.id,
      amount,
      type,
      category: transaction.category,
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mencatat transaksi kas' });
  }
});

// Update a transaction (manager or superadmin)
router.put('/:ukmId/:id', authenticateToken, authorizeRoles('manager', 'superadmin'), verifyAccess, async (req, res) => {
  const { id } = req.params;
  const { amount, description, type, category, date, proofReceipt } = req.body;
  try {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    if (transaction.ukmId != req.params.ukmId) {
      return res.status(400).json({ message: 'UKM mismatch' });
    }

    const updates = {};
    if (amount !== undefined) updates.amount = amount;
    if (description !== undefined) updates.description = description;
    if (type !== undefined) updates.type = type;
    if (category !== undefined) updates.category = category;
    if (date !== undefined) updates.date = date;
    if (proofReceipt !== undefined) updates.proofReceipt = proofReceipt;

    await transaction.update(updates);
    auditLog('TRANSACTION_UPDATED', req.user.id, { transactionId: id, ukmId: req.params.ukmId });
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui transaksi' });
  }
});

// Cancel a transaction (FR-KEU-10 & NFR-07: Soft cancellation tanpa hapus permanen)
router.delete('/:ukmId/:id', authenticateToken, authorizeRoles('manager', 'superadmin'), verifyAccess, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  try {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    if (transaction.ukmId != req.params.ukmId) {
      return res.status(400).json({ message: 'UKM mismatch' });
    }

    await transaction.update({
      isCancelled: true,
      cancellationReason: reason || 'Dibatalkan oleh pengelola kas',
    });

    auditLog('TRANSACTION_CANCELLED', req.user.id, { transactionId: id, ukmId: req.params.ukmId, reason });
    res.json({ message: 'Transaksi berhasil dibatalkan (riwayat tersimpan dalam sistem)', transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal membatalkan transaksi' });
  }
});

module.exports = router;
