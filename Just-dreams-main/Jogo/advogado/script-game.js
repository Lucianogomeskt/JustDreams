// Jogo do Advogado - Caça-Palavras da Justiça
class AdvogadoGame {
    constructor() {
        this.words = ['JUSTIÇA', 'LEI', 'TRIBUNAL', 'JURADO', 'VEREDICTO', 'DEFESA', 'ACUSAÇÃO', 'EVIDÊNCIA'];
        this.foundWords = [];
        this.score = 0;
        this.gameStarted = false;
        this.grid = [];
        this.gridSize = 12;
        
        this.init();
    }
    
    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.generateGrid();
        this.updateDisplay();
    }
    
    loadUserData() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const personagemKey = `personagemEscolhido_${user.id}`;
        const personagem = localStorage.getItem(personagemKey);
        
        if (personagem) {
            const personagens = {
                'joao': { nome: 'Dr. João', avatar: '👦' },
                'maria': { nome: 'Dra. Maria', avatar: '👧' },
                'pedro': { nome: 'Dr. Pedro', avatar: '🧑' },
                'ana': { nome: 'Dra. Ana', avatar: '👩' },
                'lucas': { nome: 'Dr. Lucas', avatar: '👨' },
                'sofia': { nome: 'Dra. Sofia', avatar: '👩‍🎓' }
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
    
    generateGrid() {
        // Criar grid vazio
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(''));
        
        // Preencher com letras aleatórias
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÇ';
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
        
        // Inserir palavras no grid
        this.words.forEach(word => {
            this.insertWord(word);
        });
    }
    
    insertWord(word) {
        const directions = [
            { dr: 0, dc: 1 },   // horizontal
            { dr: 1, dc: 0 },   // vertical
            { dr: 1, dc: 1 },   // diagonal
            { dr: 1, dc: -1 }   // diagonal reversa
        ];
        
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const startRow = Math.floor(Math.random() * this.gridSize);
            const startCol = Math.floor(Math.random() * this.gridSize);
            
            if (this.canPlaceWord(word, startRow, startCol, direction)) {
                for (let i = 0; i < word.length; i++) {
                    const row = startRow + i * direction.dr;
                    const col = startCol + i * direction.dc;
                    this.grid[row][col] = word[i];
                }
                placed = true;
            }
            attempts++;
        }
    }
    
    canPlaceWord(word, startRow, startCol, direction) {
        for (let i = 0; i < word.length; i++) {
            const row = startRow + i * direction.dr;
            const col = startCol + i * direction.dc;
            
            if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
                return false;
            }
            
            if (this.grid[row][col] !== '' && this.grid[row][col] !== word[i]) {
                return false;
            }
        }
        return true;
    }
    
    startGame() {
        this.gameStarted = true;
        this.foundWords = [];
        this.score = 0;
        
        document.getElementById('start-button').disabled = true;
        document.getElementById('reset-button').disabled = false;
        
        this.renderGrid();
        this.updateWordList();
        this.updateDisplay();
    }
    
    renderGrid() {
        const gridContainer = document.getElementById('word-search-grid');
        gridContainer.innerHTML = '';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        gridContainer.style.gap = '2px';
        gridContainer.style.maxWidth = '400px';
        gridContainer.style.margin = '20px auto';
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.textContent = this.grid[i][j];
                cell.style.padding = '8px';
                cell.style.border = '1px solid #ccc';
                cell.style.textAlign = 'center';
                cell.style.cursor = 'pointer';
                cell.style.backgroundColor = '#f9f9f9';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', () => this.selectCell(i, j));
                
                gridContainer.appendChild(cell);
            }
        }
    }
    
    selectCell(row, col) {
        if (!this.gameStarted) return;
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.style.backgroundColor = '#4CAF50';
        cell.style.color = 'white';
        
        // Simular encontro de palavra (simplificado)
        const word = this.grid[row][col];
        if (word && !this.foundWords.includes(word)) {
            this.foundWords.push(word);
            this.score += 10;
            this.showFeedback(`Palavra encontrada: ${word}! 🎉`, 'success');
            this.updateWordList();
            this.updateDisplay();
            
            if (this.foundWords.length === this.words.length) {
                this.endGame();
            }
        }
    }
    
    updateWordList() {
        const wordList = document.getElementById('words-to-find');
        wordList.innerHTML = '';
        
        this.words.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            if (this.foundWords.includes(word)) {
                li.style.textDecoration = 'line-through';
                li.style.color = '#4CAF50';
            }
            wordList.appendChild(li);
        });
    }
    
    updateDisplay() {
        const progress = (this.foundWords.length / this.words.length) * 100;
        const healthBar = document.getElementById('health-bar');
        healthBar.style.width = `${progress}%`;
        
        if (progress > 70) {
            healthBar.style.backgroundColor = '#4CAF50';
        } else if (progress > 30) {
            healthBar.style.backgroundColor = '#FF9800';
        } else {
            healthBar.style.backgroundColor = '#F44336';
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
    
    endGame() {
        this.gameStarted = false;
        document.getElementById('start-button').disabled = false;
        document.getElementById('reset-button').disabled = true;
        
        let message = '';
        if (this.foundWords.length === this.words.length) {
            message = 'Parabéns! Você encontrou todas as palavras jurídicas! 🏆';
            document.getElementById('advance-button').style.display = 'inline-block';
        } else {
            message = `Bom trabalho! Você encontrou ${this.foundWords.length} de ${this.words.length} palavras.`;
        }
        
        this.showFeedback(`Pontuação final: ${this.score} pontos`, 'info');
        
        // Salvar progresso
        this.saveProgress();
    }
    
    resetGame() {
        this.gameStarted = false;
        this.foundWords = [];
        this.score = 0;
        
        document.getElementById('start-button').disabled = false;
        document.getElementById('reset-button').disabled = true;
        document.getElementById('advance-button').style.display = 'none';
        
        this.generateGrid();
        this.updateWordList();
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
                gameType: 'advogado',
                score: this.score,
                wordsFound: this.foundWords.length,
                completed: this.foundWords.length === this.words.length,
                timestamp: new Date().toISOString()
            };
            
            const progressKey = `game_progress_${user.id}_advogado`;
            localStorage.setItem(progressKey, JSON.stringify(progressData));
        }
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new AdvogadoGame();
});
