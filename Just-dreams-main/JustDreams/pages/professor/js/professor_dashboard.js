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

            // Exibir informações do usuário
            document.getElementById('user-name').textContent = user.nome || 'Professor';
            document.getElementById('user-email').textContent = user.email || '';
            document.getElementById('welcome-name').textContent = user.nome || 'Professor';

            try {
                await carregarDadosDashboard();
            } catch (error) {
                console.error('Erro ao carregar dashboard:', error);
                mostrarErro('Erro ao carregar informações do dashboard.');
            }
        });

        async function carregarDadosDashboard() {
            const token = localStorage.getItem('token');
            const urlParams = new URLSearchParams(window.location.search);
            const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
            
            try {
                if (bypassEnabled) {
                    // Dados mock
                    const totalTurmas = 2;
                    const totalAlunos = 48;
                    const alunosAtivos = 31;
                    const progressoMedio = 76;
                    document.getElementById('total-turmas').textContent = totalTurmas;
                    document.getElementById('total-alunos').textContent = totalAlunos;
                    document.getElementById('alunos-ativos').textContent = alunosAtivos;
                    document.getElementById('progresso-medio').textContent = progressoMedio + '%';
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('content').style.display = 'block';
                    return;
                }
                // Carregar turmas do professor
                const turmasResponse = await fetch('http://localhost:3000/api/turmas', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                let totalTurmas = 0;
                let totalAlunos = 0;
                let progressoMedio = 0;
                let alunosAtivos = 0;

                if (turmasResponse.ok) {
                    const turmasData = await turmasResponse.json();
                    if (turmasData.success) {
                        totalTurmas = turmasData.data.length;
                        
                        // Calcular total de alunos
                        for (const turma of turmasData.data) {
                            if (turma.total_alunos) {
                                totalAlunos += turma.total_alunos;
                            }
                        }
                    }
                }

                // Carregar dados reais de progresso
                try {
                    const progressoResponse = await fetch('http://localhost:3000/api/progresso/professor/alunos', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (progressoResponse.ok) {
                        const progressoData = await progressoResponse.json();
                        if (progressoData.success) {
                            const estatisticas = progressoData.data.estatisticas_gerais;
                            totalAlunos = estatisticas.total_alunos;
                            alunosAtivos = estatisticas.alunos_ativos;
                            progressoMedio = estatisticas.progresso_medio;
                        }
                    }
                } catch (progressoError) {
                    console.warn('Erro ao carregar progresso, usando dados das turmas:', progressoError);
                    // Se não conseguir carregar progresso, usar dados das turmas
                    alunosAtivos = Math.floor(totalAlunos * 0.7); // Estimativa
                    progressoMedio = 0; // Sem dados reais
                }

                // Atualizar estatísticas
                document.getElementById('total-turmas').textContent = totalTurmas;
                document.getElementById('total-alunos').textContent = totalAlunos;
                document.getElementById('alunos-ativos').textContent = alunosAtivos;
                document.getElementById('progresso-medio').textContent = progressoMedio + '%';

                // Ocultar loading e mostrar conteúdo
                document.getElementById('loading').style.display = 'none';
                document.getElementById('content').style.display = 'block';

            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                // Usar dados simulados em caso de erro
                document.getElementById('total-turmas').textContent = '0';
                document.getElementById('total-alunos').textContent = '0';
                document.getElementById('alunos-ativos').textContent = '0';
                document.getElementById('progresso-medio').textContent = '0%';
                
                document.getElementById('loading').style.display = 'none';
                document.getElementById('content').style.display = 'block';
            }
        }

        function mostrarErro(mensagem) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').textContent = mensagem;
        }

        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'professor_login.html';
            }
        }