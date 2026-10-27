// config/database.js
require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

const dbUrl = process.env.DATABASE_URL;

if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
  // Supabase PostgreSQL mode
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // required for Supabase free tier
      },
    },
  });
} else {
  // SQLite local zero-config mode
  const storagePath = path.resolve(__dirname, '../database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
}

module.exports = { sequelize };
