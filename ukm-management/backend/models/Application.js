// models/Application.js - Pendaftaran & Seleksi UKM
// PRD: FR-PND-01..07 - Alur pendaftaran dan seleksi mahasiswa ke UKM
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ukmId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // FR-PND-04: Status pendaftaran
  status: {
    type: DataTypes.ENUM('diajukan', 'dalam_seleksi', 'diterima', 'ditolak', 'dibatalkan'),
    defaultValue: 'diajukan',
    allowNull: false,
  },
  // Catatan dari pengelola
  managerNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Alasan pembatalan (FR-PND-05)
  cancelReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Diproses oleh (manager yang memproses)
  processedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Motivasi / pesan dari mahasiswa saat mendaftar
  motivation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Application;
