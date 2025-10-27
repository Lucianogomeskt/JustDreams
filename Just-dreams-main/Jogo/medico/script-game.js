document.addEventListener('DOMContentLoaded', () => {
    const mathQuestion = document.getElementById('math-question');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('submit-button');
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const healthBar = document.getElementById('health-bar');
    const gameFeedback = document.getElementById('game-feedback');

    let currentQuestion = {};
    let patientHealth = 50; // Começa com 50% de saúde
    const MAX_HEALTH = 100;
    const MIN_HEALTH = 0;
    const HEALTH_PER_CORRECT = 20;
    const HEALTH_PER_INCORRECT = 10;

    // Variáveis para controle do progresso
    let sessaoJogo = null;
    let perguntaAtual = 0;
    let tempoInicioPergunta = 0;
    let estatisticas = {
        acertos: 0,
        erros: 0,
        tempoTotal: 0,
        tentativas: []
    };

    // Verificar se o usuário está logado (com suporte a BYPASS)
    const urlParams = new URLSearchParams(window.location.search);
    const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log('=== DEBUG DO JOGO ===');
    console.log('Token:', token);
    console.log('User:', user);
    console.log('User tipo:', user.tipo);
    console.log('User ID:', user.id);
    console.log('====================');
    
    if (!token && !bypassEnabled) {
        console.log('ERRO: Token não encontrado - criando usuário de teste');
        // Criar usuário de teste para funcionar offline
        const userTeste = { id: 0, nome: 'Usuário Teste', tipo: 'aluno' };
        localStorage.setItem('user', JSON.stringify(userTeste));
        localStorage.setItem('BYPASS_AUTH', 'true');
        console.log('Usuário de teste criado para modo offline');
    }
    
    if (!user || !user.id) {
        if (bypassEnabled) {
            // Mock de usuário quando bypass
            localStorage.setItem('user', JSON.stringify({ id: 0, nome: 'Dev Bypass', tipo: 'aluno' }));
        } else {
        console.log('ERRO: Usuário não encontrado - criando usuário de teste');
        // Criar usuário de teste para funcionar offline
        const userTeste = { id: 0, nome: 'Usuário Teste', tipo: 'aluno' };
        localStorage.setItem('user', JSON.stringify(userTeste));
        localStorage.setItem('BYPASS_AUTH', 'true');
        console.log('Usuário de teste criado para modo offline');
        }
    }
    
    if (user.tipo !== 'aluno' && !bypassEnabled) {
        console.log('ERRO: Tipo de usuário incorreto:', user.tipo);
        // Criar usuário de teste para funcionar offline
        const userTeste = { id: 0, nome: 'Usuário Teste', tipo: 'aluno' };
        localStorage.setItem('user', JSON.stringify(userTeste));
        localStorage.setItem('BYPASS_AUTH', 'true');
        console.log('Usuário de teste criado para modo offline');
    }

    // Recarregar usuário após possíveis correções
    const userAtualizado = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Usuário atualizado:', userAtualizado);
    
    // Carregar informações do personagem e profissão escolhidos (específico para o usuário)
    const personagemKey = `personagemEscolhido_${userAtualizado.id}`;
    const profissaoKey = `profissaoEscolhida_${userAtualizado.id}`;
    const personagemEscolhido = localStorage.getItem(personagemKey);
    const profissaoEscolhida = localStorage.getItem(profissaoKey);
    
    if (!personagemEscolhido || !profissaoEscolhida) {
        console.log('Personagem ou profissão não encontrados - usando valores padrão');
        // Usar valores padrão para funcionar offline
        localStorage.setItem('personagemEscolhido_0', 'joao');
        localStorage.setItem('profissaoEscolhida_0', 'medico');
        console.log('Valores padrão definidos para modo offline');
        // Recarregar valores após definir padrões
        const personagemEscolhidoFinal = localStorage.getItem('personagemEscolhido_0');
        const profissaoEscolhidaFinal = localStorage.getItem('profissaoEscolhida_0');
        configurarPersonagemEProfissao(personagemEscolhidoFinal, profissaoEscolhidaFinal);
        return;
    }

    // Configurar informações do personagem e profissão
    configurarPersonagemEProfissao(personagemEscolhido, profissaoEscolhida);
    // Atualizar avatar visual com imagem correspondente
    try {
        const avatarImg = document.getElementById('player-avatar');
        if (avatarImg) {
            const avatarSrc = mapearAvatarImagem(profissaoEscolhida, personagemEscolhido);
            if (avatarSrc) {
                avatarImg.src = avatarSrc;
            }
        }
    } catch (e) { console.log('Avatar image setup error', e); }

    // Inicializar fase atual se não existir (específico para o usuário)
    const faseKey = `faseAtual_${user.id}`;
    if (!localStorage.getItem(faseKey)) {
        localStorage.setItem(faseKey, '1');
    }

    // Função para configurar personagem e profissão
    function configurarPersonagemEProfissao(personagem, profissao) {
        const personagens = {
            'joao': { nome: 'João', avatar: '👦' },
            'maria': { nome: 'Maria', avatar: '👧' },
            'pedro': { nome: 'Pedro', avatar: '🧑' },
            'ana': { nome: 'Ana', avatar: '👩' },
            'lucas': { nome: 'Lucas', avatar: '👨' },
            'sofia': { nome: 'Sofia', avatar: '👩‍🎓' }
        };

        const profissoes = {
            'medico': { nome: 'Médico', titulo: 'Curando com Matemática!', subtitulo: 'Ajude seus pacientes resolvendo problemas matemáticos.' },
            'engenheiro': { nome: 'Engenheiro', titulo: 'Construindo com Matemática!', subtitulo: 'Construa estruturas incríveis resolvendo cálculos matemáticos.' },
            'astronauta': { nome: 'Astronauta', titulo: 'Explorando com Matemática!', subtitulo: 'Explore o espaço calculando trajetórias e distâncias.' },
            'chef': { nome: 'Chef', titulo: 'Cozinhando com Matemática!', subtitulo: 'Crie pratos deliciosos calculando ingredientes e proporções.' },
            'artista': { nome: 'Artista', titulo: 'Criando com Matemática!', subtitulo: 'Crie obras de arte usando geometria e proporções matemáticas.' },
            'cientista': { nome: 'Cientista', titulo: 'Descobrindo com Matemática!', subtitulo: 'Faça descobertas incríveis através de cálculos e experimentos.' }
        };

        const personagemInfo = personagens[personagem] || { nome: 'Personagem', avatar: '👤' };
        const profissaoInfo = profissoes[profissao] || { nome: 'Profissão', titulo: 'Jogando com Matemática!', subtitulo: 'Resolva problemas matemáticos.' };

        // Atualizar elementos da interface
        document.getElementById('character-avatar').textContent = personagemInfo.avatar;
        document.getElementById('character-name').textContent = personagemInfo.nome;
        document.getElementById('character-profession').textContent = profissaoInfo.nome;
        document.getElementById('game-title').textContent = profissaoInfo.titulo;
        document.getElementById('game-subtitle').textContent = profissaoInfo.subtitulo;
    }

    // Função para gerar uma pergunta de matemática
    function generateQuestion() {
        const num1 = Math.floor(Math.random() * 9) + 1; // Números de 1 a 9
        const num2 = Math.floor(Math.random() * 9) + 1;
        const operation = Math.random() > 0.5 ? '+' : '-'; // 50% chance de adição ou subtração

        let questionText;
        let correctAnswer;

        if (operation === '+') {
            questionText = `Quanto é ${num1} + ${num2}?`;
            correctAnswer = num1 + num2;
        } else {
            // Garante que o resultado da subtração não seja negativo para crianças
            if (num1 < num2) {
                questionText = `Quanto é ${num2} - ${num1}?`;
                correctAnswer = num2 - num1;
            } else {
                questionText = `Quanto é ${num1} - ${num2}?`;
                correctAnswer = num1 - num2;
            }
        }

        return { questionText, correctAnswer };
    }

    // Função para atualizar a barra de saúde
    function updateHealthBar() {
        healthBar.style.width = `${patientHealth}%`;
        
        // Ajusta a cor da barra de saúde com base na porcentagem
        if (patientHealth <= 20) {
            healthBar.style.backgroundColor = '#e03e3e'; // Vermelho
        } else if (patientHealth <= 50) {
            healthBar.style.backgroundColor = '#ed7d24'; // Laranja
        } else if (patientHealth <= 80) {
            healthBar.style.backgroundColor = '#c9e13a'; // Verde claro
        } else {
            healthBar.style.backgroundColor = '#5ab173'; // Verde escuro
        }
    }

    // Função para iniciar sessão de jogo na API
    async function iniciarSessaoJogo() {
        if (bypassEnabled) {
            // Pular chamadas à API quando em bypass
            sessaoJogo = { sessao_id: 'bypass', iniciado_em: Date.now() };
            return true;
        }
        try {
            const response = await fetch('http://localhost:3000/api/progresso-jogo/iniciar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fase_id: 1,
                    nivel_dificuldade: 1
                })
            });

            const data = await response.json();
            
            if (data.success) {
                sessaoJogo = data.data;
                console.log('Sessão de jogo iniciada:', sessaoJogo);
                return true;
            } else {
                console.error('Erro ao iniciar sessão:', data.message);
                return false;
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            return false;
        }
    }

    // Função para registrar resposta na API
    async function registrarResposta(correta, tempoResposta, operacao) {
        if (!sessaoJogo) return;
        if (bypassEnabled) {
            // Em bypass apenas loga localmente
            console.log('BYPASS registrarResposta', { correta, tempoResposta, operacao });
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/progresso-jogo/resposta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessao_id: sessaoJogo.sessao_id,
                    pergunta_id: perguntaAtual,
                    resposta: parseInt(answerInput.value),
                    correta: correta,
                    tempo_resposta: tempoResposta,
                    operacao: operacao
                })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log('Resposta registrada:', data.data);
                // As estatísticas locais já foram atualizadas na função checkAnswer
                // Aqui apenas logamos os dados da API para debug
            } else {
                console.error('Erro ao registrar resposta:', data.message);
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
        }
    }

    // Função para finalizar sessão de jogo na API
    async function finalizarSessaoJogo() {
        if (!sessaoJogo) return;
        if (bypassEnabled) {
            console.log('BYPASS finalizarSessaoJogo');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/progresso-jogo/finalizar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessao_id: sessaoJogo.sessao_id
                })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log('Sessão finalizada:', data.data);
                // Mostrar medalha conquistada
                if (data.data.medalha) {
                    const medalhas = {
                        'bronze': '🥉',
                        'prata': '🥈',
                        'ouro': '🥇',
                        'diamante': '💎'
                    };
                    gameFeedback.textContent += ` ${medalhas[data.data.medalha]} Medalha ${data.data.medalha}!`;
                }
            } else {
                console.error('Erro ao finalizar sessão:', data.message);
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
        }
    }

    // Função para iniciar o jogo
    async function startGame() {
        // Iniciar sessão na API
        const sessaoIniciada = await iniciarSessaoJogo();
        if (!sessaoIniciada) {
            alert('Erro ao iniciar sessão de jogo. Tente novamente.');
            return;
        }

        // Resetar variáveis do jogo
        patientHealth = 50;
        perguntaAtual = 0;
        estatisticas = { acertos: 0, erros: 0, tempoTotal: 0, tentativas: [] };
        
        updateHealthBar();
        gameFeedback.textContent = '';
        answerInput.value = '';
        answerInput.disabled = false;
        submitButton.disabled = false;
        startButton.disabled = true;
        resetButton.disabled = false;

        nextQuestion();
    }

    // Função para gerar a próxima pergunta
    function nextQuestion() {
        currentQuestion = generateQuestion();
        mathQuestion.textContent = currentQuestion.questionText;
        answerInput.value = ''; // Limpa o input
        gameFeedback.textContent = ''; // Limpa o feedback
        answerInput.focus(); // Coloca o foco no input
        
        // Registrar início da pergunta
        perguntaAtual++;
        tempoInicioPergunta = Date.now();
    }

    // Função para verificar a resposta
    async function checkAnswer() {
        const playerAnswer = parseInt(answerInput.value);

        if (isNaN(playerAnswer)) {
            gameFeedback.textContent = 'Por favor, digite um número!';
            gameFeedback.className = 'game-feedback incorrect';
            return;
        }

        // Calcular tempo de resposta
        const tempoResposta = (Date.now() - tempoInicioPergunta) / 1000; // em segundos
        const correta = playerAnswer === currentQuestion.correctAnswer;
        
        // Determinar operação usada
        const operacao = currentQuestion.questionText.includes('+') ? '+' : '-';

        // Registrar resposta na API
        await registrarResposta(correta, tempoResposta, operacao);

        if (correta) {
            gameFeedback.textContent = 'Correto! O paciente melhorou um pouco!';
            gameFeedback.className = 'game-feedback correct';
            patientHealth = Math.min(MAX_HEALTH, patientHealth + HEALTH_PER_CORRECT);
            estatisticas.acertos += 1;
            console.log('Resposta correta! Acertos:', estatisticas.acertos);
        } else {
            gameFeedback.textContent = `Errado! A resposta correta era ${currentQuestion.correctAnswer}. O paciente piorou!`;
            gameFeedback.className = 'game-feedback incorrect';
            patientHealth = Math.max(MIN_HEALTH, patientHealth - HEALTH_PER_INCORRECT);
            estatisticas.erros += 1;
            console.log('Resposta errada! Erros:', estatisticas.erros);
        }

        updateHealthBar();
        checkGameEnd();
    }

    // Função para verificar se o jogo terminou
    async function checkGameEnd() {
        if (patientHealth >= MAX_HEALTH) {
            gameFeedback.textContent = 'Parabéns! Você curou o paciente!';
            gameFeedback.className = 'game-feedback win';
            await endGame();
        } else if (patientHealth <= MIN_HEALTH) {
            gameFeedback.textContent = 'Oh não! O paciente não resistiu...';
            gameFeedback.className = 'game-feedback lose';
            await endGame();
        } else {
            // Se o jogo não terminou, vá para a próxima pergunta após um pequeno atraso
            setTimeout(nextQuestion, 1500); 
        }
    }

    // Função para finalizar o jogo
    async function endGame() {
        // Finalizar sessão na API
        await finalizarSessaoJogo();
        
        answerInput.disabled = true;
        submitButton.disabled = true;
        startButton.disabled = false; // Permite iniciar novo jogo
        resetButton.disabled = true;
        
        // Mostrar estatísticas finais
        const totalRespostas = estatisticas.acertos + estatisticas.erros;
        let taxaAcerto = 0;
        if (totalRespostas > 0) {
            taxaAcerto = (estatisticas.acertos / totalRespostas) * 100;
        }
        
        console.log('Estatísticas finais:', estatisticas);
        gameFeedback.textContent += `\n\n📊 Estatísticas: ${estatisticas.acertos} acertos, ${estatisticas.erros} erros (${taxaAcerto.toFixed(1)}% de acerto)`;
        
        // Marcar que o jogo foi completado (específico para o usuário)
        const jogoCompletadoKey = `jogoCompletado_${user.id}`;
        localStorage.setItem(jogoCompletadoKey, 'true');
        
        // Avançar para próxima fase (específico para o usuário)
        const faseKey = `faseAtual_${user.id}`;
        const faseAtual = parseInt(localStorage.getItem(faseKey) || '1');
        localStorage.setItem(faseKey, (faseAtual + 1).toString());
        
        // Mostrar botão de avançar
        const advanceButton = document.getElementById('advance-button');
        advanceButton.style.display = 'block';
    }

    // Event Listeners
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', startGame); // Reinicia o jogo
    submitButton.addEventListener('click', checkAnswer);
    document.getElementById('advance-button').addEventListener('click', () => {
        // Redirecionar para a árvore de habilidades
        window.location.href = 'http://localhost:3000/Just-dreams-main/JustDreams/pages/progresso/html/arvore_habilidades.html';
    });
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !submitButton.disabled) {
            checkAnswer();
        }
    });

    // Inicializa a barra de saúde ao carregar a página
    updateHealthBar();
});