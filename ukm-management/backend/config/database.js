// config/database.js
require('dotenv').config();
const { Sequelize } = require('sequelize');
const pg = require('pg');
const path = require('path');

let sequelize;

const dbUrl = process.env.DATABASE_URL;

if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
  // Supabase PostgreSQL mode (Staging / Production)
  const maskedHost = dbUrl.replace(/:[^:@]+@/, ':****@');
  console.log(`☁️  [DATABASE] Terhubung ke Cloud PostgreSQL: ${maskedHost.split('@')[1] || 'Supabase'}`);
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectModule: pg,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // required for Supabase free tier
      },
    },
  });
} else {
  // SQLite local zero-config mode (Development Lokal)
  const storagePath = path.resolve(__dirname, '../database.sqlite');
  console.log('📦  [DATABASE] Terhubung ke SQLite Lokal (Development: database.sqlite)');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
}

module.exports = { sequelize };
