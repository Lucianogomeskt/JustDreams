const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Carregar variáveis de ambiente
dotenv.config();

// Importar configuração do banco de dados
require('./src/config/database');

// Importar e sincronizar modelos
const { syncDatabase } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS
app.use(cors({
  origin: '*', // Permite todas as origens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsing de JSON
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static('.'));

// Importar rotas
const authRoutes = require('./src/routes/auth');
const turmasRoutes = require('./src/routes/turmas');
const progressoRoutes = require('./src/routes/progresso');
const progressoJogoRoutes = require('./src/routes/progressoJogo');

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'API JustDreams está funcionando!',
    version: '1.0.0'
  });
});

// Registrar rotas
app.use('/api/auth', authRoutes);
app.use('/api/turmas', turmasRoutes);
app.use('/api/progresso', progressoRoutes);
app.use('/api/progresso-jogo', progressoJogoRoutes);

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  
  // Sincronizar modelos com o banco de dados
  await syncDatabase();
});
