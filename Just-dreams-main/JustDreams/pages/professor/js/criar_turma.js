// Função para gerar código da turma (mesma lógica do backend)
        function gerarCodigoTurma(nome) {
            if (!nome || nome.trim() === '') return '';
            
            // Para o formato 1°A, usar o próprio nome como base
            // Remover o símbolo ° e adicionar timestamp
            let codigo = nome.replace('°', '');
            const timestamp = Date.now().toString().slice(-4);
            codigo += timestamp;
            
            return codigo;
        }

        document.addEventListener('DOMContentLoaded', () => {
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
            const form = document.getElementById('criar-turma-form');
            const nomeInput = document.getElementById('nome');
            const codigoDisplay = document.getElementById('codigo-gerado');

            // Gerar código em tempo real quando o nome mudar
            nomeInput.addEventListener('input', (e) => {
                const nome = e.target.value;
                const codigo = gerarCodigoTurma(nome);
                
                if (codigo) {
                    codigoDisplay.textContent = codigo;
                    codigoDisplay.classList.add('ativo');
                } else {
                    codigoDisplay.textContent = 'Digite a turma para ver o código';
                    codigoDisplay.classList.remove('ativo');
                }
            });

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await criarTurma();
            });
        });

        async function criarTurma() {
            const form = document.getElementById('criar-turma-form');
            const formData = new FormData(form);
            
            const turmaData = {
                nome: formData.get('nome'),
                descricao: formData.get('descricao'),
                nivel: formData.get('nivel'),
                capacidade: parseInt(formData.get('capacidade')),
                turno: formData.get('turno')
            };

            // Validar dados obrigatórios
            if (!turmaData.nome || turmaData.nome.trim() === '') {
                mostrarErro('O nome da turma é obrigatório.');
                return;
            }

            // Validar formato da turma (número + ° + letra)
            const turmaRegex = /^[0-9]+°[A-Za-z]$/;
            if (!turmaRegex.test(turmaData.nome.trim())) {
                mostrarErro('A turma deve estar no formato: número + ° + letra (ex: 1°A, 2°B, 3°C).');
                return;
            }

            const token = localStorage.getItem('token');
            const btnSubmit = document.getElementById('btn-submit');
            
            try {
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Criando...';

                const response = await fetch('http://localhost:3000/api/turmas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(turmaData)
                });

                const data = await response.json();
                
                if (data.success) {
                    mostrarSucesso(`Turma criada com sucesso! Código: ${data.data.codigo}`);
                    form.reset();
                    
                    // Redirecionar após 3 segundos
                    setTimeout(() => {
                        window.location.href = 'gerenciar_turmas.html';
                    }, 3000);
                } else {
                    mostrarErro('Erro ao criar turma: ' + data.message);
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarErro('Erro de conexão. Verifique se o servidor está rodando.');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Criar Turma';
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