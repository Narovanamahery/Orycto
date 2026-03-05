require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const errorHandler = require('./middleware/errorHandler');

const lapinsRouter       = require('./routes/lapins');
const santeRouter        = require('./routes/sante');
const reproductionRouter = require('./routes/reproduction');
const alimentationRouter = require('./routes/alimentation');
const dashboardRouter    = require('./routes/dashboard');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`-> ${req.method} ${req.path}`);
    next();
  });
}

app.use('/api/lapins',       lapinsRouter);
app.use('/api/sante',        santeRouter);
app.use('/api/reproduction', reproductionRouter);
app.use('/api/alimentation', alimentationRouter);
app.use('/api/dashboard',    dashboardRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => res.status(404).json({ error: 'Route introuvable' }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\nOrycto API demarree sur http://localhost:${PORT}\n`);
});
