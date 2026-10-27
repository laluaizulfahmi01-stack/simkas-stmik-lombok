// routes/dues.js  –  Manajemen Iuran UKM
// PRD: FR-KEU-01..03, FR-KEU-08..09
const express = require('express');
const { Dues, DuesPayment, User, Ukm, UserUkm } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { auditLog } = require('../security');
const { Op } = require('sequelize');

const router = express.Router();

// ── Helper: verify UKM access ─────────────────────────────────────────────────
async function verifyUkmAccess(req, res, next) {
  const { ukmId } = req.params;
  const user = req.user;
  if (user.role === 'superadmin') return next();
  if (user.role === 'manager') {
    const ukm = await Ukm.findOne({ where: { id: ukmId, managerId: user.id } });
    if (!ukm) return res.status(403).json({ message: 'Akses ditolak: bukan UKM binaan Anda' });
    return next();
  }
  // Student: harus anggota UKM
  const memberUkm = await UserUkm.findOne({ where: { userId: user.id, ukmId, membershipStatus: 'aktif' } });
  if (!memberUkm) return res.status(403).json({ message: 'Akses ditolak: Anda bukan anggota UKM ini' });
  next();
}

// ── GET /api/dues/:ukmId  –  Daftar semua kewajiban iuran UKM ────────────────
// PRD FR-KEU-09: Semua anggota dapat melihat
router.get('/:ukmId', authenticateToken, verifyUkmAccess, async (req, res) => {
  try {
    const dues = await Dues.findAll({
      where: { ukmId: req.params.ukmId, isActive: true },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        {
          model: DuesPayment,
          as: 'payments',
          include: [{ model: User, as: 'member', attributes: ['id', 'nim', 'name'] }],
        },
      ],
      order: [['dueDate', 'DESC']],
    });
    res.json(dues);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memuat daftar iuran' });
  }
});

