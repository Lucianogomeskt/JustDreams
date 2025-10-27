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
            try {
                await carregarTurmas();
            } catch (error) {
                console.error('Erro ao carregar turmas:', error);
                mostrarErro('Erro ao carregar turmas. Tente novamente.');
            }
        });

        async function carregarTurmas() {
            const token = localStorage.getItem('token');
            
            try {
                console.log('Carregando turmas...');
                const response = await fetch('http://localhost:3000/api/turmas', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Dados recebidos:', data);
                
                if (data.success) {
                    console.log('Turmas encontradas:', data.data);
                    exibirTurmas(data.data);
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Erro ao carregar turmas:', error);
                // Mostrar turmas simuladas em caso de erro
                exibirTurmasSimuladas();
            }
        }

        function exibirTurmas(turmas) {
            document.getElementById('loading').style.display = 'none';
            
            if (turmas && turmas.length > 0) {
                document.getElementById('turmas-container').style.display = 'block';
                
                const turmasGrid = document.getElementById('turmas-grid');
                turmasGrid.innerHTML = '';
                
                turmas.forEach(turma => {
                    const turmaCard = document.createElement('div');
                    turmaCard.className = 'turma-card';
                    turmaCard.innerHTML = `
                        <h3>${turma.nome}</h3>
                        <div class="turma-info">
                            <p><strong>Descrição:</strong> ${turma.descricao || 'Sem descrição'}</p>
                            <p><strong>Alunos:</strong> ${turma.total_alunos || 0}</p>
                            <p><strong>Criada em:</strong> ${new Date(turma.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div class="turma-actions">
                            <button class="btn-action btn-primary" onclick="verDetalhes(${turma.id})">
                                Ver Detalhes
                            </button>
                            <button class="btn-action btn-secondary" onclick="editarTurma(${turma.id})">
                                Editar
                            </button>
                            <button class="btn-action btn-danger" onclick="excluirTurma(${turma.id})" id="btn-excluir-${turma.id}">
                                Excluir
                            </button>
                        </div>
                    `;
                    turmasGrid.appendChild(turmaCard);
                });
            } else {
                document.getElementById('empty-state').style.display = 'block';
            }
        }

        function exibirTurmasSimuladas() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('turmas-container').style.display = 'block';
            
            const turmasSimuladas = [
                {
                    id: 1,
                    nome: 'Matemática Básica',
                    descricao: 'Turma para alunos do 1º ao 3º ano',
                    total_alunos: 15,
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    nome: 'Matemática Avançada',
                    descricao: 'Turma para alunos do 4º ao 6º ano',
                    total_alunos: 12,
                    created_at: new Date().toISOString()
                }
            ];
            
            exibirTurmas(turmasSimuladas);
        }

        function mostrarErro(mensagem) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').textContent = mensagem;
        }

        function verDetalhes(turmaId) {
            window.location.href = `detalhes_turma.html?id=${turmaId}`;
        }

        function editarTurma(turmaId) {
            // Por enquanto, redirecionar para uma página de edição simples
            // ou mostrar um modal de edição
            const novoNome = prompt('Digite o novo nome da turma:');
            if (novoNome && novoNome.trim() !== '') {
                // Implementar edição via API
                alert(`Funcionalidade de edição será implementada em breve. Turma ID: ${turmaId}, Novo nome: ${novoNome}`);
            }
        }

        async function excluirTurma(turmaId) {
            console.log('=== FUNÇÃO EXCLUIR TURMA CHAMADA ===');
            console.log('Tentando excluir turma ID:', turmaId);
            console.log('Tipo do ID:', typeof turmaId);
            
            // Teste simples primeiro
            alert(`Função chamada para turma ID: ${turmaId}`);
            
            if (confirm('Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.')) {
                const token = localStorage.getItem('token');
                console.log('Token encontrado:', token ? 'Sim' : 'Não');
                
                // Mostrar loading
                document.getElementById('loading').style.display = 'block';
                document.getElementById('turmas-container').style.display = 'none';
                document.getElementById('empty-state').style.display = 'none';
                
                try {
                    console.log('Fazendo requisição DELETE para:', `http://localhost:3000/api/turmas/${turmaId}`);
                    
                    const response = await fetch(`http://localhost:3000/api/turmas/${turmaId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log('Response status:', response.status);
                    const data = await response.json();
                    console.log('Response data:', data);
                    
                    if (data.success) {
                        alert('Turma excluída com sucesso!');
                        // Recarregar a lista de turmas
                        await carregarTurmas();
                    } else {
                        alert('Erro ao excluir turma: ' + data.message);
                        // Mostrar turmas novamente em caso de erro
                        await carregarTurmas();
                    }
                } catch (error) {
                    console.error('Erro ao excluir turma:', error);
                    alert('Erro de conexão. Verifique se o servidor está rodando.');
                    // Mostrar turmas novamente em caso de erro
                    await carregarTurmas();
                }
            }
        }