const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err, client) => {
  console.error('Error with the PostgreSQL pool', err);
});

module.exports = { pool };