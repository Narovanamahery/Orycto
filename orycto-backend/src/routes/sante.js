const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');

router.get('/pathologies', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, l.nom AS nom_lapin, l.tag AS tag_lapin
      FROM pathologies p
      JOIN lapins l ON p.lapin_id = l.id
      ORDER BY p.date_diagnostic DESC`);
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const { statut } = req.query;
    let query = `
      SELECT s.*, l.nom AS nom_lapin, l.tag AS tag_lapin
      FROM suivis_sante s
      JOIN lapins l ON s.lapin_id = l.id
      WHERE 1=1`;
    const params = [];

    if (statut && statut !== 'all') {
      query += ' AND s.statut = $1';
      params.push(statut);
    }
    query += ' ORDER BY s.date_debut DESC NULLS LAST';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { lapin_id, type_soin, nom_traitement,
            date_debut, date_fin, statut, notes } = req.body;

    if (!lapin_id || !nom_traitement || !type_soin) {
      return res.status(400).json({ error: 'lapin_id, type_soin et nom_traitement sont requis' });
    }

    const { rows: cnt } = await pool.query('SELECT COUNT(*) FROM suivis_sante');
    const code = `TRT-${String(parseInt(cnt[0].count) + 1).padStart(3, '0')}`;

    const { rows } = await pool.query(
      `INSERT INTO suivis_sante
         (code, lapin_id, type_soin, nom_traitement, date_debut, date_fin, statut, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [code, lapin_id, type_soin, nom_traitement,
       date_debut || null, date_fin || null, statut || 'planifie', notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { statut, notes, date_fin } = req.body;
    const { rows } = await pool.query(
      'UPDATE suivis_sante SET statut=$1, notes=$2, date_fin=$3 WHERE id=$4 RETURNING *',
      [statut, notes || null, date_fin || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Traitement introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM suivis_sante WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Traitement introuvable' });
    res.json({ message: 'Traitement supprime' });
  } catch (err) { next(err); }
});

module.exports = router;
