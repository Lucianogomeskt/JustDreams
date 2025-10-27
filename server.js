// Server initialization and configuration
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Importar configuração do banco de dados
const sequelize = require('./src/config/database');

// Importar e sincronizar modelos
const { syncDatabase } = require('./src/models');

// === Middlewares ===
// Habilitar o logger
app.use((req, res, next) => {
  console.log('Requisição recebida:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  next();
});

// CORS primeiro
app.use(cors({
  origin: '*', // Permite todas as origens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsing de JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rotas
const amizadesRoutes = require('./src/routes/amizades');
const authRoutes = require('./src/routes/auth');
const turmasRoutes = require('./src/routes/turmas');
const progressoRoutes = require('./src/routes/progresso');
const progressoJogoRoutes = require('./src/routes/progressoJogo');



// === Rotas ===
// Rota raiz
app.get('/', (req, res) => {
  console.log('Rota / acessada');
  res.json({ 
    message: 'API JustDreams está funcionando!',
    version: '1.0.0'
  });
});

// Rota de ping para teste
app.get('/ping', (req, res) => {
  console.log('Rota /ping acessada');
  res.json({ message: 'pong' });
});

// Registrar rotas da API
app.use('/api/amizades', amizadesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/turmas', turmasRoutes);
app.use('/api/progresso', progressoRoutes);
app.use('/api/progresso-jogo', progressoJogoRoutes);

// Setup complete

// Função para iniciar o servidor
const startServer = async () => {
  try {
    console.log('🔄 Iniciando servidor...');
    
    // Primeiro, sincronizar o banco de dados
    console.log('🔄 Sincronizando banco de dados...');
    await syncDatabase();
    console.log('✅ Banco de dados sincronizado');
    
    // Depois, iniciar o servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      const addr = server.address();
      console.log(`✅ Servidor rodando em ${addr.address}:${addr.port}`);
      console.log(`🌐 Acesse: http://localhost:${PORT}`);
    });

    server.on('error', (error) => {
      console.error('❌ Erro no servidor:', error);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();
