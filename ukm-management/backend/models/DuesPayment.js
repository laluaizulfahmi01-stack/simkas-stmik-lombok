// models/DuesPayment.js - Pembayaran Iuran per Anggota
// PRD: FR-KEU-02..03 - Pencatatan pembayaran iuran per anggota
// Status: hanya 'lunas' atau 'belum_lunas' (K9 - tanpa cicilan)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DuesPayment = sequelize.define('DuesPayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  duesId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false, // anggota yang dikenai iuran
  },
  ukmId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Nominal yang dikenai (bisa berbeda dari default Dues.amount - FR-KEU-01)
  amountDue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  // Jumlah yang dibayar (FR-KEU-02)
  amountPaid: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0,
  },
  // FR-KEU-03: Status hanya lunas atau belum_lunas
  status: {
    type: DataTypes.ENUM('belum_lunas', 'lunas'),
    defaultValue: 'belum_lunas',
    allowNull: false,
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Dicatat oleh (bendahara)
  recordedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Bukti pembayaran (FR-KEU-05)
  attachment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // FR-KEU-10: Soft cancel (tidak dihapus)
  isCancelled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cancelledBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cancelNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = DuesPayment;
