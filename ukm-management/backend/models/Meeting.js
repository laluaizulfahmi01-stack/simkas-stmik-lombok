// models/Meeting.js - Sesi Pertemuan UKM
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Meeting = sequelize.define('Meeting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ukmId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  meetingNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '14:00 - 16:30 WITA',
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Kampus STMIK Lombok',
  },
  agenda: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'completed'),
    allowNull: false,
    defaultValue: 'completed',
  },
  qrToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Meeting;
