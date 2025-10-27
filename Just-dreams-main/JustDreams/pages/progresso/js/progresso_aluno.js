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

            try {
                await carregarProgresso();
            } catch (error) {
                console.error('Erro ao carregar progresso:', error);
                mostrarErro('Erro ao carregar seu progresso. Tente novamente.');
            }
        });

        async function carregarProgresso() {
            const token = localStorage.getItem('token');
            const urlParams = new URLSearchParams(window.location.search);
            const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
            
            if (bypassEnabled) {
                // Dados mock para modo offline/sem servidor
                const mock = {
                    estatisticas: {
                        total_sessoes: 7,
                        total_acertos: 120,
                        total_erros: 35,
                        pontuacao_media: 82
                    },
                    historico: [
                        { data_inicio: Date.now() - 86400000 * 1, acertos: 18, erros: 5, pontuacao: 85, medalha: 'prata' },
                        { data_inicio: Date.now() - 86400000 * 2, acertos: 12, erros: 10, pontuacao: 70, medalha: 'bronze' },
                        { data_inicio: Date.now() - 86400000 * 3, acertos: 22, erros: 3, pontuacao: 95, medalha: 'ouro' }
                    ]
                };
                exibirProgresso(mock);
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
                exibirProgresso(data.data);
            } else {
                throw new Error(data.message);
            }
        }

        function exibirProgresso(dados) {
            // Ocultar loading
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';

            // Exibir estatísticas gerais
            const stats = dados.estatisticas;
            document.getElementById('total-sessoes').textContent = stats.total_sessoes || 0;
            document.getElementById('total-acertos').textContent = stats.total_acertos || 0;
            
            const totalPerguntas = (stats.total_acertos || 0) + (stats.total_erros || 0);
            const taxaAcerto = totalPerguntas > 0 ? ((stats.total_acertos / totalPerguntas) * 100).toFixed(1) : 0;
            document.getElementById('taxa-acerto').textContent = taxaAcerto + '%';
            document.getElementById('pontuacao-media').textContent = Math.round(stats.pontuacao_media || 0);

            // Exibir medalhas conquistadas
            const medalhas = ['bronze', 'prata', 'ouro', 'diamante'];
            medalhas.forEach(medalha => {
                const elemento = document.getElementById(`medalha-${medalha}`);
                // Verificar se a medalha foi conquistada (lógica simplificada)
                if (taxaAcerto >= 50) elemento.classList.add('conquistada');
                if (taxaAcerto >= 70) elemento.classList.add('conquistada');
                if (taxaAcerto >= 80) elemento.classList.add('conquistada');
                if (taxaAcerto >= 90) elemento.classList.add('conquistada');
            });

            // Exibir histórico
            const historicoLista = document.getElementById('historico-lista');
            if (dados.historico && dados.historico.length > 0) {
                dados.historico.forEach(jogo => {
                    const jogoItem = document.createElement('div');
                    jogoItem.className = 'jogo-item';
                    
                    const dataJogo = new Date(jogo.data_inicio).toLocaleDateString('pt-BR');
                    const horaJogo = new Date(jogo.data_inicio).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    
                    const medalhas = {
                        'bronze': '🥉',
                        'prata': '🥈',
                        'ouro': '🥇',
                        'diamante': '💎'
                    };
                    
                    jogoItem.innerHTML = `
                        <div class="jogo-info">
                            <div class="jogo-data">${dataJogo} às ${horaJogo}</div>
                            <div class="jogo-stats">${jogo.acertos} acertos, ${jogo.erros} erros - ${jogo.pontuacao} pontos</div>
                        </div>
                        <div class="jogo-medalha">${jogo.medalha ? medalhas[jogo.medalha] : ''}</div>
                    `;
                    
                    historicoLista.appendChild(jogoItem);
                });
            } else {
                historicoLista.innerHTML = '<p style="text-align: center; color: #666;">Nenhum jogo encontrado. Comece a jogar para ver seu progresso!</p>';
            }
        }

        function mostrarErro(mensagem) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').textContent = mensagem;
        }