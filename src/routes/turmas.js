const express = require('express');
const { Turma, ProfessorTurma, Professor, Aluno, AlunoTurma } = require('../models');
const { authenticateToken, requireProfessor } = require('../middleware/auth');
const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Função para gerar código único da turma
function gerarCodigoTurma(nome) {
  // Para o formato 1°A, usar o próprio nome como base
  // Remover o símbolo ° e adicionar timestamp
  let codigo = nome.replace('°', '');
  
  // Adicionar timestamp para garantir unicidade
  const timestamp = Date.now().toString().slice(-4);
  codigo += timestamp;
  
  return codigo;
}

// Rota para criar uma nova turma
router.post('/', requireProfessor, async (req, res) => {
  try {
    const { nome, descricao, nivel, capacidade, turno } = req.body;

    // Validação dos dados obrigatórios
    if (!nome || nome.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Nome da turma é obrigatório'
      });
    }

    // Validação do formato da turma (número + ° + letra)
    const turmaRegex = /^[0-9]+°[A-Za-z]$/;
    if (!turmaRegex.test(nome.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A turma deve estar no formato: número + ° + letra (ex: 1°A, 2°B, 3°C)'
      });
    }

    // Validação do nome da turma
    if (nome.length < 2 || nome.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Nome da turma deve ter entre 2 e 10 caracteres'
      });
    }

    // Gerar código único automaticamente
    let codigo = gerarCodigoTurma(nome);
    
    // Verificar se o código já existe e gerar um novo se necessário
    let tentativas = 0;
    while (tentativas < 10) {
      const turmaExistente = await Turma.findOne({ where: { codigo } });
      if (!turmaExistente) {
        break;
      }
      // Adicionar número aleatório se o código já existir
      codigo = gerarCodigoTurma(nome) + Math.floor(Math.random() * 100);
      tentativas++;
    }

    // Criar a turma no banco de dados
    const novaTurma = await Turma.create({
      nome,
      codigo,
      descricao: descricao || null,
      nivel: nivel || null,
      capacidade: capacidade || 30,
      turno: turno || null
    });

    // Vincular a turma ao professor
    await ProfessorTurma.create({
      professor_id: req.user.id,
      turma_id: novaTurma.id
    });

    // Retornar resposta de sucesso
    res.status(201).json({
      success: true,
      message: 'Turma criada com sucesso! Código gerado automaticamente.',
      data: {
        id: novaTurma.id,
        nome: novaTurma.nome,
        codigo: novaTurma.codigo,
        descricao: novaTurma.descricao,
        nivel: novaTurma.nivel,
        capacidade: novaTurma.capacidade,
        turno: novaTurma.turno,
        created_at: novaTurma.created_at
      }
    });

  } catch (error) {
    console.error('Erro na criação da turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para listar turmas do professor
router.get('/', requireProfessor, async (req, res) => {
  try {
    // Buscar todas as turmas vinculadas ao professor
    const professor = await Professor.findByPk(req.user.id, {
      include: [{
        model: Turma,
        as: 'turmas',
        through: {
          attributes: [] // Não incluir dados da tabela de junção
        },
        include: [{
          model: Aluno,
          as: 'alunos',
          through: {
            attributes: []
          }
        }]
      }]
    });

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: 'Professor não encontrado'
      });
    }

    // Processar dados das turmas para incluir total de alunos
    const turmasComTotal = (professor.turmas || []).map(turma => ({
      ...turma.toJSON(),
      total_alunos: turma.alunos ? turma.alunos.length : 0
    }));

    // Retornar resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Turmas listadas com sucesso',
      data: turmasComTotal
    });

  } catch (error) {
    console.error('Erro na listagem das turmas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para adicionar professor à turma
router.post('/:turmaId/professores', requireProfessor, async (req, res) => {
  try {
    const { turmaId } = req.params;
    const { professorEmail } = req.body;

    // Validação dos dados obrigatórios
    if (!professorEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email do professor é obrigatório'
      });
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(professorEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Verificar se a turma existe
    const turma = await Turma.findByPk(turmaId);
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    // Verificar se o professor logado tem acesso à turma
    const professorTurma = await ProfessorTurma.findOne({
      where: {
        professor_id: req.user.id,
        turma_id: turmaId
      }
    });

    if (!professorTurma) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para adicionar professores a esta turma'
      });
    }

    // Buscar o professor pelo email
    const professor = await Professor.findOne({ where: { email: professorEmail } });
    if (!professor) {
      return res.status(404).json({
        success: false,
        message: 'Professor não encontrado'
      });
    }

    // Verificar se o professor já está na turma
    const professorTurmaExistente = await ProfessorTurma.findOne({
      where: {
        professor_id: professor.id,
        turma_id: turmaId
      }
    });

    if (professorTurmaExistente) {
      return res.status(409).json({
        success: false,
        message: 'Professor já está nesta turma'
      });
    }

    // Adicionar professor à turma
    await ProfessorTurma.create({
      professor_id: professor.id,
      turma_id: turmaId
    });

    // Retornar resposta de sucesso
    res.status(201).json({
      success: true,
      message: 'Professor adicionado à turma com sucesso',
      data: {
        professor: {
          id: professor.id,
          nome: professor.nome,
          email: professor.email
        },
        turma: {
          id: turma.id,
          nome: turma.nome,
          codigo: turma.codigo
        }
      }
    });

  } catch (error) {
    console.error('Erro ao adicionar professor à turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para adicionar aluno à turma
router.post('/:turmaId/alunos', requireProfessor, async (req, res) => {
  try {
    const { turmaId } = req.params;
    const { alunoNome } = req.body;

    // Validação dos dados obrigatórios
    if (!alunoNome) {
      return res.status(400).json({
        success: false,
        message: 'Nome do aluno é obrigatório'
      });
    }

    // Verificar se a turma existe
    const turma = await Turma.findByPk(turmaId);
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    // Verificar se o professor tem acesso à turma
    const professorTurma = await ProfessorTurma.findOne({
      where: {
        professor_id: req.user.id,
        turma_id: turmaId
      }
    });

    if (!professorTurma) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para adicionar alunos a esta turma'
      });
    }

    // Buscar o aluno pelo nome
    const aluno = await Aluno.findOne({ where: { nome: alunoNome } });
    if (!aluno) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    // Verificar se o aluno já está na turma
    const alunoTurmaExistente = await AlunoTurma.findOne({
      where: {
        aluno_id: aluno.id,
        turma_id: turmaId
      }
    });

    if (alunoTurmaExistente) {
      return res.status(409).json({
        success: false,
        message: 'Aluno já está nesta turma'
      });
    }

    // Adicionar aluno à turma
    await AlunoTurma.create({
      aluno_id: aluno.id,
      turma_id: turmaId
    });

    // Retornar resposta de sucesso
    res.status(201).json({
      success: true,
      message: 'Aluno adicionado à turma com sucesso',
      data: {
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          idade: aluno.idade
        },
        turma: {
          id: turma.id,
          nome: turma.nome,
          codigo: turma.codigo
        }
      }
    });

  } catch (error) {
    console.error('Erro ao adicionar aluno à turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para listar professores de uma turma
router.get('/:turmaId/professores', requireProfessor, async (req, res) => {
  try {
    const { turmaId } = req.params;

    // Verificar se a turma existe
    const turma = await Turma.findByPk(turmaId);
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    // Verificar se o professor tem acesso à turma
    const professorTurma = await ProfessorTurma.findOne({
      where: {
        professor_id: req.user.id,
        turma_id: turmaId
      }
    });

    if (!professorTurma) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para visualizar os professores desta turma'
      });
    }

    // Buscar todos os professores da turma
    const turmaComProfessores = await Turma.findByPk(turmaId, {
      include: [{
        model: Professor,
        as: 'professores',
        through: {
          attributes: ['created_at']
        }
      }]
    });

    // Retornar resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Professores listados com sucesso',
      data: {
        turma: {
          id: turma.id,
          nome: turma.nome,
          codigo: turma.codigo
        },
        professores: turmaComProfessores.professores || [],
        total: turmaComProfessores.professores ? turmaComProfessores.professores.length : 0
      }
    });

  } catch (error) {
    console.error('Erro na listagem dos professores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para verificar vinculação aluno-professor
router.get('/vinculacoes', requireProfessor, async (req, res) => {
  try {
    // Buscar todas as vinculações do professor logado
    const professor = await Professor.findByPk(req.user.id, {
      include: [{
        model: Turma,
        as: 'turmas',
        include: [{
          model: Aluno,
          as: 'alunos',
          through: {
            attributes: ['data_entrada', 'created_at']
          }
        }]
      }]
    });

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: 'Professor não encontrado'
      });
    }

    // Organizar dados das vinculações
    const vinculacoes = [];
    
    professor.turmas.forEach(turma => {
      turma.alunos.forEach(aluno => {
        vinculacoes.push({
          turma: {
            id: turma.id,
            nome: turma.nome,
            codigo: turma.codigo
          },
          aluno: {
            id: aluno.id,
            nome: aluno.nome,
            email: aluno.email,
            idade: aluno.idade
          },
          professor: {
            id: professor.id,
            nome: professor.nome,
            email: professor.email
          },
          aluno_entrou_em: aluno.alunos_turmas.data_entrada,
          professor_vinculado_em: turma.professores_turmas.created_at
        });
      });
    });

    // Retornar resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Vinculações listadas com sucesso',
      data: {
        professor: {
          id: professor.id,
          nome: professor.nome,
          email: professor.email
        },
        vinculacoes: vinculacoes,
        total: vinculacoes.length
      }
    });

  } catch (error) {
    console.error('Erro na listagem das vinculações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para listar alunos de uma turma
router.get('/:turmaId/alunos', requireProfessor, async (req, res) => {
  try {
    const { turmaId } = req.params;

    // Verificar se a turma existe
    const turma = await Turma.findByPk(turmaId);
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    // Verificar se o professor tem acesso à turma
    const professorTurma = await ProfessorTurma.findOne({
      where: {
        professor_id: req.user.id,
        turma_id: turmaId
      }
    });

    if (!professorTurma) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para visualizar os alunos desta turma'
      });
    }

    // Buscar todos os alunos da turma
    const turmaComAlunos = await Turma.findByPk(turmaId, {
      include: [{
        model: Aluno,
        as: 'alunos',
        through: {
          attributes: ['data_entrada', 'created_at']
        }
      }]
    });

    // Retornar resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Alunos listados com sucesso',
      data: {
        turma: {
          id: turma.id,
          nome: turma.nome,
          codigo: turma.codigo
        },
        alunos: turmaComAlunos.alunos || [],
        total: turmaComAlunos.alunos ? turmaComAlunos.alunos.length : 0
      }
    });

  } catch (error) {
    console.error('Erro na listagem dos alunos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para excluir uma turma
router.delete('/:turmaId', requireProfessor, async (req, res) => {
  try {
    const { turmaId } = req.params;

    // Verificar se a turma existe
    const turma = await Turma.findByPk(turmaId);
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    // Verificar se o professor tem acesso à turma
    const professorTurma = await ProfessorTurma.findOne({
      where: {
        professor_id: req.user.id,
        turma_id: turmaId
      }
    });

    if (!professorTurma) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para excluir esta turma'
      });
    }

    // Excluir todas as vinculações de alunos da turma
    await AlunoTurma.destroy({
      where: { turma_id: turmaId }
    });

    // Excluir todas as vinculações de professores da turma
    await ProfessorTurma.destroy({
      where: { turma_id: turmaId }
    });

    // Excluir a turma
    await turma.destroy();

    // Retornar resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Turma excluída com sucesso',
      data: {
        id: turmaId,
        nome: turma.nome
      }
    });

  } catch (error) {
    console.error('Erro ao excluir turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para buscar alunos sem turma
router.get('/alunos/sem-turma', requireProfessor, async (req, res) => {
  try {
    // Buscar todos os alunos que não estão em nenhuma turma
    // Usar uma abordagem mais simples: buscar alunos que não têm turma definida
    const alunosSemTurma = await Aluno.findAll({
      where: {
        turma: null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Alunos sem turma consultados com sucesso',
      data: alunosSemTurma.map(aluno => ({
        id: aluno.id,
        nome: aluno.nome,
        idade: aluno.idade,
        turma: aluno.turma
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar alunos sem turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para adicionar aluno à turma por ID
router.post('/:turmaId/alunos', requireProfessor, async (req, res) => {
  try {
    const { turmaId } = req.params;
    const { alunoId } = req.body;

    console.log('Tentando adicionar aluno à turma:', { turmaId, alunoId, professorId: req.user.id });

    if (!alunoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do aluno é obrigatório'
      });
    }

    // Verificar se a turma existe e se o professor tem acesso
    const turma = await Turma.findByPk(turmaId);
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    // Verificar se o professor tem acesso à turma
    const professorTurma = await ProfessorTurma.findOne({
      where: {
        professor_id: req.user.id,
        turma_id: turmaId
      }
    });

    if (!professorTurma) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para adicionar alunos a esta turma'
      });
    }

    // Verificar se o aluno existe
    const aluno = await Aluno.findByPk(alunoId);
    if (!aluno) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    // Verificar se o aluno já está na turma
    const alunoTurmaExistente = await AlunoTurma.findOne({
      where: {
        aluno_id: alunoId,
        turma_id: turmaId
      }
    });

    if (alunoTurmaExistente) {
      return res.status(400).json({
        success: false,
        message: 'Aluno já está nesta turma'
      });
    }

    // Adicionar aluno à turma
    await AlunoTurma.create({
      aluno_id: alunoId,
      turma_id: turmaId
    });

    res.status(200).json({
      success: true,
      message: 'Aluno adicionado à turma com sucesso',
      data: {
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          idade: aluno.idade
        },
        turma: {
          id: turma.id,
          nome: turma.nome
        }
      }
    });

  } catch (error) {
    console.error('Erro ao adicionar aluno à turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para remover aluno de todas as turmas
router.delete('/aluno/:alunoId', requireProfessor, async (req, res) => {
  try {
    const { alunoId } = req.params;

    // Verificar se o aluno existe
    const aluno = await Aluno.findByPk(alunoId);
    if (!aluno) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    // Verificar se o professor tem acesso a alguma turma onde o aluno está
    const alunoTurmas = await AlunoTurma.findAll({
      where: { aluno_id: alunoId },
      include: [{
        model: Turma,
        include: [{
          model: Professor,
          where: { id: req.user.id },
          through: { attributes: [] }
        }]
      }]
    });

    if (alunoTurmas.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para remover este aluno'
      });
    }

    // Remover aluno de todas as turmas do professor
    await AlunoTurma.destroy({
      where: {
        aluno_id: alunoId,
        turma_id: alunoTurmas.map(at => at.turma_id)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Aluno removido da turma com sucesso',
      data: {
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          idade: aluno.idade
        }
      }
    });

  } catch (error) {
    console.error('Erro ao remover aluno da turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
