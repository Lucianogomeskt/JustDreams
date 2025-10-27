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
            document.getElementById('user-info').innerHTML = `
                <div style="text-align: center;">
                    <div>👤 ${user.nome}</div>
                    <div style="font-size: 0.8em; opacity: 0.8;">ID: ${user.id}</div>
                </div>`;
            document.getElementById('welcome-message').textContent = `Olá, ${user.nome}!`;

            try {
                await carregarProgresso();
                await atualizarDashboard();
                await verificarSolicitacoesPendentes();
                
                // Verificar solicitações pendentes a cada 30 segundos
                setInterval(verificarSolicitacoesPendentes, 30000);
            } catch (error) {
                console.error('Erro ao carregar dashboard:', error);
                mostrarErro('Erro ao carregar seu dashboard. Tente novamente.');
            }
        });

        async function carregarProgresso() {
            const token = localStorage.getItem('token');
            const urlParams = new URLSearchParams(window.location.search);
            const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
            if (bypassEnabled) {
                // Dados mock para modo offline/sem servidor
                progressoData = {
                    estatisticas: {
                        total_acertos: 42,
                        total_erros: 13,
                        total_sessoes: 5,
                        pontuacao_media: 78
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
            } else {
                throw new Error(data.message);
            }
        }

        async function atualizarDashboard() {
            const stats = progressoData.estatisticas;
            const totalAcertos = stats.total_acertos || 0;
            const totalErros = stats.total_erros || 0;
            const totalPerguntas = totalAcertos + totalErros;
            const taxaAcerto = totalPerguntas > 0 ? ((totalAcertos / totalPerguntas) * 100).toFixed(1) : 0;
            const totalSessoes = stats.total_sessoes || 0;
            const pontuacaoMedia = Math.round(stats.pontuacao_media || 0);

            // Calcular XP total
            let xpTotal = totalAcertos * 10 + totalSessoes * 25;
            if (taxaAcerto >= 50) xpTotal += 100;
            if (taxaAcerto >= 70) xpTotal += 150;
            if (taxaAcerto >= 80) xpTotal += 200;
            if (taxaAcerto >= 90) xpTotal += 300;

            // Determinar nível
            let nivelAtual = 1;
            if (xpTotal >= 500) nivelAtual = 6;
            else if (xpTotal >= 300) nivelAtual = 5;
            else if (xpTotal >= 200) nivelAtual = 4;
            else if (xpTotal >= 100) nivelAtual = 3;
            else if (xpTotal >= 50) nivelAtual = 2;

            // Atualizar estatísticas rápidas
            document.getElementById('quick-stats').innerHTML = `
                <div class="stat-card">
                    <h3>Nível Atual</h3>
                    <div class="number">${nivelAtual}</div>
                    <div class="label">de 6 níveis</div>
                </div>
                <div class="stat-card">
                    <h3>Taxa de Acerto</h3>
                    <div class="number">${taxaAcerto}%</div>
                    <div class="label">Precisão</div>
                </div>
                <div class="stat-card">
                    <h3>Sessões Jogadas</h3>
                    <div class="number">${totalSessoes}</div>
                    <div class="label">Jogos completos</div>
                </div>
                <div class="stat-card">
                    <h3>Pontuação Média</h3>
                    <div class="number">${pontuacaoMedia}</div>
                    <div class="label">Pontos por jogo</div>
                </div>
            `;

            // Atualizar habilidades recentes
            atualizarHabilidades(xpTotal, taxaAcerto);

            // Ocultar loading e mostrar conteúdo
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';

            // Atualizar mini-estatísticas do sistema espaçado
            try {
                if (window.healthTimer && typeof window.healthTimer.getStats === 'function') {
                    const healthStats = window.healthTimer.getStats();
                    const todayEl = document.getElementById('today-count');
                    if (todayEl) todayEl.textContent = healthStats.completedToday || 0;
                }
                if (window.rankingSystem && typeof window.rankingSystem.getTotalPoints === 'function') {
                    const pointsEl = document.getElementById('points-count');
                    if (pointsEl) pointsEl.textContent = window.rankingSystem.getTotalPoints() || 0;
                }
            } catch(e) { /* noop */ }
        }

        function atualizarHabilidades(xpTotal, taxaAcerto) {
            const habilidades = [
                { nome: 'Iniciante', xp: 0, desbloqueada: true },
                { nome: 'Adição', xp: 50, desbloqueada: xpTotal >= 50 },
                { nome: 'Subtração', xp: 50, desbloqueada: xpTotal >= 50 },
                { nome: 'Multiplicação', xp: 100, desbloqueada: xpTotal >= 100 },
                { nome: 'Divisão', xp: 100, desbloqueada: xpTotal >= 100 },
                { nome: 'Frações', xp: 200, desbloqueada: xpTotal >= 200 },
                { nome: 'Decimais', xp: 200, desbloqueada: xpTotal >= 200 },
                { nome: 'Geometria', xp: 300, desbloqueada: xpTotal >= 300 },
                { nome: 'Álgebra', xp: 300, desbloqueada: xpTotal >= 300 },
                { nome: 'Mestre', xp: 500, desbloqueada: xpTotal >= 500 }
            ];

            const habilidadesDesbloqueadas = habilidades.filter(h => h.desbloqueada);
            const habilidadesRecentes = habilidadesDesbloqueadas.slice(-3).reverse();

            let skillsHTML = '';
            if (habilidadesRecentes.length > 0) {
                habilidadesRecentes.forEach(habilidade => {
                    const status = taxaAcerto >= 80 ? 'mastered' : 'unlocked';
                    const icon = status === 'mastered' ? '🏆' : '✅';
                    skillsHTML += `
                        <div class="progress-item">
                            <span class="skill">${icon} ${habilidade.nome}</span>
                            <span class="level">${status === 'mastered' ? 'Masterizado' : 'Desbloqueado'}</span>
                        </div>
                    `;
                });
            } else {
                skillsHTML = '<p style="text-align: center; color: #666;">Continue jogando para desbloquear suas primeiras habilidades!</p>';
            }

            document.getElementById('skills-list').innerHTML = skillsHTML;
        }
    
        function abrirModalAmigos() {
            document.getElementById('modalAmigos').style.display = 'flex';
        }

        function fecharModalAmigos() {
            document.getElementById('modalAmigos').style.display = 'none';
        }

        async function procurarAmigos() {
            const termo = document.getElementById('pesquisaAmigo').value;
            const resultadosDiv = document.getElementById('resultadosPesquisa');
            const btnProcurar = document.querySelector('button[onclick="procurarAmigos()"]');
            
            if (!termo.trim()) {
                resultadosDiv.innerHTML = '<p style="text-align: center; padding: 20px;">Digite um nome para pesquisar</p>';
                return;
            }
            
            try {
                btnProcurar.disabled = true;
                btnProcurar.textContent = 'Procurando...';
                
                const token = localStorage.getItem('token');
                const userId = JSON.parse(localStorage.getItem('user')).id;
                
                const response = await fetch(`/api/auth/alunos/pesquisa?termo=${encodeURIComponent(termo)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Erro ao buscar alunos');
                }
                
                const alunos = await response.json();
                const alunosFiltrados = alunos.filter(aluno => aluno.id !== userId); // Remove o próprio usuário da lista
                
                resultadosDiv.innerHTML = alunosFiltrados.map(aluno => `
                    <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: white; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <div>
                            <strong style="font-size: 1.1em; color: #333;">${aluno.nome}</strong>
                            <div style="font-size: 0.9em; color: #666;">ID: ${aluno.id}</div>
                            <div style="font-size: 0.9em; color: #666;">Turma: ${aluno.turma || 'Não especificada'}</div>
                        </div>
                        <button onclick="adicionarAmigo(${aluno.id})" 
                            style="padding: 8px 20px; background: #4facfe; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 500; transition: all 0.3s ease;"
                            id="btn-adicionar-${aluno.id}"
                            onmouseover="this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.transform='translateY(0)'">
                            Adicionar
                        </button>
                    </div>
                `).join('') || '<p style="text-align: center; padding: 20px;">Nenhum aluno encontrado</p>';
            } catch (error) {
                console.error('Erro na pesquisa:', error);
                resultadosDiv.innerHTML = '<p style="text-align: center; color: red; padding: 20px;">Erro ao buscar alunos</p>';
            } finally {
                btnProcurar.disabled = false;
                btnProcurar.textContent = 'Procurar';
            }
        }

        // Adicionar evento de tecla Enter no campo de pesquisa
        document.getElementById('pesquisaAmigo').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                procurarAmigos();
            }
        });

        async function adicionarAmigo(amigoId) {
            const btnAdicionar = document.getElementById(`btn-adicionar-${amigoId}`);
            if (!btnAdicionar) return;
            
            const textoOriginal = btnAdicionar.textContent;
            const userId = JSON.parse(localStorage.getItem('user')).id;
            
            try {
                btnAdicionar.disabled = true;
                btnAdicionar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';
                
                const token = localStorage.getItem('token');

                // DEBUG: log do token e corpo da requisição
                console.log('DEBUG adicionarAmigo: token=', token);
                const url = 'http://localhost:3000/api/amizades/adicionar'; // usar URL absoluta para evitar problemas quando a página for aberta via file://
                const body = { amigoId: amigoId };
                console.log('DEBUG adicionarAmigo: POST', url, body);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(body)
                });

                // Log do status e corpo da resposta para diagnóstico
                let respText = await response.text();
                console.log('DEBUG adicionarAmigo: status=', response.status, 'bodyRaw=', respText);
                let data = {};
                try { data = JSON.parse(respText); } catch (e) { data = { mensagem: respText }; }

                if (response.ok) {
                    btnAdicionar.style.background = '#28a745';
                    btnAdicionar.innerHTML = '<i class="fas fa-check"></i> Adicionado';
                    mostrarNotificacao('Amigo adicionado com sucesso!', 'success');
                } else {
                    const errMsg = data.mensagem || data.message || 'Erro ao adicionar amigo';
                    throw new Error(errMsg);
                }
            } catch (error) {
                console.error('Erro ao adicionar:', error);
                btnAdicionar.style.background = '#dc3545';
                btnAdicionar.innerHTML = '<i class="fas fa-times"></i> Erro';
                mostrarNotificacao(error.message, 'error');
            } finally {
                setTimeout(() => {
                    if (btnAdicionar) {
                        btnAdicionar.style.background = '#4facfe';
                        btnAdicionar.innerHTML = textoOriginal;
                        btnAdicionar.disabled = false;
                    }
                }, 2000);
            }
        }

        function mostrarNotificacao(mensagem, tipo) {
            const notificacao = document.createElement('div');
            notificacao.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                animation: slideIn 0.5s ease-out;
            `;
            
            notificacao.style.background = tipo === 'success' ? '#28a745' : '#dc3545';
            notificacao.textContent = mensagem;
            
            document.body.appendChild(notificacao);
            
            setTimeout(() => {
                notificacao.style.animation = 'slideOut 0.5s ease-out';
                setTimeout(() => notificacao.remove(), 500);
            }, 3000);
        }

        // Adicionar estilos de animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
    document.head.appendChild(style);

        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'aluno_login.html';
            }
        }

        function mostrarErro(mensagem) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').textContent = mensagem;
        }

        // Função para verificar solicitações pendentes de amizade
        async function verificarSolicitacoesPendentes() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/api/amizades/solicitacoes-pendentes', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const solicitacoes = await response.json();
                    const notificationBadge = document.getElementById('notification-badge');
                    
                    if (solicitacoes.length > 0) {
                        notificationBadge.style.display = 'flex';
                        notificationBadge.title = `${solicitacoes.length} nova(s) solicitação(ões) de amizade`;
                        
                        // Adicionar evento de clique para ir para a página de amigos
                        notificationBadge.onclick = () => {
                            window.location.href = 'meus_amigos.html';
                        };
                        
                        // Mostrar notificação toast se for a primeira verificação
                        if (!window.solicitacoesVerificadas) {
                            mostrarNotificacaoToast(`Você tem ${solicitacoes.length} nova(s) solicitação(ões) de amizade!`);
                            window.solicitacoesVerificadas = true;
                        }
                    } else {
                        notificationBadge.style.display = 'none';
                    }
                }
            } catch (error) {
                console.error('Erro ao verificar solicitações pendentes:', error);
            }
        }

        // Função para mostrar notificação toast
        function mostrarNotificacaoToast(mensagem) {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4facfe;
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 1000;
                animation: slideInRight 0.5s ease-out;
                cursor: pointer;
                max-width: 300px;
            `;
            
            toast.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-user-plus"></i>
                    <span>${mensagem}</span>
                </div>
            `;
            
            // Adicionar animação CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(toast);
            
            // Remover após 5 segundos
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.5s ease-out';
                setTimeout(() => toast.remove(), 500);
            }, 5000);
            
            // Clique para ir para a página de amigos
            toast.onclick = () => {
                window.location.href = 'meus_amigos.html';
            };
        }
        