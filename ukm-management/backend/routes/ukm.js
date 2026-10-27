// routes/ukm.js  –  UKM CRUD (superadmin only) + list (all)
const express = require('express');
const { Ukm, User, Transaction, Attendance, UserUkm, Achievement } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/ukm  –  list all UKMs (public for registration & catalog)
router.get('/', async (req, res) => {
  try {
    const ukms = await Ukm.findAll({
      include: [
        { model: User, as: 'manager', attributes: ['id', 'nim', 'name'] },
        { model: User, as: 'members', attributes: ['id'], through: { attributes: [] } },
        { model: Achievement, as: 'achievements', required: false },
      ],
      order: [
        ['id', 'ASC'],
        [{ model: Achievement, as: 'achievements' }, 'year', 'DESC'],
      ],
    });
    res.json(ukms);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/ukm  –  create UKM (superadmin)
router.post('/', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  const { name, managerId } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  try {
    const ukm = await Ukm.create({ name, managerId: managerId || null });
    if (managerId) await User.update({ role: 'manager' }, { where: { id: managerId } });
    res.status(201).json(ukm);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ message: 'UKM name already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/ukm/:id  –  update UKM (superadmin or assigned manager)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const ukm = await Ukm.findByPk(req.params.id);
    if (!ukm) return res.status(404).json({ message: 'UKM not found' });

    // Permissions: superadmin or the assigned manager of this UKM
    const isSuperAdmin = req.user.role === 'superadmin';
    const isUkmManager = req.user.role === 'manager' && Number(ukm.managerId) === Number(req.user.id);

    if (!isSuperAdmin && !isUkmManager) {
      return res.status(403).json({ message: 'Forbidden: not authorized to edit this UKM' });
    }

    const {
      name, managerId, description, history, vision, mission,
      registrationOpen, registrationOpenDate, registrationCloseDate,
      tag, advantages, highlights, activitySchedule, requirements
    } = req.body;
    const updates = {};
    if (description !== undefined) updates.description = description;
    if (history !== undefined) updates.history = history;
    if (vision !== undefined) updates.vision = vision;
    if (mission !== undefined) updates.mission = mission;
    if (registrationOpen !== undefined) updates.registrationOpen = registrationOpen;
    if (registrationOpenDate !== undefined) updates.registrationOpenDate = registrationOpenDate;
    if (registrationCloseDate !== undefined) updates.registrationCloseDate = registrationCloseDate;
    if (tag !== undefined) updates.tag = tag;
    if (advantages !== undefined) updates.advantages = advantages;
    if (highlights !== undefined) updates.highlights = highlights;
    if (activitySchedule !== undefined) updates.activitySchedule = activitySchedule;
    if (requirements !== undefined) updates.requirements = requirements;

    if (isSuperAdmin) {
      if (name) updates.name = name;
      if (managerId !== undefined) {
        if (managerId && managerId !== ukm.managerId) {
          if (ukm.managerId) await User.update({ role: 'student' }, { where: { id: ukm.managerId } });
          await User.update({ role: 'manager' }, { where: { id: managerId } });
        }
        updates.managerId = managerId;
      }
    }

    await ukm.update(updates);
    res.json(ukm);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/ukm/:id  –  delete UKM (superadmin)
router.delete('/:id', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const ukm = await Ukm.findByPk(req.params.id);
    if (!ukm) return res.status(404).json({ message: 'UKM not found' });
    await ukm.destroy();
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/ukm/:id/members – list all members of a UKM with roles and status
router.get('/:id/members', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const ukm = await Ukm.findByPk(id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'nim', 'name', 'prodi', 'role', 'avatar', 'isVerified'],
          through: { attributes: ['id', 'ukmRole', 'membershipStatus', 'startDate', 'endDate', 'exitReason', 'exitDate'] },
          include: [
            {
              model: Ukm,
              as: 'ukms',
              attributes: ['id', 'name'],
              through: { attributes: ['ukmRole', 'membershipStatus'] },
            },
          ],
        },
      ],
    });
    if (!ukm) return res.status(404).json({ message: 'UKM not found' });
    res.json(ukm.members || []);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ukm/:id/stats  –  summary stats for a single UKM
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [transactions, memberCount, attendanceCount] = await Promise.all([
      Transaction.findAll({ where: { ukmId: id, isCancelled: false } }),
      UserUkm.count({ where: { ukmId: id, membershipStatus: 'aktif' } }),
      Attendance.count({ where: { ukmId: id } }),
    ]);
    const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0);
    res.json({ totalIncome, totalExpense, balance: totalIncome - totalExpense, memberCount, attendanceCount });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// PUT /api/ukm/:id/registration-schedule  –  Pengelola / Super Admin atur jadwal pendaftaran
// PRD: FR-PND-01 [K]
router.put('/:id/registration-schedule', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { registrationOpen, registrationOpenDate, registrationCloseDate } = req.body;
  try {
    const ukm = await Ukm.findByPk(id);
    if (!ukm) return res.status(404).json({ message: 'UKM tidak ditemukan' });

    const isSuperAdmin = req.user.role === 'superadmin';
    const isUkmManager = req.user.role === 'manager' && Number(ukm.managerId) === Number(req.user.id);
    if (!isSuperAdmin && !isUkmManager) {
      return res.status(403).json({ message: 'Akses ditolak: hanya pengelola UKM atau superadmin' });
    }

    const updates = {};
    if (registrationOpen !== undefined) updates.registrationOpen = Boolean(registrationOpen);
    if (registrationOpenDate !== undefined) updates.registrationOpenDate = registrationOpenDate || null;
    if (registrationCloseDate !== undefined) updates.registrationCloseDate = registrationCloseDate || null;

    await ukm.update(updates);
    res.json({ message: 'Jadwal pendaftaran UKM berhasil diperbarui!', ukm });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memperbarui jadwal pendaftaran' });
  }
});

// PUT /api/ukm/:id/members/:userId/role  –  Angkat / cabut jabatan pengurus
// PRD: FR-UKM-03, FR-UKM-04, RB-01..04
router.put('/:id/members/:userId/role', authenticateToken, async (req, res) => {
  const { id, userId } = req.params;
  const { ukmRole, startDate, endDate } = req.body;
  const validRoles = ['anggota', 'pengelola', 'bendahara', 'sekretaris', 'publikasi'];

  if (ukmRole && !validRoles.includes(ukmRole)) {
    return res.status(400).json({ message: `Role tidak valid. Gunakan: ${validRoles.join(', ')}` });
  }

  try {
    const ukm = await Ukm.findByPk(id);
    if (!ukm) return res.status(404).json({ message: 'UKM tidak ditemukan' });

    const isSuperAdmin = req.user.role === 'superadmin';
    const isUkmManager = req.user.role === 'manager' && Number(ukm.managerId) === Number(req.user.id);
    if (!isSuperAdmin && !isUkmManager) {
      return res.status(403).json({ message: 'Akses ditolak: hanya pengelola UKM yang dapat mengangkat pengurus' });
    }

    const membership = await UserUkm.findOne({ where: { ukmId: id, userId } });
    if (!membership) return res.status(404).json({ message: 'Keanggotaan mahasiswa tidak ditemukan' });

    await membership.update({
      ukmRole: ukmRole || membership.ukmRole,
      startDate: startDate !== undefined ? startDate : membership.startDate,
      endDate: endDate !== undefined ? endDate : membership.endDate,
    });

    res.json({ message: `Jabatan berhasil diperbarui menjadi ${ukmRole || membership.ukmRole}!`, membership });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memperbarui jabatan' });
  }
});

// PUT /api/ukm/:id/members/:userId/status  –  Akhiri keanggotaan (mengundurkan diri / dikeluarkan)
// PRD: FR-MBR-02, K13
router.put('/:id/members/:userId/status', authenticateToken, async (req, res) => {
  const { id, userId } = req.params;
  const { membershipStatus, exitReason } = req.body;
  const validStatuses = ['aktif', 'keluar', 'dikeluarkan'];

  if (!validStatuses.includes(membershipStatus)) {
    return res.status(400).json({ message: `Status tidak valid. Gunakan: ${validStatuses.join(', ')}` });
  }

  try {
    const ukm = await Ukm.findByPk(id);
    if (!ukm) return res.status(404).json({ message: 'UKM tidak ditemukan' });

    const isSuperAdmin = req.user.role === 'superadmin';
    const isUkmManager = req.user.role === 'manager' && Number(ukm.managerId) === Number(req.user.id);
    const isSelf = Number(req.user.id) === Number(userId) && membershipStatus === 'keluar';

    if (!isSuperAdmin && !isUkmManager && !isSelf) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const membership = await UserUkm.findOne({ where: { ukmId: id, userId } });
    if (!membership) return res.status(404).json({ message: 'Keanggotaan mahasiswa tidak ditemukan' });

    await membership.update({
      membershipStatus,
      exitReason: exitReason || (isSelf ? 'Mengundurkan diri atas permintaan sendiri' : 'Dikeluarkan oleh pengelola UKM'),
      exitDate: new Date().toISOString().slice(0, 10),
    });

    res.json({ message: `Status keanggotaan diubah menjadi '${membershipStatus}'.`, membership });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memperbarui status keanggotaan' });
  }
});

// GET /api/ukm/:id/achievements - list all capaian, ebooks, foto for a UKM (Public for Landing Page & Catalog)
router.get('/:id/achievements', async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.query;
    const where = { ukmId: id };
    if (category) where.category = category;
    const list = await Achievement.findAll({ where, order: [['year', 'DESC'], ['createdAt', 'DESC']] });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/ukm/:id/achievements - add a new capaian / ebook / foto
router.post('/:id/achievements', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const ukm = await Ukm.findByPk(id);
    if (!ukm) return res.status(404).json({ message: 'UKM not found' });

    const isSuperAdmin = req.user.role === 'superadmin';
    const isUkmManager = req.user.role === 'manager' && Number(ukm.managerId) === Number(req.user.id);
    if (!isSuperAdmin && !isUkmManager) {
      return res.status(403).json({ message: 'Forbidden: only managers or superadmins can add achievements' });
    }

    const { title, category, description, year, imageUrl, fileUrl, fileSize, author } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const item = await Achievement.create({
      ukmId: id,
      title,
      category: category || 'capaian',
      description,
      year: year || new Date().getFullYear().toString(),
      imageUrl,
      fileUrl,
      fileSize,
      author,
    });
    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/ukm/:id/achievements/:achId - update capaian / ebook / foto
router.put('/:id/achievements/:achId', authenticateToken, async (req, res) => {
  try {
    const { id, achId } = req.params;
    const ukm = await Ukm.findByPk(id);
    if (!ukm) return res.status(404).json({ message: 'UKM not found' });

    const isSuperAdmin = req.user.role === 'superadmin';
    const isUkmManager = req.user.role === 'manager' && Number(ukm.managerId) === Number(req.user.id);
    if (!isSuperAdmin && !isUkmManager) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const item = await Achievement.findOne({ where: { id: achId, ukmId: id } });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const { title, category, description, year, imageUrl, fileUrl, fileSize, author } = req.body;
    await item.update({ title, category, description, year, imageUrl, fileUrl, fileSize, author });
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/ukm/:id/achievements/:achId - delete capaian / ebook / foto
router.delete('/:id/achievements/:achId', authenticateToken, async (req, res) => {
  try {
    const { id, achId } = req.params;
    const ukm = await Ukm.findByPk(id);
    if (!ukm) return res.status(404).json({ message: 'UKM not found' });

    const isSuperAdmin = req.user.role === 'superadmin';
    const isUkmManager = req.user.role === 'manager' && Number(ukm.managerId) === Number(req.user.id);
    if (!isSuperAdmin && !isUkmManager) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const item = await Achievement.findOne({ where: { id: achId, ukmId: id } });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
