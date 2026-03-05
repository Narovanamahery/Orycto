const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');

router.get('/portees', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT mb.*, ac.code AS code_accouplement,
             m.nom AS nom_mere, m.tag AS tag_mere,
             p.nom AS nom_pere, p.tag AS tag_pere,
             c.code AS cage
      FROM mise_bas mb
      JOIN accouplements ac ON mb.accouplement_id = ac.id
      JOIN lapins m ON ac.femelle_id = m.id
      JOIN lapins p ON ac.male_id    = p.id
      LEFT JOIN cages c ON mb.cage_id = c.id
      ORDER BY mb.date_naissance DESC`);
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM v_accouplements ORDER BY date_accouplement DESC'
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { male_id, femelle_id, date_accouplement, statut, notes } = req.body;
    if (!male_id || !femelle_id || !date_accouplement) {
      return res.status(400).json({ error: 'male_id, femelle_id et date_accouplement sont requis' });
    }

    const dateNaissancePrevue = new Date(date_accouplement);
    dateNaissancePrevue.setDate(dateNaissancePrevue.getDate() + 31);

    const { rows: cnt } = await pool.query('SELECT COUNT(*) FROM accouplements');
    const code = `ACC-${String(parseInt(cnt[0].count) + 1).padStart(3, '0')}`;

    const { rows } = await pool.query(
      `INSERT INTO accouplements
         (code, male_id, femelle_id, date_accouplement, date_naissance_prevue, statut, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [code, male_id, femelle_id, date_accouplement,
       dateNaissancePrevue.toISOString().split('T')[0],
       statut || 'planifie', notes || null]
    );

    if (statut === 'en_attente') {
      await pool.query("UPDATE lapins SET statut='gestante' WHERE id=$1", [femelle_id]);
    }
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.post('/:id/naissance', async (req, res, next) => {
  try {
    const { date_naissance, nb_vivants, nb_morts, cage_id, notes } = req.body;
    const nbVivants = parseInt(nb_vivants) || 0;
    const nbMorts   = parseInt(nb_morts)   || 0;
    const nb_nes    = nbVivants + nbMorts;

    const { rows: cnt } = await pool.query('SELECT COUNT(*) FROM mise_bas');
    const code = `LIT-${String(parseInt(cnt[0].count) + 1).padStart(3, '0')}`;

    const dateNaissance = date_naissance || new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(
      `INSERT INTO mise_bas
         (code, accouplement_id, date_naissance, nb_nes, nb_vivants, nb_morts, cage_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [code, req.params.id, dateNaissance, nb_nes, nbVivants, nbMorts,
       cage_id || null, notes || null]
    );

    await pool.query(
      `UPDATE accouplements
       SET statut='succes', taille_portee=$1, date_naissance_reelle=$2
       WHERE id=$3`,
      [nb_nes, dateNaissance, req.params.id]
    );

    await pool.query(
      `UPDATE lapins SET statut='allaitante'
       WHERE id = (SELECT femelle_id FROM accouplements WHERE id=$1)`,
      [req.params.id]
    );

    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM accouplements WHERE id=$1', [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Accouplement introuvable' });
    res.json({ message: 'Accouplement supprime' });
  } catch (err) { next(err); }
});

module.exports = router;
