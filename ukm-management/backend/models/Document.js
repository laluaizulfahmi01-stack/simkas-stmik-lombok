// models/Document.js - Berkas & Dokumen Internal Organisasi
// PRD: FR-DOK-01..03 & Visual ERD
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('sk', 'ad_art', 'lpj', 'panduan', 'lainnya'),
    defaultValue: 'panduan',
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.TEXT, // Base64 data URL or external URL
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Document;
