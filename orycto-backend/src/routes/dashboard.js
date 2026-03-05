const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');

router.get('/', async (req, res, next) => {
  try {
    const [kpis, alertes, activites, stocks] = await Promise.all([
      pool.query('SELECT * FROM v_indicateurs'),

      pool.query(`
        SELECT 'vaccin_retard' AS type, l.nom, l.tag, s.nom_traitement AS detail
        FROM suivis_sante s
        JOIN lapins l ON s.lapin_id = l.id
        WHERE s.statut = 'en_retard'
        UNION ALL
        SELECT 'naissance_proche', l.nom, l.tag,
               'Naissance prevue le ' || a.date_naissance_prevue::text AS detail
        FROM accouplements a
        JOIN lapins l ON a.femelle_id = l.id
        WHERE a.statut = 'en_attente'
          AND a.date_naissance_prevue <= CURRENT_DATE + INTERVAL '3 days'
        UNION ALL
        SELECT 'stock_critique', nom, '' AS tag,
               quantite::text || ' ' || unite AS detail
        FROM v_alertes_stock
        WHERE statut_stock = 'critique'
        ORDER BY type`),

      pool.query(`
        SELECT e.type_event, e.titre, e.description, e.montant,
               e.date_event, l.nom AS nom_lapin
        FROM evenements e
        LEFT JOIN lapins l ON e.lapin_id = l.id
        ORDER BY e.date_event DESC
        LIMIT 6`),

      pool.query('SELECT * FROM v_alertes_stock'),
    ]);

    res.json({
      kpis:      kpis.rows[0],
      alertes:   alertes.rows,
      activites: activites.rows,
      stocks:    stocks.rows,
    });
  } catch (err) { next(err); }
});

router.get('/statistiques', async (req, res, next) => {
  try {
    const [mensuel, races, couts] = await Promise.all([
      pool.query(`
        SELECT
          TO_CHAR(date_event, 'Mon') AS mois,
          EXTRACT(MONTH FROM date_event) AS num_mois,
          COUNT(*) FILTER (WHERE type_event = 'naissance') AS naissances,
          COUNT(*) FILTER (WHERE type_event = 'deces')     AS deces,
          COUNT(*) FILTER (WHERE type_event = 'vente')     AS ventes,
          COALESCE(SUM(montant) FILTER (WHERE type_event = 'vente'), 0) AS revenus
        FROM evenements
        WHERE date_event >= NOW() - INTERVAL '6 months'
        GROUP BY mois, num_mois
        ORDER BY num_mois`),

      pool.query(`
        SELECT r.nom AS race, COUNT(l.id) AS nb,
               ROUND(COUNT(l.id) * 100.0 / NULLIF(
                 (SELECT COUNT(*) FROM lapins WHERE statut NOT IN ('vendu','mort')), 0
               ), 1) AS pct
        FROM lapins l
        JOIN races r ON l.race_id = r.id
        WHERE l.statut NOT IN ('vendu','mort')
        GROUP BY r.nom
        ORDER BY nb DESC`),

      pool.query(`
        SELECT a.type_aliment AS categorie,
               SUM(d.quantite * a.cout_unitaire) AS montant
        FROM distributions_aliment d
        JOIN aliments a ON d.aliment_id = a.id
        WHERE d.date_dist >= DATE_TRUNC('month', NOW()) - INTERVAL '6 months'
        GROUP BY a.type_aliment
        ORDER BY montant DESC`),
    ]);

    res.json({
      mensuel: mensuel.rows,
      races:   races.rows,
      couts:   couts.rows,
    });
  } catch (err) { next(err); }
});

module.exports = router;
