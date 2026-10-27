// models/Event.js - Agenda Kegiatan UKM
// PRD: FR-AGD-01..05 & Visual ERD
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
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
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Kampus STMIK Lombok',
  },
  visibility: {
    type: DataTypes.ENUM('publik', 'internal'),
    defaultValue: 'internal',
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('direncanakan', 'terlaksana', 'ditunda', 'dibatalkan'),
    defaultValue: 'direncanakan',
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Event;
