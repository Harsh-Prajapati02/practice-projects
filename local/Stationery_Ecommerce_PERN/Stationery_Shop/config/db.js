const { Pool } = require('pg');
require('dotenv').config();
const process = require('process');

// Singleton pattern for creating a single pool instance
let poolInstance = null;

// Utility function for logging with timestamps
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

function createPool() {
  if (!poolInstance) {
    poolInstance = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
      max: process.env.DB_MAX_CONNECTIONS || 20, // Max clients in the pool
      idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000, // Timeout for idle clients
      connectionTimeoutMillis: process.env.DB_CONN_TIMEOUT || 2000, // Timeout for new connections
    });

    // Connection success log
    poolInstance.on('connect', (client) => {
      log(`Database connected successfully (Client: ${client.processID})`);
    });

    // Error handling for pool connections
    poolInstance.on('error', (err) => {
      log(`Error with the database connection pool: ${err.message}`);
    });

    // Initial connection test to ensure the pool is working
    poolInstance.query('SELECT NOW()')
      .then((res) => {
        log(`Database connected at: ${res.rows[0].now}`);
      }) 
      .catch((err) => {
        log(`Database connection error: ${err.message}`);
        process.exit(1);  // Exit if the DB connection fails
      });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      log('SIGTERM received: Closing database pool...');
      poolInstance.end(() => {
        log('Database pool closed gracefully');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      log('SIGINT received: Closing database pool...');
      poolInstance.end(() => {
        log('Database pool closed gracefully');
        process.exit(0);
      });
    });
  }

  return poolInstance;
}

module.exports = { getPool: createPool };