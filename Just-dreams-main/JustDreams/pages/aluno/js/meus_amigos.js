 document.addEventListener('DOMContentLoaded', () => {
            carregarAmigos();
            carregarSolicitacoesPendentes();
        });

        // Função para adicionar amigo por ID
        async function adicionarAmigoPorId() {
            const friendId = document.getElementById('friendId').value;
            
            if (!friendId) {
                mostrarNotificacao('Por favor, digite um ID válido', 'error');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const userId = JSON.parse(localStorage.getItem('user')).id;

                console.log('Tentando adicionar amigo:', { friendId, userId, token: token ? 'presente' : 'ausente' });

                // Primeiro, verifica se o ID existe
                const checkResponse = await fetch(`http://localhost:3000/api/amizades/alunoid/${friendId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Resposta da verificação:', checkResponse.status);

                if (!checkResponse.ok) {
                    if (checkResponse.status === 404) {
                        mostrarNotificacao('ID não encontrado. Verifique o número e tente novamente.', 'error');
                    } else {
                        throw new Error('Erro ao verificar ID do aluno');
                    }
                    return;
                }

                const aluno = await checkResponse.json();
                console.log('Aluno encontrado:', aluno);

                // Verifica se não está tentando adicionar a si mesmo
                if (parseInt(friendId) === userId) {
                    mostrarNotificacao('Você não pode adicionar a si mesmo como amigo', 'error');
                    return;
                }

                // Tenta adicionar o amigo
                const response = await fetch('http://localhost:3000/api/amizades/adicionar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        amigoId: parseInt(friendId)
                    })
                });

                console.log('Resposta da adição:', response.status);

                const data = await response.json();

                if (response.ok) {
                    mostrarNotificacao(`Solicitação de amizade enviada para ${aluno.nome}!`, 'success');
                    document.getElementById('friendId').value = ''; // Limpa o campo
                    carregarAmigos(); // Atualiza a lista
                } else {
                    throw new Error(data.mensagem || 'Erro ao adicionar amigo');
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarNotificacao(error.message || 'Erro ao adicionar amigo', 'error');
            }
        }


        // Adicionar evento de tecla Enter no campo de busca
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('friendId').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    adicionarAmigoPorId();
                }
            });
        });

        async function carregarAmigos() {
            const friendsList = document.getElementById('friends-list');
            const loading = document.getElementById('loading');

            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user'));

                const response = await fetch('http://localhost:3000/api/amizades/meus-amigos', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Erro ao carregar amigos');

                const amigos = await response.json();

                if (amigos.length === 0) {
                    friendsList.innerHTML = `
                        <div class="no-friends">
                            <i class="fas fa-user-friends fa-3x" style="color: #ccc; margin-bottom: 15px;"></i>
                            <h3>Você ainda não tem amigos</h3>
                            <p>Que tal começar adicionando alguns colegas?</p>
                            <div class="add-friend-options" style="margin-top: 20px; text-align: center;">
                                <div class="search-by-id" style="margin-bottom: 20px; max-width: 300px; margin-left: auto; margin-right: auto;">
                                    <input type="number" id="friendId" placeholder="Digite o ID do amigo" 
                                        style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ddd; margin-bottom: 10px;">
                                    <button onclick="adicionarAmigoPorId()" class="btn-action btn-message" style="width: 100%;">
                                        <i class="fas fa-plus"></i> Adicionar por ID
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    friendsList.innerHTML = amigos.map(amigo => `
                        <div class="friend-card">
                            <div class="friend-avatar">
                                ${obterIniciaisNome(amigo.nome)}
                            </div>
                            <div class="friend-info">
                                <div class="friend-name">${amigo.nome}</div>
                                <div class="friend-details">
                                    <div>ID: ${amigo.id}</div>
                                    <div>Turma: ${amigo.turma || 'Não especificada'}</div>
                                </div>
                            </div>
                            <div class="friend-actions">
                                <button class="btn-action btn-message" onclick="enviarMensagem(${amigo.id})">
                                    <i class="fas fa-comment"></i>
                                </button>
                                <button class="btn-action btn-remove" onclick="removerAmigo(${amigo.id})">
                                    <i class="fas fa-user-minus"></i>
                                </button>
                            </div>
                        </div>
                    `).join('');
                }
            } catch (error) {
                console.error('Erro:', error);
                friendsList.innerHTML = `
                    <div class="no-friends" style="color: #dc3545;">
                        <i class="fas fa-exclamation-triangle fa-3x" style="margin-bottom: 15px;"></i>
                        <h3>Erro ao carregar amigos</h3>
                        <p>Tente novamente mais tarde</p>
                    </div>
                `;
            } finally {
                loading.style.display = 'none';
                friendsList.style.display = 'grid';
            }
        }

        async function carregarSolicitacoesPendentes() {
            const requestsContainer = document.getElementById('pending-requests');
            const requestsList = document.getElementById('requests-list');
            const noRequestsDiv = document.getElementById('no-pending-requests');

            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                
                console.log('DEBUG carregarSolicitacoesPendentes:');
                console.log('- Token:', token ? 'presente' : 'ausente');
                console.log('- User:', user);
                
                if (!token) {
                    throw new Error('Token não encontrado');
                }
                
                if (!user || !user.id) {
                    throw new Error('Usuário não encontrado');
                }

                const response = await fetch('http://localhost:3000/api/amizades/solicitacoes-pendentes', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('DEBUG resposta:', response.status, response.statusText);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Erro na resposta:', errorText);
                    throw new Error(`Erro ${response.status}: ${errorText}`);
                }

                const solicitacoes = await response.json();
                console.log('DEBUG solicitacoes:', solicitacoes);

                if (solicitacoes.length > 0) {
                    requestsContainer.style.display = 'block';
                    noRequestsDiv.style.display = 'none';
                    
                    requestsList.innerHTML = solicitacoes.map(solicitacao => `
                        <div class="request-card">
                            <div class="request-info">
                                <div class="request-avatar">
                                    ${obterIniciaisNome(solicitacao.remetente.nome)}
                                </div>
                                <div class="request-details">
                                    <h4>${solicitacao.remetente.nome}</h4>
                                    <p>ID: ${solicitacao.remetente.id}</p>
                                </div>
                            </div>
                            <div class="request-actions">
                                <button class="btn-accept" onclick="responderSolicitacao(${solicitacao.id}, 'aceitar')">
                                    Aceitar
                                </button>
                                <button class="btn-decline" onclick="responderSolicitacao(${solicitacao.id}, 'recusar')">
                                    Recusar
                                </button>
                            </div>
                        </div>
                    `).join('');
                } else {
                    requestsContainer.style.display = 'block';
                    requestsList.innerHTML = '';
                    noRequestsDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Erro:', error);
                requestsContainer.style.display = 'block';
                requestsList.innerHTML = `
                    <div class="no-pending-requests">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Erro ao carregar solicitações: ${error.message}</p>
                    </div>
                `;
            }
        }

        async function removerAmigo(amigoId) {
            if (!confirm('Tem certeza que deseja remover este amigo?')) return;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/api/amizades/remover/${amigoId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Erro ao remover amigo');

                mostrarNotificacao('Amigo removido com sucesso!', 'success');
                carregarAmigos();
            } catch (error) {
                console.error('Erro:', error);
                mostrarNotificacao('Erro ao remover amigo', 'error');
            }
        }

        async function responderSolicitacao(solicitacaoId, resposta) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/api/amizades/responder/${solicitacaoId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ resposta })
                });

                if (!response.ok) throw new Error('Erro ao responder solicitação');

                // Mostrar feedback visual discreto
                const mensagem = resposta === 'aceitar' ? 
                    'Solicitação aceita!' : 
                    'Solicitação recusada.';
                
                mostrarNotificacao(mensagem, resposta === 'aceitar' ? 'success' : 'info');
                
                // Recarregar as listas
                carregarSolicitacoesPendentes();
                if (resposta === 'aceitar') {
                    carregarAmigos();
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarNotificacao('Erro ao responder solicitação', 'error');
            }
        }

        // Função para formatar data
        function formatarData(dataString) {
            const data = new Date(dataString);
            const agora = new Date();
            const diffMs = agora - data;
            const diffMinutos = Math.floor(diffMs / (1000 * 60));
            const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMinutos < 1) return 'Agora mesmo';
            if (diffMinutos < 60) return `${diffMinutos} min atrás`;
            if (diffHoras < 24) return `${diffHoras}h atrás`;
            if (diffDias < 7) return `${diffDias} dias atrás`;
            
            return data.toLocaleDateString('pt-BR');
        }

        function obterIniciaisNome(nome) {
            return nome
                .split(' ')
                .map(palavra => palavra[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
        }

        function enviarMensagem(amigoId) {
            // Implementação futura do sistema de mensagens
            alert('Funcionalidade de mensagens em desenvolvimento!');
        }

        function mostrarNotificacao(mensagem, tipo) {
            const notificacao = document.createElement('div');
            notificacao.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                animation: slideIn 0.5s ease-out;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                max-width: 350px;
            `;
            
            // Definir cores baseadas no tipo
            switch(tipo) {
                case 'success':
                    notificacao.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                    break;
                case 'error':
                    notificacao.style.background = 'linear-gradient(135deg, #dc3545, #e74c3c)';
                    break;
                case 'info':
                    notificacao.style.background = 'linear-gradient(135deg, #17a2b8, #20c997)';
                    break;
                default:
                    notificacao.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';
            }
            
            notificacao.textContent = mensagem;
            
            document.body.appendChild(notificacao);
            
            setTimeout(() => {
                notificacao.style.animation = 'slideOut 0.5s ease-out';
                setTimeout(() => notificacao.remove(), 500);
            }, 4000);
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
    