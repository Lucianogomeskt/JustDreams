 // Definir habilidades da árvore
        const habilidades = {
            // Nível 1 - Raiz
            'raiz': {
                nome: 'Iniciante',
                icon: '🌱',
                nivel: 1,
                requisitos: [],
                xp: 0
            },
            // Nível 2 - Primeiras folhas
            'adicao': {
                nome: 'Adição',
                icon: '➕',
                nivel: 2,
                requisitos: ['raiz'],
                xp: 50
            },
            'subtracao': {
                nome: 'Subtração',
                icon: '➖',
                nivel: 2,
                requisitos: ['raiz'],
                xp: 50
            },
            // Nível 3 - Ramos
            'multiplicacao': {
                nome: 'Multiplicação',
                icon: '✖️',
                nivel: 3,
                requisitos: ['adicao', 'subtracao'],
                xp: 100
            },
            'divisao': {
                nome: 'Divisão',
                icon: '➗',
                nivel: 3,
                requisitos: ['adicao', 'subtracao'],
                xp: 100
            },
            // Nível 4 - Galhos
            'fracoes': {
                nome: 'Frações',
                icon: '🔢',
                nivel: 4,
                requisitos: ['multiplicacao', 'divisao'],
                xp: 200
            },
            'decimais': {
                nome: 'Decimais',
                icon: '📊',
                nivel: 4,
                requisitos: ['multiplicacao', 'divisao'],
                xp: 200
            },
            // Nível 5 - Folhas
            'geometria': {
                nome: 'Geometria',
                icon: '📐',
                nivel: 5,
                requisitos: ['fracoes', 'decimais'],
                xp: 300
            },
            'algebra': {
                nome: 'Álgebra',
                icon: '📈',
                nivel: 5,
                requisitos: ['fracoes', 'decimais'],
                xp: 300
            },
            // Nível 6 - Copa
            'mestre': {
                nome: 'Mestre',
                icon: '👑',
                nivel: 6,
                requisitos: ['geometria', 'algebra'],
                xp: 500
            }
        };

        let progressoData = null;

        document.addEventListener('DOMContentLoaded', async () => {
            // Verificar se o usuário está logado (com BYPASS)
            const urlParams = new URLSearchParams(window.location.search);
            const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
            const token = localStorage.getItem('token');
            let user = JSON.parse(localStorage.getItem('user') || '{}');
            
            if ((!token || user.tipo !== 'aluno') && !bypassEnabled) {
                alert('Você precisa estar logado como aluno!');
                window.location.href = 'aluno_login.html';
                return;
            }
            if (bypassEnabled && (!user || !user.id)) {
                user = { id: 0, nome: 'Dev Bypass', tipo: 'aluno' };
                localStorage.setItem('user', JSON.stringify(user));
            }

            // Exibir informações do usuário
            document.getElementById('user-info').textContent = `👤 ${user.nome}`;

            try {
                await carregarProgresso();
                await gerarArvore();
            } catch (error) {
                console.error('Erro ao carregar árvore:', error);
                mostrarErro('Erro ao carregar sua árvore de habilidades. Tente novamente.');
            }
        });

        async function carregarProgresso() {
            const token = localStorage.getItem('token');
            const urlParams = new URLSearchParams(window.location.search);
            const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
            if (bypassEnabled) {
                progressoData = {
                    estatisticas: {
                        total_acertos: 50,
                        total_erros: 10,
                        total_sessoes: 8
                    }
                };
                return;
            }
            
            const response = await fetch('http://localhost:3000/api/progresso-jogo/historico', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                progressoData = data.data;
                calcularHabilidades();
            } else {
                throw new Error(data.message);
            }
        }

        function calcularHabilidades() {
            const stats = progressoData.estatisticas;
            const totalAcertos = stats.total_acertos || 0;
            const totalErros = stats.total_erros || 0;
            const totalPerguntas = totalAcertos + totalErros;
            const taxaAcerto = totalPerguntas > 0 ? (totalAcertos / totalPerguntas) * 100 : 0;
            const totalSessoes = stats.total_sessoes || 0;

            // Calcular XP baseado no progresso
            let xpTotal = 0;
            let habilidadesDesbloqueadas = 0;
            let nivelAtual = 1;

            // XP por acertos
            xpTotal += totalAcertos * 10;
            
            // XP por sessões completadas
            xpTotal += totalSessoes * 25;
            
            // XP por taxa de acerto
            if (taxaAcerto >= 50) xpTotal += 100;
            if (taxaAcerto >= 70) xpTotal += 150;
            if (taxaAcerto >= 80) xpTotal += 200;
            if (taxaAcerto >= 90) xpTotal += 300;

            // Determinar nível baseado no XP
            if (xpTotal >= 500) nivelAtual = 6;
            else if (xpTotal >= 300) nivelAtual = 5;
            else if (xpTotal >= 200) nivelAtual = 4;
            else if (xpTotal >= 100) nivelAtual = 3;
            else if (xpTotal >= 50) nivelAtual = 2;

            // Determinar habilidades desbloqueadas
            Object.keys(habilidades).forEach(habilidadeId => {
                const habilidade = habilidades[habilidadeId];
                if (xpTotal >= habilidade.xp) {
                    habilidadesDesbloqueadas++;
                }
            });

            // Atualizar interface
            document.getElementById('total-habilidades').textContent = habilidadesDesbloqueadas;
            document.getElementById('nivel-atual').textContent = nivelAtual;
            document.getElementById('pontos-experiencia').textContent = xpTotal;

            // Calcular progresso para próximo nível
            const niveis = [0, 50, 100, 200, 300, 500];
            const proximoNivel = niveis[nivelAtual] || 1000;
            const xpAtualNivel = niveis[nivelAtual - 1] || 0;
            const xpNecessario = proximoNivel - xpAtualNivel;
            const xpProgresso = xpTotal - xpAtualNivel;
            const percentualProgresso = Math.min((xpProgresso / xpNecessario) * 100, 100);

            document.getElementById('proximo-nivel').textContent = proximoNivel;
            document.getElementById('progress-fill').style.width = percentualProgresso + '%';
            document.getElementById('progress-text').textContent = `${xpProgresso} / ${xpNecessario} XP`;

            // Armazenar dados para a árvore
            window.habilidadesData = {
                xpTotal,
                nivelAtual,
                taxaAcerto,
                totalSessoes,
                totalAcertos
            };
        }

        async function gerarArvore() {
            const container = document.getElementById('skill-tree');
            container.innerHTML = '';

            // Organizar habilidades por nível
            const habilidadesPorNivel = {};
            Object.keys(habilidades).forEach(id => {
                const nivel = habilidades[id].nivel;
                if (!habilidadesPorNivel[nivel]) {
                    habilidadesPorNivel[nivel] = [];
                }
                habilidadesPorNivel[nivel].push({ id, ...habilidades[id] });
            });

            // Gerar árvore
            Object.keys(habilidadesPorNivel).sort((a, b) => a - b).forEach(nivel => {
                const row = document.createElement('div');
                row.className = 'skill-row';
                
                habilidadesPorNivel[nivel].forEach(habilidade => {
                    const node = criarNoHabilidade(habilidade);
                    row.appendChild(node);
                });
                
                container.appendChild(row);
            });

            // Adicionar linhas de conexão
            adicionarLinhasConexao();

            // Ocultar loading e mostrar conteúdo
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';
            
            // Verificar se todas as habilidades já estão masterizadas
            verificarConclusaoArvore();
        }

        function criarNoHabilidade(habilidade) {
            const node = document.createElement('div');
            node.className = 'skill-node';
            node.id = `skill-${habilidade.id}`;

            const status = determinarStatusHabilidade(habilidade);
            node.classList.add(status);

            node.innerHTML = `
                <div class="skill-icon">${habilidade.icon}</div>
                <div class="skill-name">${habilidade.nome}</div>
                ${status === 'unlocked' || status === 'mastered' ? 
                    `<div class="skill-level">${habilidade.nivel}</div>` : ''}
            `;

            // Adicionar tooltip
            node.title = `${habilidade.nome} - Nível ${habilidade.nivel}\nXP necessário: ${habilidade.xp}`;

            // Adicionar evento de clique
            node.addEventListener('click', () => {
                mostrarDetalhesHabilidade(habilidade, status);
            });

            return node;
        }

        function determinarStatusHabilidade(habilidade) {
            const data = window.habilidadesData;
            if (!data) return 'locked';

            if (data.xpTotal >= habilidade.xp) {
                // Verificar se é masterizado (taxa de acerto alta + muitas sessões)
                if (data.taxaAcerto >= 80 && data.totalSessoes >= 5) {
                    return 'mastered';
                }
                return 'unlocked';
            }
            return 'locked';
        }

        function adicionarLinhasConexao() {
            const container = document.getElementById('skill-tree');
            
            Object.keys(habilidades).forEach(habilidadeId => {
                const habilidade = habilidades[habilidadeId];
                const node = document.getElementById(`skill-${habilidadeId}`);
                
                if (!node) return;

                habilidade.requisitos.forEach(requisitoId => {
                    const requisitoNode = document.getElementById(`skill-${requisitoId}`);
                    if (requisitoNode) {
                        criarLinhaConexao(requisitoNode, node);
                    }
                });
            });
        }

        function criarLinhaConexao(fromNode, toNode) {
            const container = document.getElementById('skill-tree');
            const line = document.createElement('div');
            line.className = 'connection-line';

            const fromRect = fromNode.getBoundingClientRect();
            const toRect = toNode.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
            const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
            const toX = toRect.left + toRect.width / 2 - containerRect.left;
            const toY = toRect.top + toRect.height / 2 - containerRect.top;

            // Determinar se é linha horizontal ou vertical
            if (Math.abs(fromY - toY) < 50) {
                // Linha horizontal
                line.classList.add('horizontal');
                line.style.left = Math.min(fromX, toX) + 'px';
                line.style.top = fromY + 'px';
                line.style.width = Math.abs(toX - fromX) + 'px';
            } else {
                // Linha vertical
                line.classList.add('vertical');
                line.style.left = fromX + 'px';
                line.style.top = Math.min(fromY, toY) + 'px';
                line.style.height = Math.abs(toY - fromY) + 'px';
            }

            // Determinar status da linha
            const fromStatus = fromNode.classList.contains('unlocked') || fromNode.classList.contains('mastered');
            const toStatus = toNode.classList.contains('unlocked') || toNode.classList.contains('mastered');
            
            if (fromStatus && toStatus) {
                line.classList.add('unlocked');
            } else {
                line.classList.add('locked');
            }

            container.appendChild(line);
        }

        function mostrarDetalhesHabilidade(habilidade, status) {
            const data = window.habilidadesData;
            let mensagem = `🌳 ${habilidade.nome}\n\n`;
            mensagem += `📊 Nível: ${habilidade.nivel}\n`;
            mensagem += `⭐ XP Necessário: ${habilidade.xp}\n`;
            mensagem += `🎯 Status: `;

            switch (status) {
                case 'mastered':
                    mensagem += 'MASTERIZADO! 🏆\n\n';
                    mensagem += `✨ Parabéns! Você dominou completamente esta habilidade!\n`;
                    mensagem += `📈 Taxa de acerto: ${data.taxaAcerto.toFixed(1)}%\n`;
                    mensagem += `🎮 Sessões jogadas: ${data.totalSessoes}`;
                    break;
                case 'unlocked':
                    mensagem += 'DESBLOQUEADO! 🎉\n\n';
                    mensagem += `🎯 Continue praticando para masterizar!\n`;
                    mensagem += `📈 Taxa de acerto: ${data.taxaAcerto.toFixed(1)}%\n`;
                    mensagem += `🎮 Sessões jogadas: ${data.totalSessoes}`;
                    break;
                case 'locked':
                    mensagem += 'BLOQUEADO 🔒\n\n';
                    mensagem += `💪 Você precisa de ${habilidade.xp - data.xpTotal} XP a mais!\n`;
                    mensagem += `🎯 Continue jogando para desbloquear!`;
                    break;
            }

            alert(mensagem);
            
            // Verificar se todas as habilidades foram masterizadas
            verificarConclusaoArvore();
        }
        
        function verificarConclusaoArvore() {
            const data = window.habilidadesData;
            if (!data) return;
            
            // Verificar se todas as habilidades estão masterizadas
            const todasMasterizadas = window.habilidadesData.habilidades.every(habilidade => {
                const status = calcularStatusHabilidade(habilidade, data);
                return status === 'mastered';
            });
            
            if (todasMasterizadas) {
                // Mostrar botão de conclusão
                mostrarBotaoConclusao();
            }
        }
        
        function mostrarBotaoConclusao() {
            // Verificar se o botão já existe
            let botaoConclusao = document.getElementById('botao-conclusao');
            if (botaoConclusao) return;
            
            // Criar botão de conclusão
            botaoConclusao = document.createElement('button');
            botaoConclusao.id = 'botao-conclusao';
            botaoConclusao.innerHTML = '🎉 Concluir Árvore de Habilidades';
            botaoConclusao.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(45deg, #FFD700, #FFA500);
                color: #333;
                border: none;
                padding: 15px 25px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
                z-index: 1000;
                animation: pulse 2s infinite;
            `;
            
            // Adicionar animação CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
            
            // Adicionar evento de clique
            botaoConclusao.addEventListener('click', () => {
                if (confirm('🎉 Parabéns! Você masterizou todas as habilidades!\n\nDeseja concluir sua jornada na árvore de habilidades?')) {
                    // Redirecionar para a tela de parabéns
                    window.location.href = 'http://localhost:3000/Just-dreams-main/JustDreams/parabens_jornada.html';
                }
            });
            
            document.body.appendChild(botaoConclusao);
        }

        function mostrarErro(mensagem) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').textContent = mensagem;
        }
        
        function simularMasterizacao() {
            if (!window.habilidadesData) {
                alert('Dados não carregados ainda. Aguarde um momento.');
                return;
            }
            
            // Simular dados de alta performance para masterizar todas as habilidades
            window.habilidadesData.xpTotal = 10000; // XP muito alto
            window.habilidadesData.taxaAcerto = 95; // Taxa de acerto alta
            window.habilidadesData.totalSessoes = 20; // Muitas sessões
            
            // Atualizar a exibição
            atualizarEstatisticas(window.habilidadesData);
            recriarArvore();
            
            // Verificar conclusão
            verificarConclusaoArvore();
            
            alert('🎉 Todas as habilidades foram masterizadas! Verifique o botão de conclusão no canto superior direito.');
        }
        
        function recriarArvore() {
            const container = document.getElementById('arvore');
            container.innerHTML = '';
            
            // Recriar todos os nós
            window.habilidadesData.habilidades.forEach(habilidade => {
                const node = criarNoHabilidade(habilidade);
                container.appendChild(node);
            });
            
            // Recriar as linhas de conexão
            adicionarLinhasConexao();
        }