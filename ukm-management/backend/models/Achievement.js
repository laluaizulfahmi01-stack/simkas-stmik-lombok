// models/Achievement.js - Capaian, Prestasi, Galeri Foto & E-Book UKM
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ukmId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING, // 'capaian', 'ebook', 'foto_kegiatan'
    allowNull: false,
    defaultValue: 'capaian',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  year: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '2026',
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fileUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fileSize: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Achievement;
