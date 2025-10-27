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
            // Carregar dados dos alunos
            await carregarAlunosTurma();
            await carregarAlunosSemTurma();

            const form = document.getElementById('cadastrar-aluno-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await cadastrarAluno();
            });
        });


        async function cadastrarAluno() {
            const form = document.getElementById('cadastrar-aluno-form');
            const formData = new FormData(form);
            
            const alunoData = {
                nome: formData.get('nome'),
                idade: parseInt(formData.get('idade')),
                turma: formData.get('turma'),
                senha: formData.get('senha'),
                confirmar_senha: formData.get('confirmar_senha'),
                tipo: 'aluno'
            };

            // Validar dados
            if (!alunoData.nome || alunoData.nome.trim() === '') {
                mostrarErro('O nome do aluno é obrigatório.');
                return;
            }

            if (!alunoData.idade || alunoData.idade < 5 || alunoData.idade > 100) {
                mostrarErro('A idade deve estar entre 5 e 100 anos.');
                return;
            }

            if (!alunoData.turma || alunoData.turma.trim() === '') {
                mostrarErro('A turma do aluno é obrigatória.');
                return;
            }

            // Validar formato da turma (número + ° + letra)
            const turmaRegex = /^[0-9]+°[A-Za-z]$/;
            if (!turmaRegex.test(alunoData.turma.trim())) {
                mostrarErro('A turma deve estar no formato: número + ° + letra (ex: 1°A, 2°B, 3°C).');
                return;
            }

            if (!alunoData.senha || alunoData.senha.length < 6) {
                mostrarErro('A senha deve ter pelo menos 6 caracteres.');
                return;
            }

            if (alunoData.senha !== alunoData.confirmar_senha) {
                mostrarErro('As senhas não coincidem.');
                return;
            }

            const token = localStorage.getItem('token');
            const btnSubmit = document.getElementById('btn-submit');
            
            try {
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Cadastrando...';

                // Cadastrar o aluno com turma no formato especificado
                const registerData = {
                    nome: alunoData.nome,
                    idade: alunoData.idade,
                    turma: alunoData.turma.trim(), // Turma no formato 1°A, 2°B, etc.
                    senha: alunoData.senha,
                    tipo: 'aluno'
                };

                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(registerData)
                });

                const data = await response.json();
                
                if (data.success) {
                    mostrarSucesso('Aluno cadastrado com sucesso!');
                    form.reset();
                    // Recarregar listas de alunos
                    await carregarAlunosTurma();
                    await carregarAlunosSemTurma();
                } else {
                    mostrarErro('Erro ao cadastrar aluno: ' + data.message);
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarErro('Erro de conexão. Verifique se o servidor está rodando.');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Cadastrar Aluno';
            }
        }

        function mostrarErro(mensagem) {
            const errorDiv = document.getElementById('error');
            errorDiv.textContent = mensagem;
            errorDiv.style.display = 'block';
            
            const successDiv = document.getElementById('success');
            successDiv.style.display = 'none';
        }

        function mostrarSucesso(mensagem) {
            const successDiv = document.getElementById('success');
            successDiv.textContent = mensagem;
            successDiv.style.display = 'block';
            
            const errorDiv = document.getElementById('error');
            errorDiv.style.display = 'none';
        }

        async function carregarAlunosTurma() {
            const token = localStorage.getItem('token');
            const container = document.getElementById('alunos-turma');
            
            try {
                // Primeiro, buscar as turmas do professor
                const turmasResponse = await fetch('http://localhost:3000/api/turmas', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!turmasResponse.ok) {
                    container.innerHTML = '<div class="no-data">Erro ao carregar turmas</div>';
                    return;
                }

                const turmasData = await turmasResponse.json();
                if (!turmasData.success || turmasData.data.length === 0) {
                    container.innerHTML = '<div class="no-data">Nenhuma turma cadastrada</div>';
                    return;
                }

                // Buscar alunos de cada turma
                let todosAlunos = [];
                for (const turma of turmasData.data) {
                    const progressoResponse = await fetch(`http://localhost:3000/api/progresso/turma/${turma.id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (progressoResponse.ok) {
                        const progressoData = await progressoResponse.json();
                        if (progressoData.success && progressoData.data.alunos) {
                            todosAlunos = todosAlunos.concat(progressoData.data.alunos);
                        }
                    }
                }

                exibirAlunosTurma(todosAlunos, container);

            } catch (error) {
                console.error('Erro ao carregar alunos da turma:', error);
                container.innerHTML = '<div class="no-data">Erro de conexão</div>';
            }
        }

        async function carregarAlunosSemTurma() {
            const token = localStorage.getItem('token');
            const container = document.getElementById('alunos-sem-turma');
            
            try {
                const response = await fetch('http://localhost:3000/api/turmas/alunos/sem-turma', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        exibirAlunosSemTurma(data.data, container);
                    } else {
                        container.innerHTML = '<div class="no-data">Erro ao carregar alunos sem turma</div>';
                    }
                } else {
                    container.innerHTML = '<div class="no-data">Erro ao carregar alunos sem turma</div>';
                }
            } catch (error) {
                console.error('Erro ao carregar alunos sem turma:', error);
                container.innerHTML = '<div class="no-data">Erro de conexão</div>';
            }
        }

        function exibirAlunosTurma(alunos, container) {
            if (!alunos || alunos.length === 0) {
                container.innerHTML = '<div class="no-data">Nenhum aluno cadastrado em suas turmas</div>';
                return;
            }

            const html = alunos.map(aluno => `
                <div class="aluno-card">
                    <div class="aluno-info">
                        <div class="aluno-nome">${aluno.nome}</div>
                        <div class="aluno-detalhes">Turma: ${aluno.turma} | Idade: ${aluno.idade} anos</div>
                    </div>
                    <div class="aluno-actions">
                        <button class="btn-remover" onclick="removerAlunoTurma(${aluno.id})">Remover da Turma</button>
                    </div>
                </div>
            `).join('');

            container.innerHTML = html;
        }

        function exibirAlunosSemTurma(alunos, container) {
            if (!alunos || alunos.length === 0) {
                container.innerHTML = '<div class="no-data">Nenhum aluno sem turma encontrado</div>';
                return;
            }

            const html = alunos.map(aluno => `
                <div class="aluno-card">
                    <div class="aluno-info">
                        <div class="aluno-nome">${aluno.nome}</div>
                        <div class="aluno-detalhes">Idade: ${aluno.idade} anos</div>
                    </div>
                    <div class="aluno-actions">
                        <button class="btn-adicionar" onclick="adicionarAlunoTurma(${aluno.id})" data-aluno-id="${aluno.id}">Adicionar à Turma</button>
                    </div>
                </div>
            `).join('');

            container.innerHTML = html;
            
            // Adicionar event listeners aos botões
            container.querySelectorAll('.btn-adicionar').forEach(button => {
                button.addEventListener('click', function() {
                    const alunoId = this.getAttribute('data-aluno-id');
                    console.log('Botão clicado, ID do aluno:', alunoId);
                    adicionarAlunoTurma(parseInt(alunoId));
                });
            });
        }

        async function adicionarAlunoTurma(alunoId) {
            console.log('Função adicionarAlunoTurma chamada com ID:', alunoId);
            const token = localStorage.getItem('token');
            
            if (!token) {
                mostrarErro('Token de autenticação não encontrado. Faça login novamente.');
                return;
            }
            
            // Primeiro, carregar as turmas do professor
            try {
                const turmasResponse = await fetch('http://localhost:3000/api/turmas', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!turmasResponse.ok) {
                    mostrarErro('Erro ao carregar turmas');
                    return;
                }

                const turmasData = await turmasResponse.json();
                console.log('Dados das turmas:', turmasData);
                
                if (!turmasData.success || turmasData.data.length === 0) {
                    mostrarErro('Você não possui turmas cadastradas');
                    return;
                }

                // Mostrar seletor de turma
                const turmas = turmasData.data;
                
                // Criar uma lista mais amigável
                const turmasLista = turmas.map((turma, index) => 
                    `${index + 1}. ${turma.nome} (ID: ${turma.id})`
                ).join('\n');

                const turmaId = prompt(`Selecione a turma para adicionar o aluno:\n\n${turmasLista}\n\nDigite o ID da turma:`);
                
                if (!turmaId || turmaId.trim() === '') {
                    return;
                }

                // Validar se o ID da turma existe
                const turmaSelecionada = turmas.find(t => t.id == turmaId);
                if (!turmaSelecionada) {
                    mostrarErro('ID da turma inválido. Tente novamente.');
                    return;
                }

                // Adicionar aluno à turma
                console.log('Enviando requisição para adicionar aluno:', { alunoId, turmaId });
                
                const response = await fetch(`http://localhost:3000/api/turmas/${turmaId}/alunos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ alunoId: alunoId })
                });

                console.log('Resposta da API:', response.status, response.statusText);
                const data = await response.json();
                console.log('Dados da resposta:', data);
                
                if (data.success) {
                    mostrarSucesso('Aluno adicionado à turma com sucesso!');
                    await carregarAlunosTurma();
                    await carregarAlunosSemTurma();
                } else {
                    mostrarErro('Erro ao adicionar aluno à turma: ' + data.message);
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarErro('Erro de conexão');
            }
        }

        async function removerAlunoTurma(alunoId) {
            if (!confirm('Tem certeza que deseja remover este aluno da turma?')) {
                return;
            }

            const token = localStorage.getItem('token');
            
            try {
                const response = await fetch(`http://localhost:3000/api/turmas/aluno/${alunoId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                
                if (data.success) {
                    mostrarSucesso('Aluno removido da turma com sucesso!');
                    await carregarAlunosTurma();
                    await carregarAlunosSemTurma();
                } else {
                    mostrarErro('Erro ao remover aluno da turma: ' + data.message);
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarErro('Erro de conexão');
            }
        }