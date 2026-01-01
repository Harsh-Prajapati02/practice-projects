const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the connection when the app starts
pool.connect()
  .then(client => {
    return client
      .query('SELECT NOW()')
      .then(res => {
        console.log(`✅ PostgreSQL connected successfully at ${res.rows[0].now}`);
        client.release();
      })
      .catch(err => {
        client.release();
        console.error('❌ Error executing test query:', err.stack);
      });
  })
  .catch(err => {
    console.error('❌ Failed to connect to PostgreSQL:', err.stack);
  });

module.exports = pool;