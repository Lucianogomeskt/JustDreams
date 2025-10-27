// Arquivo de exemplo para configurações de ambiente
// Copie este arquivo para .env e ajuste os valores conforme necessário

module.exports = {
  // Configurações do Servidor
  PORT: process.env.PORT || 3000,
  
  // Configurações do Banco de Dados
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'justdreams',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  
  // JWT Secret (IMPORTANTE: Altere em produção)
  JWT_SECRET: process.env.JWT_SECRET || 'seu_segredo_super_seguro_e_aleatorio_para_jwt_em_producao',
  
  // Configurações de Desenvolvimento
  NODE_ENV: process.env.NODE_ENV || 'development'
};



