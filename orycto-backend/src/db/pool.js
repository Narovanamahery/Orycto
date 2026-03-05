const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:                    process.env.DB_HOST     || 'localhost',
  port:                    parseInt(process.env.DB_PORT) || 5432,
  database:                process.env.DB_NAME     || 'orycto',
  user:                    process.env.DB_USER     || 'postgres',
  password:                process.env.DB_PASSWORD || '',
  max:                     10,
  idleTimeoutMillis:       30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Erreur pool PostgreSQL:', err.message);
});

pool.query('SELECT NOW()')
  .then(() => console.log('PostgreSQL connecte'))
  .catch(err => {
    console.error('Impossible de connecter a PostgreSQL:', err.message);
    process.exit(1);
  });

module.exports = pool;
