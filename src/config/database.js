// Configuração da conexão com o banco de dados
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente (só funcionarão se o arquivo .env estiver no deploy, 
// mas é bom para garantir o desenvolvimento local)
dotenv.config();

// --- CORREÇÃO OBRIGATÓRIA PARA O RAILWAY ---
// A lógica agora tenta primeiro ler as variáveis que o Railway injeta do serviço MySQL
// (usando os nomes com espaços, caso não tenhamos criado as referências simples como DB_HOST).

const sequelize = new Sequelize(
 // 1. DATABASE NAME: Prioriza DB_NAME ou usa a variável nativa do Railway (BANCO DE DADOS MYSQL)
 process.env.DB_NAME || process.env['BANCO DE DADOS MYSQL'] || 'justdreams',
 
 // 2. USER: Prioriza DB_USER ou usa a variável nativa do Railway (USUÁRIO MYSQL)
 process.env.DB_USER || process.env['USUÁRIO MYSQL'] || 'root',
 
 // 3. PASSWORD: Prioriza DB_PASSWORD ou usa a variável nativa do Railway (SENHA DO MYSQL)
 process.env.DB_PASSWORD || process.env['SENHA DO MYSQL'] || '',
 {
 // 4. HOST: Prioriza DB_HOST ou usa a variável nativa do Railway (HOST MYSQL)
 host: process.env.DB_HOST || process.env['HOST MYSQL'] || 'localhost',
    
    // 5. PORTA: Prioriza a porta do Railway (MYSQLPORT)
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,

 dialect: 'mysql',
 // Logging: Use o log do Sequelize apenas em desenvolvimento local para evitar poluição no Railway
 logging: process.env.NODE_ENV === 'development' ? console.log : false,
 pool: {
 max: 5,
 min: 0,
 acquire: 30000,
 idle: 10000
 }
 }
);

// Função para testar a conexão
const testConnection = async () => {
 try {
    // Log para depuração que aparecerá nos logs do Railway:
    console.log('🔄 Tentando conectar ao DB com as credenciais:');
    console.log(`Host: ${sequelize.options.host}:${sequelize.options.port}`);
    console.log(`User: ${sequelize.options.username}`);
    
 await sequelize.authenticate();
 console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
 } catch (error) {
 console.error('❌ Não foi possível conectar ao banco de dados (VERIFIQUE AS VARIÁVEIS NO RAILWAY):', error.message);
 // No Railway, isso provavelmente causará a falha "Acidentado"
 }
};

// Testar conexão na inicialização
testConnection();

module.exports = sequelize;
