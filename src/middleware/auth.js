const jwt = require('jsonwebtoken');
const { Professor, Aluno } = require('../models');

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  try {
    // Obter o token do cabeçalho Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_super_seguro_e_aleatorio_para_jwt_em_producao');
    
    // Buscar o usuário no banco de dados para garantir que ainda existe
    let usuario = null;
    if (decoded.tipo === 'professor') {
      usuario = await Professor.findByPk(decoded.id);
    } else if (decoded.tipo === 'aluno') {
      usuario = await Aluno.findByPk(decoded.id);
    }

    if (!usuario) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido - usuário não encontrado'
      });
    }

    // Adicionar informações do usuário ao objeto req
    req.user = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: decoded.tipo
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Token inválido'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Token expirado'
      });
    } else {
      console.error('Erro na autenticação:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

// Middleware de autorização para professores
const requireProfessor = (req, res, next) => {
  if (req.user.tipo !== 'professor') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas professores podem realizar esta ação.'
    });
  }
  next();
};

// Middleware de autorização para alunos
const requireAluno = (req, res, next) => {
  if (req.user.tipo !== 'aluno') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas alunos podem realizar esta ação.'
    });
  }
  next();
};

// Middleware de autorização para professores ou o próprio aluno
const requireProfessorOrSelf = (req, res, next) => {
  const { alunoId } = req.params;
  
  if (req.user.tipo === 'professor') {
    // Professores podem acessar qualquer aluno
    next();
  } else if (req.user.tipo === 'aluno' && req.user.id.toString() === alunoId) {
    // Alunos podem acessar apenas seus próprios dados
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Você só pode acessar seus próprios dados.'
    });
  }
};

module.exports = {
  authenticateToken,
  requireProfessor,
  requireAluno,
  requireProfessorOrSelf
};



