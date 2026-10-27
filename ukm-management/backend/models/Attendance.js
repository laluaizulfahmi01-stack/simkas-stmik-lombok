// models/Attendance.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:     { type: DataTypes.INTEGER, allowNull: false },
  ukmId:      { type: DataTypes.INTEGER, allowNull: false },
  meetingId:  { type: DataTypes.INTEGER, allowNull: true },
  date:       { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  status:     { type: DataTypes.ENUM('hadir', 'izin', 'sakit', 'alpa'), allowNull: false, defaultValue: 'hadir' },
  keterangan: { type: DataTypes.STRING, allowNull: true },
});

module.exports = Attendance;
