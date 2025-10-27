document.addEventListener('DOMContentLoaded', () => {
    console.log('Script do médico carregado!');
    
    const mathQuestion = document.getElementById('math-question');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('submit-button');
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const healthBar = document.getElementById('health-bar');
    const gameFeedback = document.getElementById('game-feedback');

    let currentQuestion = {};
    let patientHealth = 50;
    const MAX_HEALTH = 100;
    const MIN_HEALTH = 0;
    const HEALTH_PER_CORRECT = 20;
    const HEALTH_PER_INCORRECT = 10;

    function generateQuestion() {
        const num1 = Math.floor(Math.random() * 9) + 1;
        const num2 = Math.floor(Math.random() * 9) + 1;
        const operation = Math.random() > 0.5 ? '+' : '-';

        let questionText, correctAnswer;

        if (operation === '+') {
            questionText = `Quanto é ${num1} + ${num2}?`;
            correctAnswer = num1 + num2;
        } else {
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

    function updateHealthBar() {
        if (healthBar) {
            healthBar.style.width = `${patientHealth}%`;
            
            if (patientHealth <= 20) {
                healthBar.style.backgroundColor = '#e03e3e';
            } else if (patientHealth <= 50) {
                healthBar.style.backgroundColor = '#ed7d24';
            } else if (patientHealth <= 80) {
                healthBar.style.backgroundColor = '#c9e13a';
            } else {
                healthBar.style.backgroundColor = '#5ab173';
            }
        }
    }

    function startGame() {
        console.log('Iniciando jogo do médico...');
        patientHealth = 50;
        updateHealthBar();
        gameFeedback.textContent = '';
        answerInput.value = '';
        answerInput.disabled = false;
        submitButton.disabled = false;
        startButton.disabled = true;
        resetButton.disabled = false;
        nextQuestion();
    }

    function nextQuestion() {
        currentQuestion = generateQuestion();
        mathQuestion.textContent = currentQuestion.questionText;
        answerInput.value = '';
        gameFeedback.textContent = '';
        answerInput.focus();
    }

    function checkAnswer() {
        const playerAnswer = parseInt(answerInput.value);

        if (isNaN(playerAnswer)) {
            gameFeedback.textContent = 'Por favor, digite um número!';
            gameFeedback.className = 'game-feedback incorrect';
            return;
        }

        if (playerAnswer === currentQuestion.correctAnswer) {
            gameFeedback.textContent = 'Correto! O paciente melhorou!';
            gameFeedback.className = 'game-feedback correct';
            patientHealth = Math.min(MAX_HEALTH, patientHealth + HEALTH_PER_CORRECT);
        } else {
            gameFeedback.textContent = `Errado! A resposta correta era ${currentQuestion.correctAnswer}.`;
            gameFeedback.className = 'game-feedback incorrect';
            patientHealth = Math.max(MIN_HEALTH, patientHealth - HEALTH_PER_INCORRECT);
        }

        updateHealthBar();
        checkGameEnd();
    }

    function checkGameEnd() {
        if (patientHealth >= MAX_HEALTH) {
            gameFeedback.textContent = 'Parabéns! Você curou o paciente!';
            gameFeedback.className = 'game-feedback win';
            endGame();
        } else if (patientHealth <= MIN_HEALTH) {
            gameFeedback.textContent = 'Oh não! O paciente não resistiu...';
            gameFeedback.className = 'game-feedback lose';
            endGame();
        } else {
            setTimeout(nextQuestion, 1500);
        }
    }

    function endGame() {
        answerInput.disabled = true;
        submitButton.disabled = true;
        startButton.disabled = false;
        resetButton.disabled = true;
    }

    function goBackToMenu() {
        window.location.href = '../index.html';
    }

    // Event Listeners
    console.log('Configurando event listeners...');
    
    if (startButton) {
        startButton.addEventListener('click', function(e) {
            console.log('Botão iniciar clicado!');
            e.preventDefault();
            startGame();
        });
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', startGame);
    }
    
    if (submitButton) {
        submitButton.addEventListener('click', checkAnswer);
    }
    
    if (answerInput) {
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !submitButton.disabled) {
                checkAnswer();
            }
        });
    }

    console.log('Event listeners configurados!');
});
