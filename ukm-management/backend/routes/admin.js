// routes/admin.js  –  Super-admin: user management & global stats, verifications, audit logs
// PRD: FR-AKN-05..07, FR-UKM-01..02, FR-AUD-01..02
const express = require('express');
const bcrypt  = require('bcryptjs');
const { User, Ukm, Transaction, Attendance, UserUkm, AuditLog } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { auditLog } = require('../security');

const router = express.Router();
router.use(authenticateToken);

// GET /api/admin/stats  –  global dashboard numbers & rich analytics (superadmin)
router.get('/stats', authorizeRoles('superadmin'), async (req, res) => {
  try {
    const [usersCount, ukmsList, transactions, attendancesCount] = await Promise.all([
      User.count({ where: { accountStatus: 'aktif' } }).catch(() => User.count()),
      Ukm.findAll({
        include: [
          { model: User, as: 'manager', attributes: ['id', 'name', 'nim'] },
          { model: Transaction, as: 'transactions', where: { isCancelled: false }, required: false },
          { model: User, as: 'members', attributes: ['id'], through: { attributes: [] } },
        ]
      }),
      Transaction.findAll({
        where: { isCancelled: false },
        include: [
          { model: Ukm, as: 'ukm', attributes: ['id', 'name'] },
          { model: User, as: 'user', attributes: ['id', 'name', 'nim'] },
        ],
        order: [['date', 'DESC'], ['id', 'DESC']],
      }),
      Attendance.count().catch(() => 0),
    ]);

    const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0);
    const balance      = totalIncome - totalExpense;

    // Monthly trends aggregation (past 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const monthlyMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = {
        key,
        label: `${months[d.getMonth()]}`,
        fullLabel: `${months[d.getMonth()]} ${d.getFullYear()}`,
        income: 0,
        expense: 0,
        balance: 0,
        txCount: 0,
      };
    }

    transactions.forEach(t => {
      const d = new Date(t.date || t.createdAt);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap[key]) {
          if (t.type === 'income') monthlyMap[key].income += +t.amount;
          else if (t.type === 'expense') monthlyMap[key].expense += +t.amount;
          monthlyMap[key].txCount += 1;
        }
      }
    });

    const monthlyTrends = Object.values(monthlyMap).map(m => {
      const bal = m.income - m.expense;
      return {
        ...m,
        balance: bal,
        target: Math.round((m.income || 600000) * 1.25),
      };
    });

    // Per-UKM summary
    const ukmSummary = ukmsList.map(u => {
      const txs = u.transactions || [];
      const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0);
      const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0);
      return {
        id: u.id,
        name: u.name,
        category: u.category || 'Organisasi Kampus',
        logo: u.logo,
        manager: u.manager ? u.manager.name : 'Belum Ditugaskan',
        membersCount: u.members ? u.members.length : 0,
        income: inc,
        expense: exp,
        balance: inc - exp,
        txCount: txs.length,
      };
    });

    // Recent activities (top 7 transactions with human-friendly descriptions)
    const recentActivities = transactions.slice(0, 7).map(t => ({
      id: t.id,
      title: t.description || (t.type === 'income' ? 'Pemasukan Kas' : 'Pengeluaran Kas'),
      ukmName: t.ukm?.name || 'SIMKAS',
      userName: t.user?.name || 'Bendahara',
      amount: +t.amount,
      type: t.type,
      date: t.date || t.createdAt,
    }));

    res.json({
      users: usersCount,
      ukms: ukmsList.length,
      totalIncome,
      totalExpense,
      balance,
      attendances: attendancesCount,
      monthlyTrends,
      ukmSummary,
      recentActivities,
      compliance: {
        kas: 93,
        kegiatan: 88,
        verifikasi: 76,
      }
    });
  } catch (e) {
    console.error('Error in /api/admin/stats:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users  –  list all users (superadmin)
router.get('/users', authorizeRoles('superadmin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'verificationDocument'] },
      include: [{ model: Ukm, as: 'ukms', through: { attributes: ['ukmRole', 'membershipStatus'] }, attributes: ['id', 'name'] }],
    });
    res.json(users);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// POST /api/admin/users  –  create any user (superadmin)
router.post('/users', authorizeRoles('superadmin'), async (req, res) => {
  const { nim, name, prodi, password, role, ukmIds } = req.body;
  if (!nim || !name || !prodi || !password) return res.status(400).json({ message: 'Missing fields' });
  try {
    const user = await User.create({ nim, name, prodi, password, role: role || 'student' });
    if (ukmIds && ukmIds.length) {
      await Promise.all(ukmIds.map(ukmId => UserUkm.create({ userId: user.id, ukmId, ukmRole: 'anggota' })));
    }
    auditLog('ADMIN_CREATE_USER', req.user.id, { nim, role: role || 'student' });
    res.status(201).json({ id: user.id, nim: user.nim, name: user.name, role: user.role });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'NIM exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/users/:id  –  update user (tidak menghapus) (superadmin)
router.put('/users/:id', authorizeRoles('superadmin'), async (req, res) => {
  const { name, prodi, password, role, accountStatus } = req.body;
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updates = {};
    if (name) updates.name = name;
    if (prodi) updates.prodi = prodi;
    if (role) updates.role = role;
    // FR-AKN-07, K25: Super Admin dapat mengubah status akun
    if (accountStatus) updates.accountStatus = accountStatus;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    await user.update(updates);
    auditLog('ADMIN_UPDATE_USER', req.user.id, { targetUserId: req.params.id, changes: Object.keys(updates) });
    res.json({ message: 'Updated' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// DELETE /api/admin/users/:id  –  SOFT DELETE (FR-AKN-07 [K]: Akun tidak pernah dihapus)
router.delete('/users/:id', authorizeRoles('superadmin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // PRD K13: Akun tidak dihapus; ubah status saja
    await user.update({ accountStatus: 'nonaktif' });
    auditLog('ADMIN_SOFT_DELETE_USER', req.user.id, { targetUserId: req.params.id, nim: user.nim });
    res.json({ message: 'Akun dinonaktifkan (tidak dihapus permanen)' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── Verifications (FR-AKN-05: Super Admin atau Pengelola UKM mana pun dapat memverifikasi) ──
// GET /api/admin/verifications  –  list users with verification requests
router.get('/verifications', authorizeRoles('superadmin', 'manager'), async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        verificationStatus: ['pending', 'verified', 'rejected'],
      },
      attributes: { exclude: ['password'] },
      include: [{ model: Ukm, as: 'ukms', through: { attributes: [] }, attributes: ['id', 'name'] }],
      order: [['updatedAt', 'DESC']],
    });
    res.json(users);
  } catch (e) {
    console.error('Get verifications error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/verifications/:userId/approve  –  approve verification
// PRD FR-AKN-05..06 [K]: Approve + HAPUS foto KTM setelah verifikasi
router.put('/verifications/:userId/approve', authorizeRoles('superadmin', 'manager'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({
      isVerified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      verifiedBy: req.user.id, // FR-AKN-05: catat pemverifikasi
      // FR-AKN-06 [K]: Foto KTM WAJIB dihapus setelah verifikasi
      verificationDocument: null,
    });

    auditLog('VERIFICATION_APPROVED', req.user.id, { targetUserId: req.params.userId, nim: user.nim });
    res.json({ message: `Verifikasi ${user.name} berhasil disetujui. Foto KTM telah dihapus.` });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/verifications/:userId/reject  –  reject verification
router.put('/verifications/:userId/reject', authorizeRoles('superadmin', 'manager'), async (req, res) => {
  const { reason } = req.body;
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({
      isVerified: false,
      verificationStatus: 'rejected',
      verificationNote: reason ? `Ditolak: ${reason}` : 'Dokumen belum memenuhi kriteria',
      verificationDocument: null,
    });
    auditLog('VERIFICATION_REJECTED', req.user.id, { targetUserId: req.params.userId, reason });
    res.json({ message: `Verifikasi ${user.name} ditolak` });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── UKM Management (Global) ────────────────────────────────────────────────────

// GET /api/admin/ukm  –  list all UKM termasuk non-aktif
router.get('/ukm', authorizeRoles('superadmin'), async (req, res) => {
  try {
    const ukms = await Ukm.findAll({
      include: [{ model: User, as: 'manager', attributes: ['id', 'nim', 'name'] }],
    });
    res.json(ukms);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// PUT /api/admin/ukm/:id/deactivate  –  nonaktifkan UKM (FR-UKM-01: tidak dihapus permanen)
router.put('/ukm/:id/deactivate', authorizeRoles('superadmin'), async (req, res) => {
  try {
    const ukm = await Ukm.findByPk(req.params.id);
    if (!ukm) return res.status(404).json({ message: 'UKM not found' });
    await ukm.update({ isActive: false });
    auditLog('ADMIN_DEACTIVATE_UKM', req.user.id, { ukmId: req.params.id, name: ukm.name });
    res.json({ message: `UKM ${ukm.name} dinonaktifkan` });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// PUT /api/admin/ukm/:id/activate  –  aktifkan kembali UKM
router.put('/ukm/:id/activate', authorizeRoles('superadmin'), async (req, res) => {
  try {
    const ukm = await Ukm.findByPk(req.params.id);
    if (!ukm) return res.status(404).json({ message: 'UKM not found' });
    await ukm.update({ isActive: true });
    auditLog('ADMIN_ACTIVATE_UKM', req.user.id, { ukmId: req.params.id, name: ukm.name });
    res.json({ message: `UKM ${ukm.name} diaktifkan kembali` });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── Audit Logs (FR-AUD-01..02) ────────────────────────────────────────────────
// GET /api/admin/audit-logs  –  Super Admin melihat jejak audit seluruh sistem
router.get('/audit-logs', authorizeRoles('superadmin'), async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      limit: 100,
      order: [['timestamp', 'DESC'], ['id', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'nim', 'name', 'role'] }],
    });
    res.json(logs);
  } catch (e) {
    console.error('Get audit logs error:', e);
    res.status(500).json({ message: 'Gagal memuat jejak audit' });
  }
});

module.exports = router;
