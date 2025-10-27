 let turmaId = null;

        document.addEventListener('DOMContentLoaded', async () => {
            // Verificar se o usuário está logado
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
   /*         
            if (!token || user.tipo !== 'professor') {
                alert('Você precisa estar logado como professor!');
                window.location.href = 'professor_login.html';
                return;
            }
*/
            // Obter ID da turma da URL
            const urlParams = new URLSearchParams(window.location.search);
            turmaId = urlParams.get('id');

            if (!turmaId) {
                mostrarErro('ID da turma não fornecido.');
                return;
            }

            try {
                await carregarDetalhesTurma();
                await carregarAlunosTurma();
            } catch (error) {
                console.error('Erro ao carregar detalhes:', error);
                mostrarErro('Erro ao carregar informações da turma.');
            }
        });

        async function carregarDetalhesTurma() {
            const token = localStorage.getItem('token');
            
            try {
                const response = await fetch(`http://localhost:3000/api/turmas/${turmaId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        exibirDetalhesTurma(data.data);
                    } else {
                        throw new Error(data.message);
                    }
                } else {
                    throw new Error('Erro ao carregar turma');
                }
            } catch (error) {
                console.error('Erro ao carregar turma:', error);
                // Usar dados simulados
                exibirDetalhesTurmaSimulados();
            }
        }

        async function carregarAlunosTurma() {
            const token = localStorage.getItem('token');
            
            try {
                const response = await fetch(`http://localhost:3000/api/turmas/${turmaId}/alunos`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        exibirAlunos(data.data);
                    } else {
                        throw new Error(data.message);
                    }
                } else {
                    throw new Error('Erro ao carregar alunos');
                }
            } catch (error) {
                console.error('Erro ao carregar alunos:', error);
                // Usar dados simulados
                exibirAlunosSimulados();
            }
        }

        function exibirDetalhesTurma(turma) {
            document.getElementById('turma-nome').textContent = turma.nome || 'Turma';
            document.getElementById('turma-descricao').textContent = turma.descricao || 'Sem descrição';
            document.getElementById('turma-total-alunos').textContent = turma.total_alunos || 0;
            document.getElementById('turma-data-criacao').textContent = 
                turma.created_at ? new Date(turma.created_at).toLocaleDateString('pt-BR') : '-';
            document.getElementById('turma-progresso-medio').textContent = '75%'; // Simulado
        }

        function exibirDetalhesTurmaSimulados() {
            document.getElementById('turma-nome').textContent = 'Matemática Básica';
            document.getElementById('turma-descricao').textContent = 'Turma para alunos do 1º ao 3º ano';
            document.getElementById('turma-total-alunos').textContent = '5';
            document.getElementById('turma-data-criacao').textContent = new Date().toLocaleDateString('pt-BR');
            document.getElementById('turma-progresso-medio').textContent = '75%';
        }

        function exibirAlunos(alunos) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';
            
            if (alunos && alunos.length > 0) {
                const alunosGrid = document.getElementById('alunos-grid');
                alunosGrid.innerHTML = '';
                
                alunos.forEach(aluno => {
                    const alunoCard = document.createElement('div');
                    alunoCard.className = 'aluno-card';
                    alunoCard.innerHTML = `
                        <div class="aluno-nome">${aluno.nome}</div>
                        <div class="aluno-info"><strong>Idade:</strong> ${aluno.idade} anos</div>
                        <div class="aluno-info"><strong>Turma:</strong> ${aluno.turma}</div>
                        <div class="aluno-progresso">
                            <div class="progresso-bar">
                                <div class="progresso-fill" style="width: 75%"></div>
                            </div>
                            <div class="progresso-text">Progresso: 75%</div>
                        </div>
                    `;
                    alunosGrid.appendChild(alunoCard);
                });
            } else {
                document.getElementById('empty-alunos').style.display = 'block';
            }
        }

        function exibirAlunosSimulados() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';
            
            const alunosSimulados = [
                { nome: 'João Silva', idade: 8, turma: '3º Ano A' },
                { nome: 'Maria Santos', idade: 7, turma: '3º Ano A' },
                { nome: 'Pedro Costa', idade: 8, turma: '3º Ano A' },
                { nome: 'Ana Oliveira', idade: 7, turma: '3º Ano A' },
                { nome: 'Lucas Ferreira', idade: 8, turma: '3º Ano A' }
            ];
            
            exibirAlunos(alunosSimulados);
        }

        function mostrarErro(mensagem) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').textContent = mensagem;
        }

        function adicionarAluno() {
            alert('Funcionalidade de adicionar aluno será implementada em breve!');
            // Implementar modal ou redirecionar para página de adicionar aluno
        }