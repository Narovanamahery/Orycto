const { Client } = require('pg');
const fs   = require('fs');
const path = require('path');
require('dotenv').config();

async function init() {
  const client = new Client({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('Connecte a PostgreSQL');

    const sqlPath = path.join(__dirname, '../../orycto_database.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('Fichier SQL introuvable :', sqlPath);
      console.error('Place orycto_database.sql a la racine du dossier orycto-backend/');
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sql);
    console.log('Base de donnees initialisee avec succes');

  } catch (err) {
    console.error('Erreur :', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

init();
