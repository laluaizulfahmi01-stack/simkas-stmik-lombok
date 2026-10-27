// models/UserUkm.js - Keanggotaan & Jabatan per-UKM
// PRD: RB-01..04 - Peran melekat pada konteks UKM
// PRD: FR-MBR-01..05 - Status keanggotaan & riwayat jabatan
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserUkm = sequelize.define('UserUkm', {
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
  // Status keanggotaan (FR-MBR-01, FR-MBR-02)
  membershipStatus: {
    type: DataTypes.ENUM('aktif', 'keluar', 'dikeluarkan', 'nonaktif'),
    defaultValue: 'aktif',
    allowNull: false,
  },
  // Jabatan per-UKM (PRD RB-01, FR-UKM-03)
  // Null = anggota biasa; bisa ada beberapa record dengan jabatan berbeda (RB-02)
  ukmRole: {
    type: DataTypes.ENUM('anggota', 'pengelola', 'bendahara', 'sekretaris', 'publikasi'),
    defaultValue: 'anggota',
    allowNull: false,
  },
  // Riwayat jabatan (FR-UKM-04, RB-03)
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  // Alasan keluar/dikeluarkan (FR-MBR-02)
  exitReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  exitDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
});

module.exports = UserUkm;
