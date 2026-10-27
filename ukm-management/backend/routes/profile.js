// routes/profile.js - Profile, avatar, settings & verification management
const express = require('express');
const bcrypt = require('bcryptjs');
const { User, Ukm } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { auditLog } = require('../security');

const router = express.Router();
router.use(authenticateToken);

// GET /api/profile - Get full profile of current logged-in user
router.get('/', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Ukm, as: 'ukms', through: { attributes: [] }, attributes: ['id', 'name'] }],
    });
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Gagal mengambil data profil' });
  }
});

// PUT /api/profile - Update personal information
router.put('/', async (req, res) => {
  const { name, email, phone, bio, prodi } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });

    await user.update({
      name: name !== undefined ? name : user.name,
      email: email !== undefined ? email : user.email,
      phone: phone !== undefined ? phone : user.phone,
      bio: bio !== undefined ? bio : user.bio,
      prodi: prodi !== undefined ? prodi : user.prodi,
    });

    auditLog('PROFILE_UPDATED', user.id, { name, email, phone });
    res.json({
      message: 'Profil berhasil diperbarui',
      user: {
        id: user.id,
        nim: user.nim,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        prodi: user.prodi,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Gagal memperbarui profil' });
  }
});

// PUT /api/profile/avatar - Update or remove profile picture
router.put('/avatar', async (req, res) => {
  const { avatar } = req.body; // Base64 data URL or null to remove
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });

    await user.update({ avatar: avatar || null });
    auditLog('AVATAR_UPDATED', user.id, { hasAvatar: !!avatar });

    res.json({
      message: avatar ? 'Foto profil berhasil diperbarui' : 'Foto profil berhasil dihapus',
      avatar: user.avatar,
    });
  } catch (err) {
    console.error('Update avatar error:', err);
    res.status(500).json({ message: 'Gagal memperbarui foto profil' });
  }
});

// POST /api/profile/verify - Submit verification request
router.post('/verify', async (req, res) => {
  const { document, note } = req.body; // document = base64 image or file string of KTM/SK
  if (!document) {
    return res.status(400).json({ message: 'Lampirkan bukti dokumen verifikasi (KTM / SK Kepengurusan)' });
  }

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });

    await user.update({
      verificationDocument: document,
      verificationNote: note || 'Pengajuan verifikasi mandiri',
      verificationStatus: 'pending',
    });

    auditLog('VERIFICATION_REQUESTED', user.id, { role: user.role });
    res.json({
      message: 'Permohonan verifikasi berhasil diajukan dan sedang ditinjau oleh Administrator',
      verificationStatus: 'pending',
    });
  } catch (err) {
    console.error('Verification submit error:', err);
    res.status(500).json({ message: 'Gagal mengajukan verifikasi' });
  }
});

// PUT /api/profile/password - Change password
router.put('/password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Kata sandi lama dan baru wajib diisi' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Kata sandi baru minimal 6 karakter' });
  }

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });

    const isValid = await user.validatePassword(oldPassword);
    if (!isValid) {
      return res.status(400).json({ message: 'Kata sandi saat ini tidak cocok' });
    }

    user.password = newPassword;
    await user.save();

    auditLog('PASSWORD_CHANGED', user.id, {});
    res.json({ message: 'Kata sandi berhasil diubah. Silakan gunakan kata sandi baru untuk login berikutnya.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Gagal mengubah kata sandi' });
  }
});

module.exports = router;
