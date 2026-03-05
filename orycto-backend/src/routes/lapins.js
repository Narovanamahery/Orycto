const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');

router.get('/', async (req, res, next) => {
  try {
    const { statut, sexe, race, search } = req.query;
    let query  = 'SELECT * FROM v_lapins WHERE 1=1';
    const params = [];
    let i = 1;

    if (statut && statut !== 'all') {
      query += ` AND statut = $${i++}`;
      params.push(statut);
    }
    if (sexe) {
      query += ` AND sexe = $${i++}`;
      params.push(sexe.toUpperCase());
    }
    if (race) {
      query += ` AND LOWER(race) = $${i++}`;
      params.push(race.toLowerCase());
    }
    if (search) {
      query += ` AND (LOWER(nom) LIKE $${i} OR LOWER(tag) LIKE $${i} OR LOWER(race) LIKE $${i})`;
      params.push(`%${search.toLowerCase()}%`);
      i++;
    }

    query += ' ORDER BY tag';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM v_lapins WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Lapin introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { tag, nom, sexe, race_id, date_naissance, cage_id,
            poids_actuel, statut, mere_id, pere_id, notes } = req.body;

    if (!tag || !nom || !sexe) {
      return res.status(400).json({ error: 'tag, nom et sexe sont obligatoires' });
    }

    const { rows } = await pool.query(
      `INSERT INTO lapins
         (tag, nom, sexe, race_id, date_naissance, cage_id,
          poids_actuel, statut, mere_id, pere_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [tag, nom, sexe.toUpperCase(), race_id || null, date_naissance || null,
       cage_id || null, poids_actuel || null, statut || 'actif',
       mere_id || null, pere_id || null, notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { tag, nom, sexe, race_id, date_naissance, cage_id,
            poids_actuel, statut, mere_id, pere_id, notes } = req.body;

    const { rows } = await pool.query(
      `UPDATE lapins SET
         tag=$1, nom=$2, sexe=$3, race_id=$4, date_naissance=$5,
         cage_id=$6, poids_actuel=$7, statut=$8, mere_id=$9,
         pere_id=$10, notes=$11, mis_a_jour=NOW()
       WHERE id=$12 RETURNING *`,
      [tag, nom, sexe?.toUpperCase(), race_id || null, date_naissance || null,
       cage_id || null, poids_actuel || null, statut,
       mere_id || null, pere_id || null, notes || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Lapin introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM lapins WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Lapin introuvable' });
    res.json({ message: 'Lapin supprime' });
  } catch (err) { next(err); }
});

module.exports = router;
