// Configuração da conexão com o banco de dados
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente SOMENTE SE NÃO ESTIVER EM PRODUÇÃO (como no Railway)
// Isso impede que um arquivo .env local vazio ou incorreto sobrescreva as variáveis do Railway.
// NOTE: O Railway define process.env.NODE_ENV por conta própria, mas a leitura do .env deve ser condicional.
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// --- CORREÇÃO FINAL PARA AMBIENTE CLOUD/RAILWAY ---
// Priorizamos variáveis sem espaços que são padrões em cloud (MYSQL_HOST, etc.)
// e mantemos o fallback para desenvolvimento local (DB_HOST, 'localhost').

const sequelize = new Sequelize(
 // 1. DATABASE NAME: Prioriza DB_NAME ou usa o padrão da nuvem (MYSQL_DATABASE)
 process.env.DB_NAME || process.env.MYSQL_DATABASE || 'justdreams',
 
 // 2. USER: Prioriza DB_USER ou usa o padrão da nuvem (MYSQL_USER)
 process.env.DB_USER || process.env.MYSQL_USER || 'root',
 
 // 3. PASSWORD: Prioriza DB_PASSWORD ou usa o padrão da nuvem (MYSQL_PASSWORD)
 process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
 {
 // 4. HOST: Prioriza DB_HOST ou usa o padrão da nuvem (MYSQL_HOST)
 host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    
    // 5. PORTA: Prioriza a porta do Railway (MYSQL_PORT)
    port: process.env.DB_PORT || process.env.MYSQL_PORT || 3306,

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
    // Para depuração, usamos os valores finais que serão usados na conexão
    console.log(`Host: ${sequelize.options.host}:${sequelize.options.port}`);
    console.log(`User: ${sequelize.options.username}`);
    
 await sequelize.authenticate();
 console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
 } catch (error) {
 // Imprimimos a mensagem de erro para debug
 console.error('❌ Não foi possível conectar ao banco de dados (VERIFIQUE AS VARIÁVEIS NO RAILWAY):', error.message);
 // Rejeita a promise para que o erro seja capturado no startServer
 throw error; 
 }
};

// Testar conexão na inicialização
testConnection();

module.exports = sequelize;
