// routes/applications.js  –  Pendaftaran & Seleksi UKM
// PRD: FR-PND-01..07
const express = require('express');
const { Application, User, Ukm, UserUkm } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { auditLog } = require('../security');
const { Op } = require('sequelize');

const router = express.Router();

// ── Helper: cek apakah UKM sedang buka pendaftaran ──────────────────────────
function isRegistrationOpen(ukm) {
  if (!ukm.registrationOpen) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (ukm.registrationOpenDate && today < ukm.registrationOpenDate) return false;
  if (ukm.registrationCloseDate && today > ukm.registrationCloseDate) return false;
  return true;
}

// ── GET /api/applications/my  –  Daftar pendaftaran milik mahasiswa ──────────
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const apps = await Application.findAll({
      where: { userId: req.user.id },
      include: [{ model: Ukm, as: 'ukm', attributes: ['id', 'name', 'description'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(apps);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memuat daftar pendaftaran' });
  }
});

// ── POST /api/applications  –  Mahasiswa mendaftar UKM ───────────────────────
// PRD FR-PND-02..03, FR-AKN-04, FR-PND-06
router.post('/', authenticateToken, async (req, res) => {
  const { ukmId, motivation } = req.body;

  // FR-PND-06: Akun belum terverifikasi tidak bisa daftar UKM
  if (!req.user.isVerified) {
    return res.status(403).json({
      message: 'Akun Anda belum terverifikasi. Silakan upload foto KTM dan tunggu verifikasi oleh admin/pengelola.',
    });
  }

  if (!ukmId) return res.status(400).json({ message: 'UKM wajib dipilih' });

  try {
    const ukm = await Ukm.findOne({ where: { id: ukmId, isActive: true } });
    if (!ukm) return res.status(404).json({ message: 'UKM tidak ditemukan atau tidak aktif' });

    // FR-PND-01: Cek jadwal pendaftaran
    if (!isRegistrationOpen(ukm)) {
      return res.status(400).json({
        message: `Pendaftaran UKM ${ukm.name} sedang tidak dibuka.`,
        registrationOpen: ukm.registrationOpen,
        registrationOpenDate: ukm.registrationOpenDate,
        registrationCloseDate: ukm.registrationCloseDate,
      });
    }

    // FR-PND-03 [K]: Sistem menolak jika sudah punya 2 pendaftaran aktif
    const activeApps = await Application.count({
      where: {
        userId: req.user.id,
        status: { [Op.in]: ['diajukan', 'dalam_seleksi', 'diterima'] },
      },
    });
    if (activeApps >= 2) {
      return res.status(400).json({
        message: 'Anda sudah memiliki 2 pendaftaran/keanggotaan aktif. Kuota maksimal 2 UKM.',
      });
    }

    // Cek apakah sudah pernah daftar ke UKM yang sama dan masih aktif
    const existingApp = await Application.findOne({
      where: {
        userId: req.user.id,
        ukmId,
        status: { [Op.in]: ['diajukan', 'dalam_seleksi', 'diterima'] },
      },
    });
    if (existingApp) {
      return res.status(400).json({ message: `Anda sudah memiliki pendaftaran aktif di UKM ${ukm.name}` });
    }

    const app = await Application.create({
      userId: req.user.id,
      ukmId,
      motivation: motivation || null,
      status: 'diajukan',
    });

    auditLog('APPLICATION_SUBMITTED', req.user.id, { ukmId, applicationId: app.id });
    res.status(201).json({ message: `Pendaftaran ke UKM ${ukm.name} berhasil diajukan!`, application: app });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal mengajukan pendaftaran' });
  }
});

// ── PUT /api/applications/:id/cancel  –  Mahasiswa membatalkan pendaftaran ───
// PRD FR-PND-05
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const app = await Application.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!app) return res.status(404).json({ message: 'Pendaftaran tidak ditemukan' });

    if (!['diajukan', 'dalam_seleksi'].includes(app.status)) {
      return res.status(400).json({ message: `Pendaftaran dengan status '${app.status}' tidak dapat dibatalkan` });
    }

    await app.update({ status: 'dibatalkan', cancelReason: req.body.reason || 'Dibatalkan oleh pemohon' });
    auditLog('APPLICATION_CANCELLED', req.user.id, { applicationId: app.id });
    res.json({ message: 'Pendaftaran berhasil dibatalkan' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal membatalkan pendaftaran' });
  }
});

// ── GET /api/applications/ukm/:ukmId  –  Pengelola melihat daftar pendaftar ──
router.get('/ukm/:ukmId', authenticateToken, async (req, res) => {
  const { ukmId } = req.params;
  try {
    // Validasi akses
    const isSuperAdmin = req.user.role === 'superadmin';
    const isManager = req.user.role === 'manager';
    if (isManager) {
      const ukm = await Ukm.findOne({ where: { id: ukmId, managerId: req.user.id } });
      if (!ukm) return res.status(403).json({ message: 'Akses ditolak: bukan UKM binaan Anda' });
    } else if (!isSuperAdmin) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const { status } = req.query;
    const where = { ukmId };
    if (status) where.status = status;

    const apps = await Application.findAll({
      where,
      include: [
        { model: User, as: 'applicant', attributes: ['id', 'nim', 'name', 'prodi', 'isVerified', 'verificationStatus'] },
        { model: Ukm, as: 'ukm', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(apps);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memuat daftar pendaftar' });
  }
});

// ── PUT /api/applications/:id/status  –  Pengelola memproses pendaftaran ─────
// PRD FR-PND-04, FR-PND-07
router.put('/:id/status', authenticateToken, async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['dalam_seleksi', 'diterima', 'ditolak'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Status tidak valid. Gunakan: ${validStatuses.join(', ')}` });
  }

  try {
    const app = await Application.findByPk(req.params.id, {
      include: [
        { model: Ukm, as: 'ukm' },
        { model: User, as: 'applicant' },
      ],
    });
    if (!app) return res.status(404).json({ message: 'Pendaftaran tidak ditemukan' });

    // Validasi akses manager
    const isSuperAdmin = req.user.role === 'superadmin';
    const isUkmManager = req.user.role === 'manager' && Number(app.ukm.managerId) === Number(req.user.id);
    if (!isSuperAdmin && !isUkmManager) {
      return res.status(403).json({ message: 'Akses ditolak: bukan pengelola UKM ini' });
    }

    const updates = {
      status,
      managerNote: note || null,
      processedBy: req.user.id,
      processedAt: new Date(),
    };

    // FR-PND-07: Jika diterima, otomatis buat keanggotaan
    if (status === 'diterima') {
      // Cek apakah sudah jadi anggota
      const existingMembership = await UserUkm.findOne({
        where: { userId: app.userId, ukmId: app.ukmId, membershipStatus: 'aktif' },
      });
      if (!existingMembership) {
        await UserUkm.create({
          userId: app.userId,
          ukmId: app.ukmId,
          ukmRole: 'anggota',
          membershipStatus: 'aktif',
          startDate: new Date().toISOString().slice(0, 10),
        });
        auditLog('MEMBERSHIP_CREATED', req.user.id, { userId: app.userId, ukmId: app.ukmId, via: 'application' });
      }
    }

    await app.update(updates);
    auditLog('APPLICATION_STATUS_UPDATED', req.user.id, { applicationId: app.id, status });
    res.json({ message: `Status pendaftaran diperbarui menjadi '${status}'`, application: app });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memperbarui status pendaftaran' });
  }
});

module.exports = router;
