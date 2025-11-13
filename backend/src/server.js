require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas básicas
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Server Hub v2.0 - Backend API',
    version: '2.0.0',
    status: 'running',
    database: 'MongoDB',
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

// Rotas da API
app.use('/api/links', require('./routes/links'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/variables', require('./routes/variables'));

// Middleware de erro 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.path,
  });
});

// Middleware de erro global
app.use(errorHandler);

// Inicializar servidor
const startServer = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log('---');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
