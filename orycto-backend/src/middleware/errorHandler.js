function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} ->`, err.message);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Cet enregistrement existe deja (doublon).' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Reference invalide (cle etrangere).' });
  }
  if (err.code === '23502') {
    return res.status(400).json({ error: `Champ obligatoire manquant : ${err.column}` });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne',
  });
}

module.exports = errorHandler;
