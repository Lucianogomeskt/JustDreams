const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Aluno, Amizade } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Sanity check para verificar se o router de amizades está montado
router.get('/_ping', (req, res) => {
    return res.json({ ok: true, rota: '/api/amizades/_ping' });
});

// Rota para buscar aluno por ID e verificar status da amizade
router.get('/alunoid/:id', authenticateToken, async (req, res) => {
    try {
        const alunoId = req.user.id; // ID do aluno logado
        const alunoParaAdicionar = await Aluno.findByPk(req.params.id, {
            attributes: ['id', 'nome', 'turma']
        });

        if (!alunoParaAdicionar) {
            return res.status(404).json({ 
                encontrado: false,
                mensagem: 'Aluno não encontrado' 
            });
        }

        // Verifica se já existe uma amizade
        const amizadeExistente = await Amizade.findOne({
            where: {
                [Op.or]: [
                    { alunoId, amigoId: alunoParaAdicionar.id },
                    { alunoId: alunoParaAdicionar.id, amigoId: alunoId }
                ]
            }
        });

        // Não permite adicionar a si mesmo
        if (alunoId === alunoParaAdicionar.id) {
            return res.json({
                encontrado: true,
                aluno: alunoParaAdicionar,
                podeAdicionar: false,
                mensagem: 'Você não pode adicionar a si mesmo como amigo'
            });
        }

        res.json({
            encontrado: true,
            aluno: alunoParaAdicionar,
            podeAdicionar: !amizadeExistente,
            statusAmizade: amizadeExistente ? amizadeExistente.status : null,
            mensagem: amizadeExistente ? 
                `Vocês já são amigos ou existe uma solicitação ${amizadeExistente.status}` : 
                'Aluno encontrado! Você pode adicionar como amigo.'
        });
    } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        res.status(500).json({ 
            encontrado: false,
            mensagem: 'Erro ao buscar aluno',
            erro: error.message 
        });
    }
});

// Rota para pesquisar alunos
router.get('/pesquisa', authenticateToken, async (req, res) => {
    try {
        const { termo } = req.query;
        const alunos = await Aluno.findAll({
            where: {
                nome: {
                    [Op.like]: `%${termo}%`
                }
            },
            attributes: ['id', 'nome', 'turma'],
            limit: 10
        });

        res.json(alunos);
    } catch (error) {
        console.error('Erro ao pesquisar alunos:', error);
        res.status(500).json({ mensagem: 'Erro ao pesquisar alunos' });
    }
});

// Rota para adicionar amigo
router.post('/adicionar', authenticateToken, async (req, res) => {
    try {
        const { amigoId } = req.body;
        const alunoId = req.user.id; // ID do aluno logado

        // Verifica se o amigo existe
        const amigo = await Aluno.findByPk(amigoId);
        if (!amigo) {
            return res.status(404).json({ mensagem: 'Aluno não encontrado' });
        }

        // Verifica se está tentando adicionar a si mesmo
        if (alunoId === amigoId) {
            return res.status(400).json({ mensagem: 'Você não pode adicionar a si mesmo como amigo' });
        }

        // Verifica se já existe uma amizade
        const amizadeExistente = await Amizade.findOne({
            where: {
                [Op.or]: [
                    { alunoId, amigoId },
                    { alunoId: amigoId, amigoId: alunoId }
                ]
            }
        });

        if (amizadeExistente) {
            return res.status(400).json({ mensagem: 'Solicitação de amizade já existe' });
        }

        // Cria nova amizade
        const amizade = await Amizade.create({
            alunoId,
            amigoId,
            status: 'pendente'
        });

        res.status(201).json({
            mensagem: 'Solicitação de amizade enviada com sucesso',
            amizade
        });
    } catch (error) {
        console.error('Erro ao adicionar amigo:', error);
        res.status(500).json({ mensagem: 'Erro ao adicionar amigo' });
    }
});

// Rota para buscar meus amigos
router.get('/meus-amigos', authenticateToken, async (req, res) => {
    try {
        const alunoId = req.user.id;

        const amigos = await Amizade.findAll({
            where: {
                [Op.or]: [
                    { alunoId, status: 'aceito' },
                    { amigoId: alunoId, status: 'aceito' }
                ]
            },
            include: [
                {
                    model: Aluno,
                    as: 'aluno',
                    attributes: ['id', 'nome', 'turma']
                },
                {
                    model: Aluno,
                    as: 'amigo',
                    attributes: ['id', 'nome', 'turma']
                }
            ]
        });

        // Mapear os amigos para retornar apenas os dados do amigo (não do usuário logado)
        const listaAmigos = amigos.map(amizade => {
            const amigo = amizade.alunoId === alunoId ? amizade.amigo : amizade.aluno;
            return {
                id: amigo.id,
                nome: amigo.nome,
                turma: amigo.turma
            };
        });

        res.json(listaAmigos);
    } catch (error) {
        console.error('Erro ao buscar amigos:', error);
        res.status(500).json({ mensagem: 'Erro ao buscar amigos' });
    }
});

// Rota para buscar solicitações pendentes
router.get('/solicitacoes-pendentes', authenticateToken, async (req, res) => {
    try {
        const alunoId = req.user.id;

        const solicitacoes = await Amizade.findAll({
            where: {
                amigoId: alunoId,
                status: 'pendente'
            },
            include: [
                {
                    model: Aluno,
                    as: 'aluno',
                    attributes: ['id', 'nome', 'turma']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const listaSolicitacoes = solicitacoes.map(solicitacao => ({
            id: solicitacao.id,
            remetente: solicitacao.aluno,
            dataEnvio: solicitacao.createdAt
        }));

        res.json(listaSolicitacoes);
    } catch (error) {
        console.error('Erro ao buscar solicitações pendentes:', error);
        res.status(500).json({ mensagem: 'Erro ao buscar solicitações pendentes' });
    }
});

// Rota para aceitar/recusar amizade
router.put('/responder/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { resposta } = req.body; // 'aceitar' ou 'recusar'
        const alunoId = req.user.id;

        const amizade = await Amizade.findOne({
            where: {
                id,
                amigoId: alunoId,
                status: 'pendente'
            }
        });

        if (!amizade) {
            return res.status(404).json({ mensagem: 'Solicitação de amizade não encontrada' });
        }

        amizade.status = resposta === 'aceitar' ? 'aceito' : 'recusado';
        await amizade.save();

        res.json({ mensagem: `Solicitação de amizade ${resposta === 'aceitar' ? 'aceita' : 'recusada'}` });
    } catch (error) {
        console.error('Erro ao responder solicitação de amizade:', error);
        res.status(500).json({ mensagem: 'Erro ao responder solicitação de amizade' });
    }
});

// Rota para remover amigo
router.delete('/remover/:amigoId', authenticateToken, async (req, res) => {
    try {
        const { amigoId } = req.params;
        const alunoId = req.user.id;

        const amizade = await Amizade.findOne({
            where: {
                [Op.or]: [
                    { alunoId, amigoId },
                    { alunoId: amigoId, amigoId: alunoId }
                ],
                status: 'aceito'
            }
        });

        if (!amizade) {
            return res.status(404).json({ mensagem: 'Amizade não encontrada' });
        }

        await amizade.destroy();

        res.json({ mensagem: 'Amigo removido com sucesso' });
    } catch (error) {
        console.error('Erro ao remover amigo:', error);
        res.status(500).json({ mensagem: 'Erro ao remover amigo' });
    }
});

module.exports = router;