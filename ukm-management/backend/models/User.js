// models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nim: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prodi: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('student', 'superadmin', 'manager'),
    defaultValue: 'student',
  },
  // FR-AKN-07 [K]: Akun tidak dihapus permanen, hanya ubah status
  accountStatus: {
    type: DataTypes.ENUM('aktif', 'lulus', 'nonaktif'),
    defaultValue: 'aktif',
  },
  avatar: {
    type: DataTypes.TEXT, // Base64 data URL or external URL
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verificationStatus: {
    type: DataTypes.ENUM('unverified', 'pending', 'verified', 'rejected'),
    defaultValue: 'unverified',
  },
  verificationDocument: {
    type: DataTypes.TEXT, // Base64 proof (KTM / SK Pengelola)
    allowNull: true,
  },
  verificationNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // FR-AKN-05: Siapa yang memverifikasi
  verifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

// Hook to hash password before saving
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
