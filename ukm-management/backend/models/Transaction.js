// models/Transaction.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'operasional',
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  proofReceipt: {
    type: DataTypes.TEXT, // Base64 data URL or file URL
    allowNull: true,
  },
  // FR-KEU-10 & NFR-07: Soft cancellation
  isCancelled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Transaction;
