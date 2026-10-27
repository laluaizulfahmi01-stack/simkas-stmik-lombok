// routes/events.js - Agenda Kegiatan UKM & Publik (PRD FR-AGD-01..05 & Visual ERD)
const express = require('express');
const { Event, Ukm, User, UserUkm } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { auditLog } = require('../security');

const router = express.Router();

// GET /api/events  –  Daftar agenda publik (bisa diakses umum tanpa login)
router.get('/public', async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { visibility: 'publik' },
      include: [{ model: Ukm, as: 'ukm', attributes: ['id', 'name', 'logo'] }],
      order: [['startTime', 'ASC']],
    });
    res.json(events);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memuat agenda publik' });
  }
});

// GET /api/events/:ukmId  –  Daftar agenda UKM (publik + internal untuk anggota)
router.get('/:ukmId', authenticateToken, async (req, res) => {
  const { ukmId } = req.params;
  try {
    const isSuperAdmin = req.user.role === 'superadmin';
    const isManager = req.user.role === 'manager';
    const isMember = await UserUkm.findOne({ where: { userId: req.user.id, ukmId, membershipStatus: 'aktif' } });

    const where = { ukmId };
    // Jika bukan anggota / manager / superadmin, hanya tampilkan agenda publik
    if (!isSuperAdmin && !isManager && !isMember) {
      where.visibility = 'publik';
    }

    const events = await Event.findAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
      order: [['startTime', 'ASC']],
    });
    res.json(events);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memuat agenda UKM' });
  }
});

// POST /api/events/:ukmId  –  Buat agenda kegiatan baru
router.post('/:ukmId', authenticateToken, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  const { ukmId } = req.params;
  const { title, description, startTime, endTime, location, visibility, status } = req.body;

  if (!title || !startTime) {
    return res.status(400).json({ message: 'Judul dan waktu mulai kegiatan wajib diisi' });
  }

  try {
    if (req.user.role === 'manager') {
      const ukm = await Ukm.findOne({ where: { id: ukmId, managerId: req.user.id } });
      if (!ukm) return res.status(403).json({ message: 'Akses ditolak: bukan UKM binaan Anda' });
    }

    const event = await Event.create({
      ukmId,
      title,
      description: description || null,
      startTime,
      endTime: endTime || null,
      location: location || 'Kampus STMIK Lombok',
      visibility: visibility || 'internal',
      status: status || 'direncanakan',
      createdBy: req.user.id,
    });

    auditLog('EVENT_CREATED', req.user.id, { ukmId, eventId: event.id, title });
    res.status(201).json(event);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal membuat agenda kegiatan' });
  }
});

// PUT /api/events/:ukmId/:id  –  Perbarui agenda kegiatan
router.put('/:ukmId/:id', authenticateToken, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  const { ukmId, id } = req.params;
  const { title, description, startTime, endTime, location, visibility, status } = req.body;

  try {
    const event = await Event.findOne({ where: { id, ukmId } });
    if (!event) return res.status(404).json({ message: 'Agenda kegiatan tidak ditemukan' });

    if (req.user.role === 'manager') {
      const ukm = await Ukm.findOne({ where: { id: ukmId, managerId: req.user.id } });
      if (!ukm) return res.status(403).json({ message: 'Akses ditolak' });
    }

    await event.update({
      title: title !== undefined ? title : event.title,
      description: description !== undefined ? description : event.description,
      startTime: startTime !== undefined ? startTime : event.startTime,
      endTime: endTime !== undefined ? endTime : event.endTime,
      location: location !== undefined ? location : event.location,
      visibility: visibility !== undefined ? visibility : event.visibility,
      status: status !== undefined ? status : event.status,
    });

    auditLog('EVENT_UPDATED', req.user.id, { ukmId, eventId: event.id });
    res.json(event);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memperbarui agenda kegiatan' });
  }
});

// DELETE /api/events/:ukmId/:id  –  Hapus / batalkan agenda kegiatan
router.delete('/:ukmId/:id', authenticateToken, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  const { ukmId, id } = req.params;
  try {
    const event = await Event.findOne({ where: { id, ukmId } });
    if (!event) return res.status(404).json({ message: 'Agenda tidak ditemukan' });

    // FR-AGD-03: Ubah status menjadi dibatalkan atau hapus
    await event.update({ status: 'dibatalkan' });
    auditLog('EVENT_CANCELLED', req.user.id, { ukmId, eventId: id });
    res.json({ message: 'Agenda kegiatan berhasil dibatalkan', event });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal membatalkan agenda' });
  }
});

module.exports = router;
