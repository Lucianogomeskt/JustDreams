 let turmas = [];
        let alunos = [];

        document.addEventListener('DOMContentLoaded', async () => {
            // Verificar se o usuário está logado (com BYPASS)
            const urlParams = new URLSearchParams(window.location.search);
            const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
            const token = localStorage.getItem('token');
            let user = JSON.parse(localStorage.getItem('user') || '{}');
 /*           
            if ((!token || user.tipo !== 'professor') && !bypassEnabled) {
                alert('Você precisa estar logado como professor!');
                window.location.href = 'professor_login.html';
                return;
            }
*/             
            if (bypassEnabled && (!user || !user.id)) {
                user = { id: 999, nome: 'Prof. Bypass', email: 'prof@local', tipo: 'professor' };
                localStorage.setItem('user', JSON.stringify(user));
            }

            try {
                await carregarTurmas();
                await carregarProgressoAlunos();
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                mostrarErro('Erro ao carregar informações de progresso.');
            }
        });

        async function carregarTurmas() {
            const token = localStorage.getItem('token');
            const urlParams = new URLSearchParams(window.location.search);
            const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
            
            try {
                if (bypassEnabled) {
                    turmas = [
                        { id: 1, nome: 'Matemática Básica' },
                        { id: 2, nome: 'Matemática Avançada' }
                    ];
                    preencherSelectTurmas();
                    return;
                }
                const response = await fetch('http://localhost:3000/api/turmas', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        turmas = data.data;
                        preencherSelectTurmas();
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar turmas:', error);
                // Usar turmas simuladas
                turmas = [
                    { id: 1, nome: 'Matemática Básica' },
                    { id: 2, nome: 'Matemática Avançada' }
                ];
                preencherSelectTurmas();
            }
        }

        function preencherSelectTurmas() {
            const select = document.getElementById('turma-filter');
            select.innerHTML = '<option value="">Todas as turmas</option>';
            
            // Carregar turmas dos alunos
            carregarTurmasAlunos().then(turmasAlunos => {
                const turmasUnicas = [...new Set(turmasAlunos.map(aluno => aluno.turma))];
                turmasUnicas.sort();
                
                turmasUnicas.forEach(turma => {
                    const option = document.createElement('option');
                    option.value = turma;
                    option.textContent = turma;
                    select.appendChild(option);
                });
            });
        }

        async function carregarTurmasAlunos() {
            const token = localStorage.getItem('token');
            const urlParams = new URLSearchParams(window.location.search);
            const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
            
            try {
                if (bypassEnabled) {
                    return [
                        { nome: 'João Silva', turma: 'Matemática Básica' },
                        { nome: 'Maria Santos', turma: 'Matemática Avançada' }
                    ];
                }
                const response = await fetch('http://localhost:3000/api/progresso/professor/alunos', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        return data.data.alunos;
                    }
                }
                return [];
            } catch (error) {
                console.error('Erro ao carregar turmas dos alunos:', error);
                return [];
            }
        }

        async function carregarProgressoAlunos() {
            const token = localStorage.getItem('token');
            const turmaId = document.getElementById('turma-filter').value;
            
            try {
                if (turmaId) {
                    // Carregar progresso de uma turma específica
                    await carregarProgressoTurma(turmaId);
                } else {
                    // Carregar progresso de todas as turmas do professor
                    await carregarProgressoTodasTurmas();
                }
                
                document.getElementById('loading').style.display = 'none';
                document.getElementById('content').style.display = 'block';
                
            } catch (error) {
                console.error('Erro ao carregar progresso:', error);
                mostrarErro('Erro ao carregar progresso dos alunos.');
            }
        }

        async function carregarProgressoTurma(turmaId) {
            const token = localStorage.getItem('token');
            const urlParams = new URLSearchParams(window.location.search);
            const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
            
            try {
                if (bypassEnabled) {
                    exibirProgressoSimulado();
                    return;
                }
                const response = await fetch(`http://localhost:3000/api/progresso/turma/${turmaId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        exibirProgressoReal(data.data);
                    } else {
                        throw new Error(data.message);
                    }
                } else {
                    throw new Error('Erro ao carregar progresso da turma');
                }
            } catch (error) {
                console.error('Erro ao carregar progresso da turma:', error);
                // Fallback para dados simulados
                exibirProgressoSimulado();
            }
        }

        async function carregarProgressoTodasTurmas() {
            const token = localStorage.getItem('token');
            const urlParams = new URLSearchParams(window.location.search);
            const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
            
            try {
                if (bypassEnabled) {
                    exibirProgressoSimulado();
                    return;
                }
                // Carregar progresso de todos os alunos
                const response = await fetch('http://localhost:3000/api/progresso/professor/alunos', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        exibirProgressoReal(data.data);
                    } else {
                        throw new Error(data.message);
                    }
                } else {
                    throw new Error('Erro ao carregar progresso de todos os alunos');
                }
            } catch (error) {
                console.error('Erro ao carregar progresso de todos os alunos:', error);
                exibirProgressoSimulado();
            }
        }

        function exibirProgressoReal(data) {
            const { estatisticas_gerais, alunos } = data;

            // Atualizar estatísticas
            document.getElementById('total-alunos').textContent = estatisticas_gerais.total_alunos;
            document.getElementById('alunos-ativos').textContent = estatisticas_gerais.alunos_ativos;
            document.getElementById('progresso-medio').textContent = estatisticas_gerais.progresso_medio + '%';
            document.getElementById('jogos-realizados').textContent = estatisticas_gerais.total_jogos;

            // Exibir alunos
            const container = document.getElementById('alunos-progresso');
            container.innerHTML = '';

            if (alunos.length === 0) {
                container.innerHTML = '<div class="no-data">Nenhum aluno encontrado nesta turma.</div>';
                return;
            }

            alunos.forEach(aluno => {
                const medalhas = {
                    'bronze': '🥉',
                    'prata': '🥈',
                    'ouro': '🥇',
                    'diamante': '💎'
                };

                const alunoCard = document.createElement('div');
                alunoCard.className = 'aluno-progresso-card';
                alunoCard.innerHTML = `
                    <div class="aluno-header">
                        <div>
                            <div class="aluno-nome">${aluno.nome}</div>
                            <div class="aluno-turma">Turma: ${aluno.turma} | Idade: ${aluno.idade} anos</div>
                        </div>
                        <div class="medalha">${medalhas[aluno.medalha] || ''}</div>
                    </div>
                    
                    <div class="progresso-bar">
                        <div class="progresso-fill" style="width: ${aluno.progresso}%"></div>
                    </div>
                    
                    <div class="progresso-info">
                        <div class="info-item">
                            <div class="info-label">Acertos</div>
                            <div class="info-value">${aluno.acertos}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Erros</div>
                            <div class="info-value">${aluno.erros}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Tempo Médio</div>
                            <div class="info-value">${aluno.tempo_medio}s</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Último Jogo</div>
                            <div class="info-value">${aluno.ultimo_jogo ? new Date(aluno.ultimo_jogo).toLocaleDateString('pt-BR') : 'Nunca'}</div>
                        </div>
                    </div>
                `;
                container.appendChild(alunoCard);
            });
        }

        function exibirProgressoSimulado() {
            const alunosSimulados = [
                {
                    nome: 'João Silva',
                    turma: 'Matemática Básica',
                    progresso: 85,
                    acertos: 42,
                    erros: 8,
                    tempo_medio: 45,
                    medalha: 'ouro',
                    ultimo_jogo: '2025-09-21'
                },
                {
                    nome: 'Maria Santos',
                    turma: 'Matemática Básica',
                    progresso: 72,
                    acertos: 36,
                    erros: 14,
                    tempo_medio: 52,
                    medalha: 'prata',
                    ultimo_jogo: '2025-09-20'
                },
                {
                    nome: 'Pedro Costa',
                    turma: 'Matemática Avançada',
                    progresso: 91,
                    acertos: 48,
                    erros: 5,
                    tempo_medio: 38,
                    medalha: 'diamante',
                    ultimo_jogo: '2025-09-21'
                },
                {
                    nome: 'Ana Oliveira',
                    turma: 'Matemática Básica',
                    progresso: 68,
                    acertos: 34,
                    erros: 16,
                    tempo_medio: 58,
                    medalha: 'bronze',
                    ultimo_jogo: '2025-09-19'
                },
                {
                    nome: 'Lucas Ferreira',
                    turma: 'Matemática Avançada',
                    progresso: 78,
                    acertos: 39,
                    erros: 11,
                    tempo_medio: 49,
                    medalha: 'prata',
                    ultimo_jogo: '2025-09-21'
                }
            ];

            // Atualizar estatísticas
            document.getElementById('total-alunos').textContent = alunosSimulados.length;
            document.getElementById('alunos-ativos').textContent = alunosSimulados.length;
            document.getElementById('progresso-medio').textContent = 
                Math.round(alunosSimulados.reduce((acc, aluno) => acc + aluno.progresso, 0) / alunosSimulados.length) + '%';
            document.getElementById('jogos-realizados').textContent = 
                alunosSimulados.reduce((acc, aluno) => acc + aluno.acertos + aluno.erros, 0);

            // Exibir alunos
            const container = document.getElementById('alunos-progresso');
            container.innerHTML = '';

            alunosSimulados.forEach(aluno => {
                const medalhas = {
                    'bronze': '🥉',
                    'prata': '🥈',
                    'ouro': '🥇',
                    'diamante': '💎'
                };

                const alunoCard = document.createElement('div');
                alunoCard.className = 'aluno-progresso-card';
                alunoCard.innerHTML = `
                    <div class="aluno-header">
                        <div>
                            <div class="aluno-nome">${aluno.nome}</div>
                            <div class="aluno-turma">${aluno.turma}</div>
                        </div>
                        <div class="medalha">${medalhas[aluno.medalha] || ''}</div>
                    </div>
                    
                    <div class="progresso-bar">
                        <div class="progresso-fill" style="width: ${aluno.progresso}%"></div>
                    </div>
                    
                    <div class="progresso-info">
                        <div class="info-item">
                            <div class="info-label">Acertos</div>
                            <div class="info-value">${aluno.acertos}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Erros</div>
                            <div class="info-value">${aluno.erros}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Tempo Médio</div>
                            <div class="info-value">${aluno.tempo_medio}s</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Último Jogo</div>
                            <div class="info-value">${new Date(aluno.ultimo_jogo).toLocaleDateString('pt-BR')}</div>
                        </div>
                    </div>
                `;
                container.appendChild(alunoCard);
            });
        }

        function aplicarFiltros() {
            const turmaId = document.getElementById('turma-filter').value;
            const searchTerm = document.getElementById('search-aluno').value.toLowerCase();
            
            console.log('Aplicando filtros:', { turmaId, searchTerm });
            
            // Se não há filtros, carregar todos os alunos
            if (!turmaId && !searchTerm) {
                carregarProgressoAlunos();
                return;
            }

            // Carregar todos os alunos e depois aplicar filtros
            carregarProgressoTodasTurmas().then(() => {
                filtrarAlunos();
            });
        }

        function filtrarAlunos() {
            const turmaId = document.getElementById('turma-filter').value;
            const searchTerm = document.getElementById('search-aluno').value.toLowerCase();
            
            // Aplicar filtros no frontend
            const container = document.getElementById('alunos-progresso');
            const cards = container.querySelectorAll('.aluno-progresso-card');
            
            cards.forEach(card => {
                const nome = card.querySelector('.aluno-nome').textContent.toLowerCase();
                const turma = card.querySelector('.aluno-turma').textContent.toLowerCase();
                
                let mostrar = true;
                
                if (turmaId && !turma.includes(turmaId.toLowerCase())) {
                    mostrar = false;
                }
                
                if (searchTerm && !nome.includes(searchTerm)) {
                    mostrar = false;
                }
                
                card.style.display = mostrar ? 'block' : 'none';
            });
        }

        function mostrarErro(mensagem) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').textContent = mensagem;
        }