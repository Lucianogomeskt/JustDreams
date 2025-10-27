// Jogo do Bombeiro - Quiz de Conhecimentos
class BombeiroGame {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.health = 100;
        this.gameStarted = false;
        this.questions = [
            {
                question: "Qual é a principal ferramenta do bombeiro para apagar o fogo?",
                options: ["Machado", "Mangueira", "Pá", "Tesoura"],
                correct: 1
            },
            {
                question: "Qual o número de emergência dos bombeiros?",
                options: ["190", "192", "193", "194"],
                correct: 2
            },
            {
                question: "O que fazer em caso de incêndio em casa?",
                options: ["Correr para fora", "Usar elevador", "Esconder no banheiro", "Abrir todas as janelas"],
                correct: 0
            },
            {
                question: "Qual equipamento de proteção é essencial para bombeiros?",
                options: ["Óculos de sol", "Máscara de gás", "Chapéu", "Luvas de borracha"],
                correct: 1
            },
            {
                question: "Como prevenir incêndios em casa?",
                options: ["Deixar velas acesas", "Manter fios expostos", "Não sobrecarregar tomadas", "Acumular lixo"],
                correct: 2
            }
        ];
        
        this.init();
    }
    
    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    loadUserData() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const personagemKey = `personagemEscolhido_${user.id}`;
        const personagem = localStorage.getItem(personagemKey);
        
        if (personagem) {
            const personagens = {
                'joao': { nome: 'Bombeiro João', avatar: '👦' },
                'maria': { nome: 'Bombeira Maria', avatar: '👧' },
                'pedro': { nome: 'Bombeiro Pedro', avatar: '🧑' },
                'ana': { nome: 'Bombeira Ana', avatar: '👩' },
                'lucas': { nome: 'Bombeiro Lucas', avatar: '👨' },
                'sofia': { nome: 'Bombeira Sofia', avatar: '👩‍🎓' }
            };
            
            const personagemData = personagens[personagem] || personagens['joao'];
            document.getElementById('character-name').textContent = personagemData.nome;
            document.getElementById('character-avatar').textContent = personagemData.avatar;
        }
    }
    
    setupEventListeners() {
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('reset-button').addEventListener('click', () => this.resetGame());
        document.getElementById('advance-button').addEventListener('click', () => this.advanceToNextPhase());
    }
    
    startGame() {
        this.gameStarted = true;
        this.currentQuestion = 0;
        this.score = 0;
        this.health = 100;
        
        document.getElementById('start-button').disabled = true;
        document.getElementById('reset-button').disabled = false;
        
        this.showQuestion();
        this.updateDisplay();
    }
    
    showQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endGame();
            return;
        }
        
        const question = this.questions[this.currentQuestion];
        document.getElementById('question-text').textContent = question.question;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
            button.className = 'game-button option-button';
            button.style.margin = '5px';
            button.style.display = 'block';
            button.style.width = '100%';
            button.addEventListener('click', () => this.selectAnswer(index));
            optionsContainer.appendChild(button);
        });
    }
    
    selectAnswer(selectedIndex) {
        if (!this.gameStarted) return;
        
        const question = this.questions[this.currentQuestion];
        const isCorrect = selectedIndex === question.correct;
        
        if (isCorrect) {
            this.score += 20;
            this.health = Math.min(100, this.health + 20);
            this.showFeedback('Correto! Excelente conhecimento! 🎉', 'success');
        } else {
            this.health = Math.max(0, this.health - 15);
            this.showFeedback(`Incorreto! A resposta correta era: ${question.options[question.correct]}`, 'error');
        }
        
        this.currentQuestion++;
        this.updateDisplay();
        
        setTimeout(() => {
            if (this.health <= 0) {
                this.endGame();
            } else {
                this.showQuestion();
            }
        }, 2000);
    }
    
    showFeedback(message, type) {
        const feedback = document.getElementById('game-feedback');
        feedback.textContent = message;
        feedback.className = `game-feedback ${type}`;
        feedback.style.display = 'block';
        
        setTimeout(() => {
            feedback.style.display = 'none';
        }, 2000);
    }
    
    updateDisplay() {
        const healthBar = document.getElementById('health-bar');
        const healthPercentage = Math.max(0, this.health);
        healthBar.style.width = `${healthPercentage}%`;
        
        if (healthPercentage > 70) {
            healthBar.style.backgroundColor = '#4CAF50';
        } else if (healthPercentage > 30) {
            healthBar.style.backgroundColor = '#FF9800';
        } else {
            healthBar.style.backgroundColor = '#F44336';
        }
    }
    
    endGame() {
        this.gameStarted = false;
        document.getElementById('start-button').disabled = false;
        document.getElementById('reset-button').disabled = true;
        
        let message = '';
        if (this.health <= 0) {
            message = 'Você precisa estudar mais sobre bombeiros! 😢 Tente novamente!';
        } else if (this.score >= 80) {
            message = 'Parabéns! Você é um verdadeiro herói bombeiro! 🏆';
            document.getElementById('advance-button').style.display = 'inline-block';
        } else {
            message = `Bom trabalho! Você fez ${this.score} pontos. Continue aprendendo! 💪`;
        }
        
        document.getElementById('question-text').textContent = message;
        this.showFeedback(`Pontuação final: ${this.score} pontos`, 'info');
        
        // Salvar progresso
        this.saveProgress();
    }
    
    resetGame() {
        this.gameStarted = false;
        this.currentQuestion = 0;
        this.score = 0;
        this.health = 100;
        
        document.getElementById('start-button').disabled = false;
        document.getElementById('reset-button').disabled = true;
        document.getElementById('advance-button').style.display = 'none';
        
        document.getElementById('question-text').textContent = 'Clique em "Iniciar Jogo" para começar!';
        document.getElementById('options-container').innerHTML = '';
        
        this.updateDisplay();
    }
    
    advanceToNextPhase() {
        window.location.href = '../../JustDreams/parabens_jornada.html';
    }
    
    saveProgress() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
            const progressData = {
                userId: user.id,
                gameType: 'bombeiro',
                score: this.score,
                health: this.health,
                completed: this.health > 0,
                timestamp: new Date().toISOString()
            };
            
            const progressKey = `game_progress_${user.id}_bombeiro`;
            localStorage.setItem(progressKey, JSON.stringify(progressData));
        }
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new BombeiroGame();
});
