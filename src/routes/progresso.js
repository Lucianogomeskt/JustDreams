const express = require('express');
const { Progresso, ProgressoJogo, Aluno, Turma, ProfessorTurma, AlunoTurma } = require('../models');
const { authenticateToken, requireProfessorOrSelf } = require('../middleware/auth');
const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rota para consultar progresso do aluno
router.get('/:alunoId', requireProfessorOrSelf, async (req, res) => {
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

    // Se for um professor, verificar se ele tem acesso ao aluno através de alguma turma
    if (req.user.tipo === 'professor') {
      const professorTemAcesso = await ProfessorTurma.findOne({
        where: {
          professor_id: req.user.id
        },
        include: [{
          model: Turma,
          as: 'turmas',
          include: [{
            model: Aluno,
            as: 'alunos',
            where: { id: alunoId }
          }]
        }]
      });

      if (!professorTemAcesso) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para visualizar o progresso deste aluno'
        });
      }
    }

    // Buscar todos os progressos do aluno
    const progressos = await Progresso.findAll({
      where: { aluno_id: alunoId },
      include: [{
        model: Turma,
        as: 'turma',
        attributes: ['id', 'nome', 'codigo']
      }]
    });

    // Calcular progresso geral
    let progressoGeral = 0;
    let totalAtividades = 0;
    let atividadesConcluidas = 0;

    if (progressos.length > 0) {
      progressos.forEach(progresso => {
        totalAtividades += progresso.total_atividades || 0;
        atividadesConcluidas += progresso.atividades_concluidas || 0;
      });

      if (totalAtividades > 0) {
        progressoGeral = Math.round((atividadesConcluidas / totalAtividades) * 100);
      }
    }

    // Retornar resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Progresso consultado com sucesso',
      data: {
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          idade: aluno.idade
        },
        progresso_geral: {
          porcentagem: progressoGeral,
          atividades_concluidas: atividadesConcluidas,
          total_atividades: totalAtividades
        },
        progresso_por_turma: progressos.map(progresso => ({
          turma: {
            id: progresso.turma.id,
            nome: progresso.turma.nome,
            codigo: progresso.turma.codigo
          },
          porcentagem: progresso.conclusao,
          atividades_concluidas: progresso.atividades_concluidas,
          total_atividades: progresso.total_atividades,
          ultima_atividade: progresso.ultima_atividade
        }))
      }
    });

  } catch (error) {
    console.error('Erro na consulta do progresso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para listar progresso de todos os alunos de uma turma
router.get('/turma/:turmaId', async (req, res) => {
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

    // Se for um professor, verificar se ele tem acesso à turma
    if (req.user.tipo === 'professor') {
      const professorTemAcesso = await ProfessorTurma.findOne({
        where: {
          professor_id: req.user.id,
          turma_id: turmaId
        }
      });

      if (!professorTemAcesso) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para visualizar esta turma'
        });
      }
    }

    // Usar a variável turma já declarada acima

    const alunos = await Aluno.findAll({
      where: { turma: turma.nome }
    });

    // Buscar progresso de cada aluno
    const progressoAlunos = await Promise.all(
      alunos.map(async (aluno) => {
        // Buscar progresso geral do aluno
        const progressos = await Progresso.findAll({
          where: { aluno_id: aluno.id }
        });

        // Buscar progresso do jogo do aluno
        const progressoJogo = await ProgressoJogo.findAll({
          where: { aluno_id: aluno.id },
          order: [['data_inicio', 'DESC']]
        });

        // Calcular estatísticas
        let progressoGeral = 0;
        let totalAtividades = 0;
        let atividadesConcluidas = 0;

        if (progressos.length > 0) {
          progressos.forEach(progresso => {
            totalAtividades += progresso.total_atividades || 0;
            atividadesConcluidas += progresso.atividades_concluidas || 0;
          });

          if (totalAtividades > 0) {
            progressoGeral = Math.round((atividadesConcluidas / totalAtividades) * 100);
          }
        }

        // Calcular estatísticas do jogo
        const totalSessoes = progressoJogo.length;
        const sessoesConcluidas = progressoJogo.filter(p => p.status === 'concluido').length;
        const totalAcertos = progressoJogo.reduce((acc, p) => acc + p.acertos, 0);
        const totalErros = progressoJogo.reduce((acc, p) => acc + p.erros, 0);
        const pontuacaoMedia = totalSessoes > 0 ? 
          Math.round(progressoJogo.reduce((acc, p) => acc + p.pontuacao, 0) / totalSessoes) : 0;
        const tempoMedio = totalSessoes > 0 ?
          Math.round(progressoJogo.reduce((acc, p) => acc + (p.tempo_por_pergunta || 0), 0) / totalSessoes) : 0;

        // Se não há progresso geral de atividades, usar progresso do jogo
        if (progressoGeral === 0 && totalSessoes > 0) {
          progressoGeral = Math.round((sessoesConcluidas / totalSessoes) * 100);
        }

        // Última sessão
        const ultimaSessao = progressoJogo[0];
        const ultimoJogo = ultimaSessao ? ultimaSessao.data_inicio : null;

        // Determinar medalha baseada na pontuação média
        let medalha = null;
        if (pontuacaoMedia >= 90) {
          medalha = 'diamante';
        } else if (pontuacaoMedia >= 80) {
          medalha = 'ouro';
        } else if (pontuacaoMedia >= 70) {
          medalha = 'prata';
        } else if (pontuacaoMedia >= 50) {
          medalha = 'bronze';
        }

        return {
          id: aluno.id,
          nome: aluno.nome,
          idade: aluno.idade,
          turma: aluno.turma,
          progresso: progressoGeral,
          acertos: totalAcertos,
          erros: totalErros,
          tempo_medio: tempoMedio,
          medalha: medalha,
          ultimo_jogo: ultimoJogo,
          total_sessoes: totalSessoes,
          sessoes_concluidas: sessoesConcluidas,
          pontuacao_media: pontuacaoMedia
        };
      })
    );

    // Calcular estatísticas gerais da turma
    const totalAlunos = progressoAlunos.length;
    const alunosAtivos = progressoAlunos.filter(a => a.ultimo_jogo).length;
    const progressoMedio = totalAlunos > 0 ? 
      Math.round(progressoAlunos.reduce((acc, a) => acc + a.progresso, 0) / totalAlunos) : 0;
    const totalJogos = progressoAlunos.reduce((acc, a) => acc + a.acertos + a.erros, 0);

    res.status(200).json({
      success: true,
      message: 'Progresso da turma consultado com sucesso',
      data: {
        turma: {
          id: turma.id,
          nome: turma.nome,
          codigo: turma.codigo
        },
        estatisticas_gerais: {
          total_alunos: totalAlunos,
          alunos_ativos: alunosAtivos,
          progresso_medio: progressoMedio,
          total_jogos: totalJogos
        },
        alunos: progressoAlunos
      }
    });

  } catch (error) {
    console.error('Erro na consulta do progresso da turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para listar progresso de todos os alunos do professor
router.get('/professor/alunos', async (req, res) => {
  try {
    // Se for um professor, buscar todos os alunos
    if (req.user.tipo !== 'professor') {
      return res.status(403).json({
        success: false,
        message: 'Apenas professores podem acessar esta rota'
      });
    }

    // Buscar todos os alunos
    const alunos = await Aluno.findAll();

    // Buscar progresso de cada aluno
    const progressoAlunos = await Promise.all(
      alunos.map(async (aluno) => {
        // Buscar progresso geral do aluno
        const progressos = await Progresso.findAll({
          where: { aluno_id: aluno.id }
        });

        // Buscar progresso do jogo do aluno
        const progressoJogo = await ProgressoJogo.findAll({
          where: { aluno_id: aluno.id },
          order: [['data_inicio', 'DESC']]
        });

        // Calcular estatísticas
        let progressoGeral = 0;
        let totalAtividades = 0;
        let atividadesConcluidas = 0;

        if (progressos.length > 0) {
          progressos.forEach(progresso => {
            totalAtividades += progresso.total_atividades || 0;
            atividadesConcluidas += progresso.atividades_concluidas || 0;
          });

          if (totalAtividades > 0) {
            progressoGeral = Math.round((atividadesConcluidas / totalAtividades) * 100);
          }
        }

        // Calcular estatísticas do jogo
        const totalSessoes = progressoJogo.length;
        const sessoesConcluidas = progressoJogo.filter(p => p.status === 'concluido').length;
        const totalAcertos = progressoJogo.reduce((acc, p) => acc + p.acertos, 0);
        const totalErros = progressoJogo.reduce((acc, p) => acc + p.erros, 0);
        const pontuacaoMedia = totalSessoes > 0 ? 
          Math.round(progressoJogo.reduce((acc, p) => acc + p.pontuacao, 0) / totalSessoes) : 0;
        const tempoMedio = totalSessoes > 0 ?
          Math.round(progressoJogo.reduce((acc, p) => acc + (p.tempo_por_pergunta || 0), 0) / totalSessoes) : 0;

        // Se não há progresso geral de atividades, usar progresso do jogo
        if (progressoGeral === 0 && totalSessoes > 0) {
          progressoGeral = Math.round((sessoesConcluidas / totalSessoes) * 100);
        }

        // Última sessão
        const ultimaSessao = progressoJogo[0];
        const ultimoJogo = ultimaSessao ? ultimaSessao.data_inicio : null;

        // Determinar medalha baseada na pontuação média
        let medalha = null;
        if (pontuacaoMedia >= 90) {
          medalha = 'diamante';
        } else if (pontuacaoMedia >= 80) {
          medalha = 'ouro';
        } else if (pontuacaoMedia >= 70) {
          medalha = 'prata';
        } else if (pontuacaoMedia >= 50) {
          medalha = 'bronze';
        }

        return {
          id: aluno.id,
          nome: aluno.nome,
          idade: aluno.idade,
          turma: aluno.turma,
          progresso: progressoGeral,
          acertos: totalAcertos,
          erros: totalErros,
          tempo_medio: tempoMedio,
          medalha: medalha,
          ultimo_jogo: ultimoJogo,
          total_sessoes: totalSessoes,
          sessoes_concluidas: sessoesConcluidas,
          pontuacao_media: pontuacaoMedia
        };
      })
    );

    // Calcular estatísticas gerais
    const totalAlunos = progressoAlunos.length;
    const alunosAtivos = progressoAlunos.filter(a => a.ultimo_jogo).length;
    const progressoMedio = totalAlunos > 0 ? 
      Math.round(progressoAlunos.reduce((acc, a) => acc + a.progresso, 0) / totalAlunos) : 0;
    const totalJogos = progressoAlunos.reduce((acc, a) => acc + a.acertos + a.erros, 0);

    res.status(200).json({
      success: true,
      message: 'Progresso de todos os alunos consultado com sucesso',
      data: {
        estatisticas_gerais: {
          total_alunos: totalAlunos,
          alunos_ativos: alunosAtivos,
          progresso_medio: progressoMedio,
          total_jogos: totalJogos
        },
        alunos: progressoAlunos
      }
    });

  } catch (error) {
    console.error('Erro na consulta do progresso de todos os alunos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;



