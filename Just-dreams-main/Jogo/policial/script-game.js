// Jogo do Policial - Detetive Mirim
class PolicialGame {
    constructor() {
        this.score = 0;
        this.gameStarted = false;
        this.currentLevel = 0;
        this.levels = [
            {
                title: "Cena do Crime - Cozinha",
                objects: [
                    { name: "Revólver", emoji: "🔫", isPolice: true },
                    { name: "Corda", emoji: "🪢", isPolice: false },
                    { name: "Crachá", emoji: "🪙", isPolice: true },
                    { name: "Algemas", emoji: "🔗", isPolice: true },
                    { name: "Faca de Cozinha", emoji: "🔪", isPolice: false },
                    { name: "Rádio", emoji: "📻", isPolice: true }
                ]
            },
            {
                title: "Cena do Crime - Escritório",
                objects: [
                    { name: "Lanterna", emoji: "🔦", isPolice: true },
                    { name: "Lupa", emoji: "🔍", isPolice: true },
                    { name: "Livro", emoji: "📚", isPolice: false },
                    { name: "Câmera", emoji: "📷", isPolice: true },
                    { name: "Caneta", emoji: "✏️", isPolice: false },
                    { name: "Colete à Prova de Balas", emoji: "🦺", isPolice: true }
                ]
            },
            {
                title: "Cena do Crime - Garagem",
                objects: [
                    { name: "Viatura", emoji: "🚔", isPolice: true },
                    { name: "Bicicleta", emoji: "🚲", isPolice: false },
                    { name: "Cassetete", emoji: "🥖", isPolice: true },
                    { name: "Capacete", emoji: "⛑️", isPolice: true },
                    { name: "Ferramentas", emoji: "🔧", isPolice: false },
                    { name: "Cabo de Choque", emoji: "⚡", isPolice: true }
                ]
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
                'joao': { nome: 'Detetive João', avatar: '👦' },
                'maria': { nome: 'Detetive Maria', avatar: '👧' },
                'pedro': { nome: 'Detetive Pedro', avatar: '🧑' },
                'ana': { nome: 'Detetive Ana', avatar: '👩' },
                'lucas': { nome: 'Detetive Lucas', avatar: '👨' },
                'sofia': { nome: 'Detetive Sofia', avatar: '👩‍🎓' }
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
        this.currentLevel = 0;
        this.score = 0;
        
        document.getElementById('start-button').disabled = true;
        document.getElementById('reset-button').disabled = false;
        
        this.showLevel();
        this.updateDisplay();
    }
    
    showLevel() {
        if (this.currentLevel >= this.levels.length) {
            this.endGame();
            return;
        }
        
        const level = this.levels[this.currentLevel];
        document.getElementById('mission-text').textContent = `${level.title} - Clique nos objetos que NÃO pertencem ao trabalho policial!`;
        
        const scene = document.getElementById('scene');
        scene.innerHTML = '';
        scene.style.display = 'grid';
        scene.style.gridTemplateColumns = 'repeat(3, 1fr)';
        scene.style.gap = '10px';
        scene.style.margin = '20px 0';
        
        level.objects.forEach((obj, index) => {
            const objectElement = document.createElement('div');
            objectElement.className = 'object-item';
            objectElement.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 5px;">${obj.emoji}</div>
                <div style="font-size: 0.9rem;">${obj.name}</div>
            `;
            objectElement.style.padding = '15px';
            objectElement.style.border = '2px solid #ccc';
            objectElement.style.borderRadius = '10px';
            objectElement.style.cursor = 'pointer';
            objectElement.style.textAlign = 'center';
            objectElement.style.backgroundColor = '#f9f9f9';
            objectElement.style.transition = 'all 0.3s';
            
            objectElement.addEventListener('click', () => this.selectObject(obj, objectElement));
            
            scene.appendChild(objectElement);
        });
    }
    
    selectObject(obj, element) {
        if (!this.gameStarted) return;
        
        if (!obj.isPolice) {
            // Objeto correto (não é policial)
            this.score += 10;
            element.style.backgroundColor = '#4CAF50';
            element.style.borderColor = '#4CAF50';
            element.style.color = 'white';
            this.showFeedback(`Correto! ${obj.name} não é equipamento policial! 🎉`, 'success');
        } else {
            // Objeto incorreto (é policial)
            this.score = Math.max(0, this.score - 5);
            element.style.backgroundColor = '#F44336';
            element.style.borderColor = '#F44336';
            element.style.color = 'white';
            this.showFeedback(`Incorreto! ${obj.name} É equipamento policial! 😅`, 'error');
        }
        
        element.style.pointerEvents = 'none';
        this.updateDisplay();
        
        // Verificar se todos os objetos foram clicados
        const allClicked = Array.from(document.querySelectorAll('.object-item')).every(el => 
            el.style.pointerEvents === 'none'
        );
        
        if (allClicked) {
            setTimeout(() => {
                this.nextLevel();
            }, 2000);
        }
    }
    
    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel < this.levels.length) {
            this.showLevel();
        } else {
            this.endGame();
        }
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
        const progress = ((this.currentLevel + 1) / this.levels.length) * 100;
        const healthBar = document.getElementById('health-bar');
        healthBar.style.width = `${progress}%`;
        
        if (progress > 70) {
            healthBar.style.backgroundColor = '#4CAF50';
        } else if (progress > 30) {
            healthBar.style.backgroundColor = '#FF9800';
        } else {
            healthBar.style.backgroundColor = '#F44336';
        }
        
        document.getElementById('score-display').textContent = `Pontuação: ${this.score}`;
    }
    
    endGame() {
        this.gameStarted = false;
        document.getElementById('start-button').disabled = false;
        document.getElementById('reset-button').disabled = true;
        
        let message = '';
        if (this.score >= 80) {
            message = 'Parabéns! Você é um excelente detetive! 🏆';
            document.getElementById('advance-button').style.display = 'inline-block';
        } else if (this.score >= 50) {
            message = 'Bom trabalho! Você tem potencial para ser um detetive! 💪';
        } else {
            message = 'Continue praticando! A observação é fundamental para um detetive! 🔍';
        }
        
        document.getElementById('mission-text').textContent = message;
        this.showFeedback(`Pontuação final: ${this.score} pontos`, 'info');
        
        // Salvar progresso
        this.saveProgress();
    }
    
    resetGame() {
        this.gameStarted = false;
        this.currentLevel = 0;
        this.score = 0;
        
        document.getElementById('start-button').disabled = false;
        document.getElementById('reset-button').disabled = true;
        document.getElementById('advance-button').style.display = 'none';
        
        document.getElementById('mission-text').textContent = 'Clique em "Iniciar Jogo" para começar sua investigação!';
        document.getElementById('scene').innerHTML = '';
        document.getElementById('score-display').textContent = 'Pontuação: 0';
        
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
                gameType: 'policial',
                score: this.score,
                levelsCompleted: this.currentLevel,
                completed: this.currentLevel >= this.levels.length,
                timestamp: new Date().toISOString()
            };
            
            const progressKey = `game_progress_${user.id}_policial`;
            localStorage.setItem(progressKey, JSON.stringify(progressData));
        }
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new PolicialGame();
});
