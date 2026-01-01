// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     database: process.env.DB_DATABASE
// });

// pool.query('SELECT NOW()')
//     .then(res => console.log('Database connected at:', res.rows[0].now))
//     .catch(err => {
//         console.error('DB connection error:', err.stack);
//         process.exit(1);
//     });

// module.exports = pool;

// db.js
const { Pool } = require("pg");
require("dotenv").config();

let pool;

function createPool() {
  if (!pool) {
    pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      max: 10, // Max clients in the pool
      idleTimeoutMillis: 30000, // Timeout for idle clients
    });

    console.log("Database pool created");

    pool
      .query("SELECT NOW()")
      .then((res) => {
        console.log("Database connected at:", res.rows[0].now);
      })
      .catch((err) => {
        console.error("DB connection error:", err.stack);
        process.exit(1);
      });
  }
  return pool;
}

module.exports = createPool();