// ── POST /api/dues/:ukmId  –  Buat kewajiban iuran baru ──────────────────────
// PRD FR-KEU-01: Bendahara atau Pengelola membuat kewajiban iuran
// Langsung otomatis membuat DuesPayment untuk semua anggota aktif
router.post('/:ukmId', authenticateToken, async (req, res) => {
  const { ukmId } = req.params;
  const { name, description, amount, dueDate, memberIds } = req.body;

  if (!name || !amount || !dueDate) {
    return res.status(400).json({ message: 'Nama, nominal, dan jatuh tempo wajib diisi' });
  }

  try {
    // Validasi akses: manager atau superadmin
    const isSuperAdmin = req.user.role === 'superadmin';
    const isManager = req.user.role === 'manager';
    if (isManager) {
      const ukm = await Ukm.findOne({ where: { id: ukmId, managerId: req.user.id } });
      if (!ukm) return res.status(403).json({ message: 'Akses ditolak' });
    } else if (!isSuperAdmin) {
      return res.status(403).json({ message: 'Akses ditolak: butuh role manager atau superadmin' });
    }

    const dues = await Dues.create({
      ukmId,
      name,
      description: description || null,
      amount,
      dueDate,
      createdBy: req.user.id,
    });

    // Tentukan anggota yang dikenai iuran
    let targetMembers;
    if (memberIds && memberIds.length > 0) {
      // Iuran untuk anggota tertentu saja
      targetMembers = memberIds.map(id => ({ userId: id, amountDue: amount }));
    } else {
      // Default: semua anggota aktif
      const memberships = await UserUkm.findAll({
        where: { ukmId, membershipStatus: 'aktif' },
        attributes: ['userId'],
      });
      targetMembers = memberships.map(m => ({ userId: m.userId, amountDue: amount }));
    }

    // Buat DuesPayment untuk setiap anggota
    const payments = await Promise.all(
      targetMembers.map(({ userId, amountDue }) =>
        DuesPayment.create({
          duesId: dues.id,
          userId,
          ukmId,
          amountDue,
          status: 'belum_lunas',
        })
      )
    );

    auditLog('DUES_CREATED', req.user.id, { ukmId, duesId: dues.id, memberCount: payments.length });
    res.status(201).json({
      message: `Kewajiban iuran "${name}" dibuat untuk ${payments.length} anggota`,
      dues,
      paymentsCreated: payments.length,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal membuat kewajiban iuran' });
  }
});

// ── GET /api/dues/:ukmId/payments  –  Rekap pembayaran iuran anggota ─────────
// PRD FR-KEU-08: Rekap status iuran seluruh anggota
router.get('/:ukmId/payments', authenticateToken, verifyUkmAccess, async (req, res) => {
  try {
    const { duesId } = req.query;
    const where = { ukmId: req.params.ukmId };
    if (duesId) where.duesId = duesId;

    // PRD FR-KEU-09 & K18 [K]: Seluruh anggota dapat melihat status iuran seluruh anggota UKM
    // Jika query myOnly='true', filter hanya untuk user yang login
    if (req.query.myOnly === 'true') {
      where.userId = req.user.id;
    }

    const payments = await DuesPayment.findAll({
      where,
      include: [
        { model: User, as: 'member', attributes: ['id', 'nim', 'name', 'prodi'] },
        { model: Dues, as: 'dues', attributes: ['id', 'name', 'dueDate', 'amount'] },
        { model: User, as: 'recorder', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(payments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memuat rekap pembayaran' });
  }
});

// ── PUT /api/dues/:ukmId/payments/:paymentId  –  Catat pembayaran iuran ──────
// PRD FR-KEU-02..03 [K]: Cari nama anggota, isi jumlah dibayar, status lunas/belum
router.put('/:ukmId/payments/:paymentId', authenticateToken, async (req, res) => {
  const { ukmId, paymentId } = req.params;
  const { amountPaid, status, note, attachment } = req.body;

  try {
    // Validasi akses: hanya manager atau superadmin
    const isSuperAdmin = req.user.role === 'superadmin';
    const isManager = req.user.role === 'manager';
    if (!isSuperAdmin && !isManager) {
      return res.status(403).json({ message: 'Hanya bendahara/pengelola yang dapat mencatat pembayaran' });
    }
    if (isManager) {
      const ukm = await Ukm.findOne({ where: { id: ukmId, managerId: req.user.id } });
      if (!ukm) return res.status(403).json({ message: 'Akses ditolak: bukan UKM binaan Anda' });
    }

    const payment = await DuesPayment.findOne({
      where: { id: paymentId, ukmId },
      include: [
        { model: User, as: 'member', attributes: ['id', 'nim', 'name'] },
        { model: Dues, as: 'dues', attributes: ['id', 'name'] },
      ],
    });
    if (!payment) return res.status(404).json({ message: 'Data pembayaran tidak ditemukan' });
    if (payment.isCancelled) return res.status(400).json({ message: 'Pembayaran sudah dibatalkan' });

    const finalStatus = status || (amountPaid >= payment.amountDue ? 'lunas' : 'belum_lunas');

    await payment.update({
      amountPaid: amountPaid || payment.amountPaid,
      status: finalStatus,
      paidAt: finalStatus === 'lunas' ? new Date() : null,
      recordedBy: req.user.id,
      note: note || payment.note,
      attachment: attachment || payment.attachment,
    });

    auditLog('DUES_PAYMENT_RECORDED', req.user.id, {
      paymentId,
      memberId: payment.userId,
      status: finalStatus,
      duesName: payment.dues.name,
    });
    res.json({ message: `Pembayaran ${payment.member.name} dicatat: ${finalStatus}`, payment });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal mencatat pembayaran' });
  }
});

// ── PUT /api/dues/:ukmId/payments/:paymentId/cancel  –  Batalkan pembayaran ───
// PRD FR-KEU-10: Pembatalan tidak menghapus data
router.put('/:ukmId/payments/:paymentId/cancel', authenticateToken, async (req, res) => {
  const { ukmId, paymentId } = req.params;
  const { reason } = req.body;

  try {
    const isSuperAdmin = req.user.role === 'superadmin';
    const isManager = req.user.role === 'manager';
    if (!isSuperAdmin && !isManager) return res.status(403).json({ message: 'Akses ditolak' });
    if (isManager) {
      const ukm = await Ukm.findOne({ where: { id: ukmId, managerId: req.user.id } });
      if (!ukm) return res.status(403).json({ message: 'Akses ditolak' });
    }

    const payment = await DuesPayment.findOne({ where: { id: paymentId, ukmId } });
    if (!payment) return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });

    await payment.update({
      isCancelled: true,
      status: 'belum_lunas',
      cancelledBy: req.user.id,
      cancelNote: reason || 'Dibatalkan oleh pengelola',
      amountPaid: 0,
      paidAt: null,
    });

    auditLog('DUES_PAYMENT_CANCELLED', req.user.id, { paymentId, reason });
    res.json({ message: 'Pembayaran dibatalkan (data tetap tersimpan)' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal membatalkan pembayaran' });
  }
});

module.exports = router;
