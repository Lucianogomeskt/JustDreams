 let personagemEscolhido = null;
        let profissaoEscolhida = null;
        let fasesCompletadas = 0;
        let totalFases = 0;

        document.addEventListener('DOMContentLoaded', () => {
            // Verificar se o usuário está logado (com BYPASS)
            const urlParams = new URLSearchParams(window.location.search);
            const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
  /*          
            if ((!token || user.tipo !== 'aluno') && !bypassEnabled) {
                alert('Você precisa estar logado como aluno!');
                window.location.href = 'aluno_login.html';
                return;
            }
   */        
            if (bypassEnabled && (!user || !user.id)) {
                const mock = { id: 0, nome: 'Dev Bypass', tipo: 'aluno' };
                localStorage.setItem('user', JSON.stringify(mock));
            }

            // Carregar informações do personagem e profissão (específico para o usuário)
            const personagemKey = `personagemEscolhido_${user.id}`;
            const profissaoKey = `profissaoEscolhida_${user.id}`;
            personagemEscolhido = localStorage.getItem(personagemKey);
            profissaoEscolhida = localStorage.getItem(profissaoKey);
            
            if ((!personagemEscolhido || !profissaoEscolhida)) {
                if (bypassEnabled) {
                    // Defaults em modo bypass
                    personagemEscolhido = 'joao';
                    profissaoEscolhida = 'medico';
                    localStorage.setItem(personagemKey, personagemEscolhido);
                    localStorage.setItem(profissaoKey, profissaoEscolhida);
                } else {
                    alert('Por favor, escolha seu personagem e profissão primeiro!');
                    window.location.href = 'escolha_profissao.html';
                    return;
                }
            }

            // Configurar informações do personagem
            configurarPersonagem();

            // Carregar jornada
            carregarJornada();
        });

        function configurarPersonagem() {
            const personagens = {
                'joao': { nome: 'João', avatar: '👦' },
                'maria': { nome: 'Maria', avatar: '👧' },
                'pedro': { nome: 'Pedro', avatar: '🧑' },
                'ana': { nome: 'Ana', avatar: '👩' },
                'lucas': { nome: 'Lucas', avatar: '👨' },
                'sofia': { nome: 'Sofia', avatar: '👩‍🎓' }
            };

            const profissoes = {
                'medico': { nome: 'Médico' },
                'engenheiro': { nome: 'Engenheiro' },
                'astronauta': { nome: 'Astronauta' },
                'chef': { nome: 'Chef' },
                'artista': { nome: 'Artista' },
                'cientista': { nome: 'Cientista' }
            };

            const personagemInfo = personagens[personagemEscolhido] || { nome: 'Personagem', avatar: '👤' };
            const profissaoInfo = profissoes[profissaoEscolhida] || { nome: 'Profissão' };

            document.getElementById('character-avatar').textContent = personagemInfo.avatar;
            document.getElementById('character-name').textContent = personagemInfo.nome;
            document.getElementById('character-profession').textContent = profissaoInfo.nome;
        }

        function carregarJornada() {
            // Simular carregamento
            setTimeout(() => {
                exibirJornada();
                document.getElementById('loading').style.display = 'none';
                document.getElementById('content').style.display = 'block';
            }, 1000);
        }

        function exibirJornada() {
            // Verificar se o usuário completou o jogo recentemente (específico para o usuário)
            const jogoCompletadoKey = `jogoCompletado_${user.id}`;
            const faseKey = `faseAtual_${user.id}`;
            const jogoCompletado = localStorage.getItem(jogoCompletadoKey);
            const faseAtual = parseInt(localStorage.getItem(faseKey) || '1');
            
            // Dados simulados da jornada
            const jornada = {
                fases: [
                    {
                        id: 1,
                        titulo: 'Primeiros Passos',
                        descricao: 'Aprenda o básico da matemática e comece sua jornada profissional.',
                        objetivos: [
                            { texto: 'Resolver 10 problemas de adição', completado: faseAtual > 1 || jogoCompletado },
                            { texto: 'Resolver 10 problemas de subtração', completado: faseAtual > 1 || jogoCompletado },
                            { texto: 'Obter 80% de acerto', completado: faseAtual > 1 || jogoCompletado }
                        ],
                        status: faseAtual > 1 || jogoCompletado ? 'completed' : 'current'
                    },
                    {
                        id: 2,
                        titulo: 'Desenvolvimento',
                        descricao: 'Aprofunde seus conhecimentos e desenvolva suas habilidades.',
                        objetivos: [
                            { texto: 'Resolver 15 problemas de multiplicação', completado: faseAtual > 2 },
                            { texto: 'Resolver 15 problemas de divisão', completado: faseAtual > 2 },
                            { texto: 'Obter 85% de acerto', completado: faseAtual > 2 }
                        ],
                        status: faseAtual > 2 ? 'completed' : (faseAtual === 2 ? 'current' : 'locked')
                    },
                    {
                        id: 3,
                        titulo: 'Especialização',
                        descricao: 'Torne-se um especialista em sua área de atuação.',
                        objetivos: [
                            { texto: 'Resolver 20 problemas complexos', completado: faseAtual > 3 },
                            { texto: 'Obter 90% de acerto', completado: faseAtual > 3 },
                            { texto: 'Completar em menos de 5 minutos', completado: faseAtual > 3 }
                        ],
                        status: faseAtual > 3 ? 'completed' : (faseAtual === 3 ? 'current' : 'locked')
                    },
                    {
                        id: 4,
                        titulo: 'Mestria',
                        descricao: 'Alcance o nível de mestre em sua profissão.',
                        objetivos: [
                            { texto: 'Resolver 25 problemas avançados', completado: faseAtual > 4 },
                            { texto: 'Obter 95% de acerto', completado: faseAtual > 4 },
                            { texto: 'Completar em menos de 3 minutos', completado: faseAtual > 4 }
                        ],
                        status: faseAtual > 4 ? 'completed' : (faseAtual === 4 ? 'current' : 'locked')
                    }
                ],
                conquistas: [
                    { id: 1, titulo: 'Primeiro Passo', descricao: 'Complete sua primeira fase', icon: '🎯', ganha: faseAtual > 1 },
                    { id: 2, titulo: 'Matemático', descricao: 'Resolva 50 problemas', icon: '🧮', ganha: faseAtual > 2 },
                    { id: 3, titulo: 'Velocista', descricao: 'Complete uma fase em menos de 2 minutos', icon: '⚡', ganha: faseAtual > 3 },
                    { id: 4, titulo: 'Perfeccionista', descricao: 'Obtenha 100% de acerto em uma fase', icon: '💯', ganha: faseAtual > 3 },
                    { id: 5, titulo: 'Mestre', descricao: 'Complete toda a jornada', icon: '👑', ganha: faseAtual > 4 }
                ]
            };

            // Calcular progresso
            fasesCompletadas = jornada.fases.filter(fase => fase.status === 'completed').length;
            totalFases = jornada.fases.length;
            const progresso = (fasesCompletadas / totalFases) * 100;

            // Atualizar barra de progresso
            document.getElementById('progress-fill').style.width = progresso + '%';
            document.getElementById('progress-text').textContent = Math.round(progresso) + '%';
            document.getElementById('progress-description').textContent = 
                `${fasesCompletadas} de ${totalFases} fases completadas`;

            // Exibir fases
            exibirFases(jornada.fases);

            // Exibir conquistas
            exibirConquistas(jornada.conquistas);
        }

        function exibirFases(fases) {
            const container = document.getElementById('phases-grid');
            container.innerHTML = '';

            fases.forEach(fase => {
                const faseCard = document.createElement('div');
                faseCard.className = `phase-card ${fase.status}`;
                
                const objetivosHtml = fase.objetivos.map(obj => `
                    <div class="objective-item">
                        <span class="objective-icon ${obj.completado ? 'objective-completed' : 'objective-pending'}">
                            ${obj.completado ? '✅' : '⭕'}
                        </span>
                        <span class="${obj.completado ? 'objective-completed' : 'objective-pending'}">
                            ${obj.texto}
                        </span>
                    </div>
                `).join('');

                const statusText = {
                    'completed': 'Concluída',
                    'current': 'Em Andamento',
                    'locked': 'Bloqueada'
                };

                const statusClass = {
                    'completed': 'status-completed',
                    'current': 'status-current',
                    'locked': 'status-locked'
                };

                faseCard.innerHTML = `
                    <div class="phase-header">
                        <div class="phase-title">${fase.titulo}</div>
                        <div class="phase-status ${statusClass[fase.status]}">
                            ${statusText[fase.status]}
                        </div>
                    </div>
                    <div class="phase-description">${fase.descricao}</div>
                    <div class="phase-objectives">
                        ${objetivosHtml}
                    </div>
                    <div class="phase-actions">
                        ${fase.status === 'completed' ? 
                            '<button class="btn-phase btn-continue" onclick="jogarFase(' + fase.id + ')">Jogar Novamente</button>' :
                            fase.status === 'current' ?
                            '<button class="btn-phase btn-start" onclick="jogarFase(' + fase.id + ')">Continuar</button>' :
                            '<button class="btn-phase btn-disabled" disabled>Bloqueada</button>'
                        }
                    </div>
                `;

                container.appendChild(faseCard);
            });
        }

        function exibirConquistas(conquistas) {
            const container = document.getElementById('achievements-grid');
            container.innerHTML = '';

            conquistas.forEach(conquista => {
                const achievementCard = document.createElement('div');
                achievementCard.className = `achievement-item ${conquista.ganha ? 'earned' : ''}`;
                
                achievementCard.innerHTML = `
                    <div class="achievement-icon">${conquista.icon}</div>
                    <div class="achievement-title">${conquista.titulo}</div>
                    <div class="achievement-desc">${conquista.descricao}</div>
                `;

                container.appendChild(achievementCard);
            });
        }

        function jogarFase(faseId) {
            // Verificar se a jornada foi completada
            if (faseId === totalFases && fasesCompletadas === totalFases - 1) {
                // Última fase - verificar se completou
                if (confirm('Esta é a última fase! Ao completá-la, você finalizará sua jornada. Deseja continuar?')) {
                    window.location.href = 'http://localhost:3000/Just-dreams-main/Jogo/game.html';
                }
            } else {
                window.location.href = 'http://localhost:3000/Just-dreams-main/Jogo/game.html';
            }
        }

        // Verificar se a jornada foi completada
        function verificarJornadaCompleta() {
            if (fasesCompletadas === totalFases) {
                // Redirecionar para página de parabéns
                setTimeout(() => {
                    window.location.href = 'parabens_jornada.html';
                }, 2000);
            }
        }

        // Verificar jornada completa ao carregar
        setTimeout(verificarJornadaCompleta, 2000);