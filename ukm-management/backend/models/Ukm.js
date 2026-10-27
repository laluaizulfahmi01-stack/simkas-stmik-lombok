// models/Ukm.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ukm = sequelize.define('Ukm', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  history: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  vision: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  mission: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  logo: {
    type: DataTypes.TEXT, // base64 or URL
    allowNull: true,
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Soft delete (FR-UKM-01: UKM tidak dihapus permanen)
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Jadwal pendaftaran (FR-PND-01)
  registrationOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  registrationOpenDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  registrationCloseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  // Keunggulan, Kategori & Informasi Penting untuk Calon Pendaftar
  tag: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  advantages: {
    type: DataTypes.TEXT, // Keunggulan & manfaat masuk UKM (comma / bullet separated)
    allowNull: true,
  },
  highlights: {
    type: DataTypes.TEXT, // Capaian / headline utama UKM
    allowNull: true,
  },
  activitySchedule: {
    type: DataTypes.STRING, // Jadwal latihan / perkumpulan rutin
    allowNull: true,
  },
  requirements: {
    type: DataTypes.TEXT, // Persyaratan pendaftaran
    allowNull: true,
  },
});

module.exports = Ukm;
