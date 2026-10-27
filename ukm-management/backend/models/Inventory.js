// models/Inventory.js - Modul Inventaris Sederhana UKM
// PRD: FR-INV-01..03, K17 & Visual ERD
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ukmId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  itemName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  condition: {
    type: DataTypes.ENUM('baik', 'rusak_ringan', 'rusak_berat'),
    defaultValue: 'baik',
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Inventory;
