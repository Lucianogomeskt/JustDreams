document.addEventListener('DOMContentLoaded', () => {
    const mathQuestion = document.getElementById('math-question');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('submit-button');
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const backButton = document.getElementById('back-button');
    const healthBar = document.getElementById('health-bar');
    const gameFeedback = document.getElementById('game-feedback');

    let currentQuestion = {};
    let patientHealth = 50; // Começa com 50% de saúde
    const MAX_HEALTH = 100;
    const MIN_HEALTH = 0;
    const HEALTH_PER_CORRECT = 20;
    const HEALTH_PER_INCORRECT = 10;

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

    // Função para iniciar o jogo
    function startGame() {
        console.log('Iniciando jogo do médico...');
        patientHealth = 50; // Reseta a saúde para o início
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
    }

    // Função para verificar a resposta
    function checkAnswer() {
        const playerAnswer = parseInt(answerInput.value);

        if (isNaN(playerAnswer)) {
            gameFeedback.textContent = 'Por favor, digite um número!';
            gameFeedback.className = 'game-feedback incorrect';
            return;
        }

        if (playerAnswer === currentQuestion.correctAnswer) {
            gameFeedback.textContent = 'Correto! O paciente melhorou um pouco!';
            gameFeedback.className = 'game-feedback correct';
            patientHealth = Math.min(MAX_HEALTH, patientHealth + HEALTH_PER_CORRECT);
        } else {
            gameFeedback.textContent = `Errado! A resposta correta era ${currentQuestion.correctAnswer}. O paciente piorou!`;
            gameFeedback.className = 'game-feedback incorrect';
            patientHealth = Math.max(MIN_HEALTH, patientHealth - HEALTH_PER_INCORRECT);
        }

        updateHealthBar();
        checkGameEnd();
    }

    // Função para verificar se o jogo terminou
    function checkGameEnd() {
        if (patientHealth >= MAX_HEALTH) {
            gameFeedback.textContent = 'Parabéns! Você curou o paciente!';
            gameFeedback.className = 'game-feedback win';
            
            // Calcular pontuação para o ranking (vitória)
            const gameScore = patientHealth * 5;
            
            // Adicionar pontos ao sistema de ranking
            if (window.rankingSystem) {
                window.rankingSystem.addGamePoints('medico', gameScore, true);
                window.rankingSystem.shareGameCompletion('Curando com Matemática', gameScore, true);
                console.log(`+${gameScore} pontos no jogo do médico!`);
            }
            
            endGame();
        } else if (patientHealth <= MIN_HEALTH) {
            gameFeedback.textContent = 'Oh não! O paciente não resistiu...';
            gameFeedback.className = 'game-feedback lose';
            
            // Calcular pontuação para o ranking (derrota)
            const gameScore = patientHealth;
            
            // Adicionar pontos ao sistema de ranking (sem completar)
            if (window.rankingSystem) {
                window.rankingSystem.addGamePoints('medico', gameScore, false);
                console.log(`+${gameScore} pontos no jogo do médico!`);
            }
            
            endGame();
        } else {
            // Se o jogo não terminou, vá para a próxima pergunta após um pequeno atraso
            setTimeout(nextQuestion, 1500); 
        }
    }

    // Função para finalizar o jogo
    function endGame() {
        answerInput.disabled = true;
        submitButton.disabled = true;
        startButton.disabled = false; // Permite iniciar novo jogo
    }

    // Função para voltar ao menu principal
    function goBackToMenu() {
        if (window.opener) {
            window.close();
        } else {
            // Se não foi aberto em nova janela, redireciona
            window.location.href = '../index.html';
        }
    }

    // Event Listeners
    console.log('Configurando event listeners...');
    startButton.addEventListener('click', function(e) {
        console.log('Botão iniciar clicado!');
        e.preventDefault();
        startGame();
    });
    resetButton.addEventListener('click', startGame); // Reinicia o jogo
    backButton.addEventListener('click', goBackToMenu);
    submitButton.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !submitButton.disabled) {
            checkAnswer();
        }
    });

    // Inicializa a barra de saúde ao carregar a página
    updateHealthBar();
});
