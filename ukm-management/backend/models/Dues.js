// models/Dues.js - Kewajiban Iuran UKM
// PRD: FR-KEU-01..03, K9 - Pencatatan kewajiban dan pembayaran iuran
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Kewajiban iuran (FR-KEU-01)
const Dues = sequelize.define('Dues', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ukmId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false, // nama iuran, contoh: "Iuran Bulanan Oktober 2026"
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false, // nominal default iuran (bisa berbeda per anggota)
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false, // jatuh tempo
  },
  // Dibuat oleh (bendahara atau pengelola)
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Apakah iuran ini masih aktif
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Dues;
