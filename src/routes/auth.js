const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Professor, Aluno } = require('../models');
const router = express.Router();

// Rota de registro de usuário
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, tipo, turma, idade } = req.body;

    // Validação dos dados obrigatórios
    if (!nome || !senha || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios: nome, senha, tipo'
      });
    }

    // Validação específica por tipo
    if (tipo === 'professor' && !email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório para professores'
      });
    }

    if (tipo === 'aluno' && !turma) {
      return res.status(400).json({
        success: false,
        message: 'Turma é obrigatória para alunos'
      });
    }

    // Validar formato da turma para alunos (número + ° + letra)
    if (tipo === 'aluno' && turma) {
      const turmaRegex = /^[0-9]+°[A-Za-z]$/;
      if (!turmaRegex.test(turma.trim())) {
        return res.status(400).json({
          success: false,
          message: 'A turma deve estar no formato: número + ° + letra (ex: 1°A, 2°B, 3°C)'
        });
      }
    }

    // Validação do tipo de usuário
    if (!['professor', 'aluno'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de usuário deve ser "professor" ou "aluno"'
      });
    }

    // Validação do email apenas para professores
    if (tipo === 'professor') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }
    }

    // Validação da senha (mínimo 6 caracteres)
    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Verificar se o usuário já existe
    let existingUser = null;
    if (tipo === 'professor') {
      existingUser = await Professor.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    } else {
      // Para alunos, verificar se o nome já existe
      const { nome, turma } = req.body;
      existingUser = await Aluno.findOne({ where: { nome } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Nome já está em uso'
        });
      }
    }

    // Gerar hash da senha
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // Criar usuário no banco de dados
    let novoUsuario;
    if (tipo === 'professor') {
      novoUsuario = await Professor.create({
        nome,
        email,
        senha_hash: senhaHash,
        tipo: 'professor'
      });
    } else {
      // Para alunos, precisamos da idade, turma e senha
      const { idade, turma } = req.body;
      if (!idade || idade < 5 || idade > 100) {
        return res.status(400).json({
          success: false,
          message: 'Idade é obrigatória para alunos e deve estar entre 5 e 100 anos'
        });
      }

      if (!turma || turma.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Turma é obrigatória para alunos'
        });
      }

      // Gerar hash da senha para alunos
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      novoUsuario = await Aluno.create({
        nome,
        idade,
        turma: turma.trim(),
        senha_hash: senhaHash,
        tipo: 'aluno'
      });
    }

    // Retornar resposta de sucesso
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        tipo: novoUsuario.tipo,
        ...(novoUsuario.tipo === 'aluno' ? {
          idade: novoUsuario.idade,
          turma: novoUsuario.turma
        } : {
          email: novoUsuario.email
        }),
        created_at: novoUsuario.created_at
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { email, senha, nome, tipo } = req.body;

    // Validação dos dados obrigatórios
    if (!senha) {
      return res.status(400).json({
        success: false,
        message: 'Senha é obrigatória'
      });
    }

    let usuario = null;
    let tipoUsuario = null;

    // Se tipo for especificado, buscar por tipo específico
    if (tipo === 'professor') {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório para professores'
        });
      }
      
      // Validação do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      usuario = await Professor.findOne({ where: { email } });
      tipoUsuario = 'professor';
    } else if (tipo === 'aluno') {
      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome é obrigatório para alunos'
        });
      }

      usuario = await Aluno.findOne({ where: { nome } });
      tipoUsuario = 'aluno';
    } else {
      // Buscar primeiro por email (professor), depois por nome (aluno)
      if (email && email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
          usuario = await Professor.findOne({ where: { email } });
          tipoUsuario = 'professor';
        }
      }
      
      if (!usuario && nome && nome.trim() !== '') {
        usuario = await Aluno.findOne({ where: { nome } });
        tipoUsuario = 'aluno';
      }
    }

    // Se usuário não encontrado, retornar erro genérico
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Comparar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar JWT
    const payload = {
      id: usuario.id,
      tipo: tipoUsuario,
      ...(tipoUsuario === 'professor' ? { email: usuario.email } : { nome: usuario.nome })
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'seu_segredo_super_seguro_e_aleatorio_para_jwt_em_producao', {
      expiresIn: '1h'
    });

    // Retornar resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          tipo: tipoUsuario,
          ...(tipoUsuario === 'professor' ? {
            email: usuario.email
          } : {
            idade: usuario.idade,
            turma: usuario.turma
          })
        }
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
