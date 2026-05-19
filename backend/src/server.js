require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
require('./config/database'); // inicializa SQLite e cria schema
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: '🚀 Server Hub v2.0 - Backend API',
    version: '2.0.0',
    status: 'running',
    database: 'SQLite',
    endpoints: {
      links: '/api/links',
      categories: '/api/categories',
      tags: '/api/tags',
      variables: '/api/variables',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/links', require('./routes/links'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/variables', require('./routes/variables'));

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado', path: req.path });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
