const express = require('express');
const { ProgressoJogo, Aluno, sequelize } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Iniciar sessão de jogo
router.post('/iniciar', authenticateToken, async (req, res) => {
  try {
    const { fase_id = 1, nivel_dificuldade = 1 } = req.body;
    const aluno_id = req.user.id;

    // Verificar se já existe uma sessão ativa
    const sessaoAtiva = await ProgressoJogo.findOne({
      where: {
        aluno_id,
        status: 'em_andamento'
      }
    });

    if (sessaoAtiva) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma sessão de jogo ativa. Finalize a sessão atual antes de iniciar uma nova.'
      });
    }

    // Criar nova sessão de jogo
    const novaSessao = await ProgressoJogo.create({
      aluno_id,
      fase_id,
      nivel_dificuldade,
      status: 'em_andamento',
      data_inicio: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Sessão de jogo iniciada com sucesso',
      data: {
        sessao_id: novaSessao.id,
        fase_id: novaSessao.fase_id,
        nivel_dificuldade: novaSessao.nivel_dificuldade,
        data_inicio: novaSessao.data_inicio
      }
    });
  } catch (error) {
    console.error('Erro ao iniciar sessão de jogo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Registrar resposta do jogo
router.post('/resposta', authenticateToken, async (req, res) => {
  try {
    const { sessao_id, pergunta_id, resposta, correta, tempo_resposta, operacao } = req.body;
    const aluno_id = req.user.id;

    // Buscar sessão ativa
    const sessao = await ProgressoJogo.findOne({
      where: {
        id: sessao_id,
        aluno_id,
        status: 'em_andamento'
      }
    });

    if (!sessao) {
      return res.status(404).json({
        success: false,
        message: 'Sessão de jogo não encontrada ou não está ativa'
      });
    }

    // Atualizar estatísticas
    const updates = {};
    
    if (correta) {
      updates.acertos = sessao.acertos + 1;
    } else {
      updates.erros = sessao.erros + 1;
    }

    // Atualizar tempo total
    updates.tempo_total = parseFloat(sessao.tempo_total) + parseFloat(tempo_resposta || 0);

    // Atualizar tentativas por pergunta
    let tentativas = sessao.tentativas_por_pergunta || [];
    tentativas.push({
      pergunta_id,
      correta,
      tempo_resposta,
      operacao
    });
    updates.tentativas_por_pergunta = tentativas;

    // Atualizar operações usadas
    let operacoes = sessao.operacoes_usadas || { '+': 0, '-': 0, '*': 0, '/': 0 };
    if (operacao && operacoes.hasOwnProperty(operacao)) {
      operacoes[operacao]++;
    }
    updates.operacoes_usadas = operacoes;

    // Calcular tempo médio por pergunta
    const totalPerguntas = updates.acertos + updates.erros;
    if (totalPerguntas > 0) {
      updates.tempo_por_pergunta = updates.tempo_total / totalPerguntas;
    }

    // Calcular pontuação
    const taxaAcerto = updates.acertos / totalPerguntas;
    const bonusTempo = updates.tempo_por_pergunta < 10 ? 50 : 0; // Bonus por resposta rápida
    updates.pontuacao = Math.round((taxaAcerto * 100) + bonusTempo);

    // Atualizar sessão
    await sessao.update(updates);

    res.status(200).json({
      success: true,
      message: 'Resposta registrada com sucesso',
      data: {
        acertos: updates.acertos,
        erros: updates.erros,
        pontuacao: updates.pontuacao,
        tempo_por_pergunta: updates.tempo_por_pergunta
      }
    });
  } catch (error) {
    console.error('Erro ao registrar resposta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Finalizar sessão de jogo
router.post('/finalizar', authenticateToken, async (req, res) => {
  try {
    const { sessao_id } = req.body;
    const aluno_id = req.user.id;

    // Buscar sessão ativa
    const sessao = await ProgressoJogo.findOne({
      where: {
        id: sessao_id,
        aluno_id,
        status: 'em_andamento'
      }
    });

    if (!sessao) {
      return res.status(404).json({
        success: false,
        message: 'Sessão de jogo não encontrada ou não está ativa'
      });
    }

    // Calcular medalha baseada no desempenho
    const totalPerguntas = sessao.acertos + sessao.erros;
    const taxaAcerto = totalPerguntas > 0 ? sessao.acertos / totalPerguntas : 0;
    const tempoMedio = sessao.tempo_por_pergunta || 0;

    let medalha = null;
    if (taxaAcerto >= 0.9 && tempoMedio <= 5) {
      medalha = 'diamante';
    } else if (taxaAcerto >= 0.8 && tempoMedio <= 8) {
      medalha = 'ouro';
    } else if (taxaAcerto >= 0.7 && tempoMedio <= 12) {
      medalha = 'prata';
    } else if (taxaAcerto >= 0.5) {
      medalha = 'bronze';
    }

    // Atualizar sessão
    await sessao.update({
      status: 'concluido',
      data_fim: new Date(),
      medalha
    });

    res.status(200).json({
      success: true,
      message: 'Sessão de jogo finalizada com sucesso',
      data: {
        acertos: sessao.acertos,
        erros: sessao.erros,
        pontuacao: sessao.pontuacao,
        medalha,
        tempo_total: sessao.tempo_total,
        taxa_acerto: taxaAcerto
      }
    });
  } catch (error) {
    console.error('Erro ao finalizar sessão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Obter histórico de progresso do aluno
router.get('/historico', authenticateToken, async (req, res) => {
  try {
    const aluno_id = req.user.id;
    const { limite = 10, pagina = 1 } = req.query;

    const offset = (pagina - 1) * limite;

    const historico = await ProgressoJogo.findAndCountAll({
      where: { aluno_id },
      order: [['data_inicio', 'DESC']],
      limit: parseInt(limite),
      offset: parseInt(offset),
      include: [{
        model: Aluno,
        as: 'aluno',
        attributes: ['nome', 'turma']
      }]
    });

    // Calcular estatísticas gerais
    const estatisticas = await ProgressoJogo.findAll({
      where: { aluno_id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_sessoes'],
        [sequelize.fn('SUM', sequelize.col('acertos')), 'total_acertos'],
        [sequelize.fn('SUM', sequelize.col('erros')), 'total_erros'],
        [sequelize.fn('AVG', sequelize.col('pontuacao')), 'pontuacao_media'],
        [sequelize.fn('AVG', sequelize.col('tempo_por_pergunta')), 'tempo_medio']
      ],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        historico: historico.rows,
        total: historico.count,
        paginacao: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total_paginas: Math.ceil(historico.count / limite)
        },
        estatisticas: estatisticas[0]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Obter ranking de alunos
router.get('/ranking', authenticateToken, async (req, res) => {
  try {
    const { periodo = '30' } = req.query; // dias
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - parseInt(periodo));

    const ranking = await ProgressoJogo.findAll({
      where: {
        status: 'concluido',
        data_fim: {
          [sequelize.Op.gte]: dataLimite
        }
      },
      attributes: [
        'aluno_id',
        [sequelize.fn('AVG', sequelize.col('pontuacao')), 'pontuacao_media'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_sessoes'],
        [sequelize.fn('SUM', sequelize.col('acertos')), 'total_acertos'],
        [sequelize.fn('SUM', sequelize.col('erros')), 'total_erros']
      ],
      include: [{
        model: Aluno,
        as: 'aluno',
        attributes: ['nome', 'turma']
      }],
      group: ['aluno_id'],
      order: [[sequelize.literal('pontuacao_media'), 'DESC']],
      limit: 20
    });

    res.status(200).json({
      success: true,
      data: {
        ranking,
        periodo: `${periodo} dias`
      }
    });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
