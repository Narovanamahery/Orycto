const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');

router.get('/stocks', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM v_alertes_stock');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/stocks/restock', async (req, res, next) => {
  try {
    const { aliment_id, quantite, date_expiration } = req.body;
    if (!aliment_id || !quantite) {
      return res.status(400).json({ error: 'aliment_id et quantite sont requis' });
    }
    const { rows } = await pool.query(
      `UPDATE stocks_aliment
       SET quantite = quantite + $1,
           date_expiration = COALESCE($2, date_expiration),
           mis_a_jour = NOW()
       WHERE aliment_id = $3
       RETURNING *`,
      [quantite, date_expiration || null, aliment_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Stock introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.get('/distributions', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT d.*, a.nom AS nom_aliment, a.unite,
             l.nom AS nom_lapin, c.code AS cage
      FROM distributions_aliment d
      JOIN aliments a ON d.aliment_id = a.id
      LEFT JOIN lapins l ON d.lapin_id = l.id
      LEFT JOIN cages  c ON d.cage_id  = c.id
      ORDER BY d.date_dist DESC, d.cree_le DESC
      LIMIT 100`);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/distributions', async (req, res, next) => {
  try {
    const { date_dist, aliment_id, lapin_id, cage_id, quantite, notes } = req.body;
    if (!aliment_id || !quantite) {
      return res.status(400).json({ error: 'aliment_id et quantite sont requis' });
    }

    const { rows: cnt } = await pool.query('SELECT COUNT(*) FROM distributions_aliment');
    const code = `DST-${String(parseInt(cnt[0].count) + 1).padStart(3, '0')}`;

    const { rows } = await pool.query(
      `INSERT INTO distributions_aliment
         (code, date_dist, aliment_id, lapin_id, cage_id, quantite, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [code, date_dist || new Date().toISOString().split('T')[0],
       aliment_id, lapin_id || null, cage_id || null, quantite, notes || null]
    );

    await pool.query(
      `UPDATE stocks_aliment
       SET quantite = quantite - $1, mis_a_jour = NOW()
       WHERE aliment_id = $2`,
      [quantite, aliment_id]
    );

    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/distributions/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM distributions_aliment WHERE id=$1', [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Distribution introuvable' });
    res.json({ message: 'Distribution supprimee' });
  } catch (err) { next(err); }
});

module.exports = router;
