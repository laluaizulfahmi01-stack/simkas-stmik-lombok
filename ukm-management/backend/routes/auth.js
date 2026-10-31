// routes/auth.js - Secured Authentication with Cyber Security Guard
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Ukm, UserUkm, Application } = require('../models');
const { authLimiter, auditLog } = require('../security');
const { Op, Sequelize } = require('sequelize');
require('dotenv').config();

const router = express.Router();

// Register a new student (role = student) with rate-limit protection
router.post('/register', authLimiter, async (req, res) => {
  const { nim, name, prodi, password, ktmDocument, ukmId, motivation } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  if (!nim || !name || !prodi || !password) {
    return res.status(400).json({ message: 'Semua kolom wajib diisi' });
  }

  try {
    const cleanNim = String(nim).trim();
    const cleanName = String(name).trim();
    const cleanProdi = String(prodi).trim();

    const user = await User.create({
      nim: cleanNim,
      name: cleanName,
      prodi: cleanProdi,
      password,
      role: 'student',
      isVerified: false,
      verificationStatus: ktmDocument ? 'pending' : 'unverified',
      verificationDocument: ktmDocument || null,
      verificationNote: ktmDocument ? 'Dokumen KTM diunggah saat registrasi akun' : null,
    });

    let application = null;
    if (ukmId) {
      const ukm = await Ukm.findOne({ where: { id: ukmId, isActive: true } });
      if (ukm) {
        application = await Application.create({
          userId: user.id,
          ukmId: ukm.id,
          motivation: motivation ? String(motivation).trim() : 'Pendaftaran awal saat registrasi akun mahasiswa',
          status: 'diajukan',
        });
        auditLog('APPLICATION_SUBMITTED_ON_REGISTER', user.id, { ukmId: ukm.id, applicationId: application.id });
      }
    }

    const secret = process.env.JWT_SECRET || 'simkas_stmik_lombok_super_secret_jwt_2024';
    const token = jwt.sign({ id: user.id, role: user.role }, secret, {
      expiresIn: '12h',
    });

    auditLog('AUTH_REGISTER_SUCCESS', user.id, { nim: cleanNim, name: cleanName, prodi: cleanProdi, ip, hasKtm: !!ktmDocument, ukmId });
    res.status(201).json({
      message: application
        ? 'Pendaftaran akun & pengajuan UKM berhasil! Berkas Anda sedang menunggu persetujuan pengelola.'
        : 'Pendaftaran akun berhasil!',
      token,
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
        ukms: [],
      },
      application,
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      auditLog('AUTH_REGISTER_NIM_EXISTS', null, { nim, ip });
      return res.status(409).json({ message: 'NIM sudah terdaftar di sistem' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Login (Students, Managers, Superadmin) with Anti-Brute-Force
router.post('/login', authLimiter, async (req, res) => {
  const { nim, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  if (!nim || !password) {
    return res.status(400).json({ message: 'NIM / Email dan kata sandi wajib diisi' });
  }

  try {
    const identifier = String(nim).trim();
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { nim: identifier },
          { email: identifier },
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('name')),
            identifier.toLowerCase()
          ),
        ],
      },
    });
    if (!user) {
      auditLog('AUTH_LOGIN_FAILED_NOT_FOUND', null, { identifier, ip });
      return res.status(401).json({ message: 'NIM, Nama, atau Email belum terdaftar di sistem' });
    }

    const valid = await user.validatePassword(password);
    if (!valid) {
      auditLog('AUTH_LOGIN_FAILED_WRONG_PASSWORD', user.id, { nim, ip });
      return res.status(401).json({ message: 'Kombinasi NIM dan password tidak cocok' });
    }

    const secret = process.env.JWT_SECRET || 'simkas_stmik_lombok_super_secret_jwt_2024';
    const token = jwt.sign({ id: user.id, role: user.role }, secret, {
      expiresIn: '12h',
    });

    const userUkms = await user.getUkms({ attributes: ['id', 'name'] });
    auditLog('AUTH_LOGIN_SUCCESS', user.id, { nim: user.nim, role: user.role, ip });

    res.json({
      token,
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
        ukms: userUkms,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Terjadi kendala saat proses autentikasi' });
  }
});

module.exports = router;
