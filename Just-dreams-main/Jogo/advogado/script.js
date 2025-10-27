document.addEventListener('DOMContentLoaded', () => {
    // Avatar do jogador
    try {
        const avatarImg = document.getElementById('player-avatar');
        if (avatarImg) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const personagem = localStorage.getItem(`personagemEscolhido_${user.id}`) || 'joao';
            const profissao = (localStorage.getItem(`profissaoEscolhida_${user.id}`) || 'advogado').toLowerCase();
            const avatarSrc = mapearAvatarImagem(profissao, personagem);
            if (avatarSrc) avatarImg.src = avatarSrc;
        }
    } catch(e) { console.log('avatar error', e); }

    function mapearAvatarImagem(profissao, personagem) {
        const base = '../Avatar/';
        const mapa = {
            'medico': {
                joao: base + 'MedicoP.png',
                maria: base + 'MedicaP.png',
                pedro: base + 'MedicoB.png',
                ana: base + 'MedicaB.png'
            },
            'bombeiro': {
                joao: base + 'BombeiroP.png',
                maria: base + 'BombeiraP.png',
                pedro: base + 'BombeiroB.png',
                ana: base + 'BombeiraB.png'
            },
            'policial': {
                joao: base + 'PolicialP.png',
                maria: base + 'Policial(a)P.jpeg',
                pedro: base + 'PolicialB.png',
                ana: base + 'Policial(a)B.jpeg'
            },
            'advogado': {
                joao: base + 'AdvogadoP.png',
                maria: base + 'AdvogadaP.png',
                pedro: base + 'AdvogadoB.png',
                ana: base + 'AdvogadaB.png'
            }
        };
        const prof = (profissao || 'advogado').toLowerCase();
        const pers = (personagem || 'joao').toLowerCase();
        return (mapa[prof] && mapa[prof][pers]) ? mapa[prof][pers] : '';
    }
    const gridElement = document.getElementById('word-search-grid');
    const wordListElement = document.getElementById('words-to-find');
    const resetButton = document.getElementById('reset-button');
    const backButton = document.getElementById('back-button');
    const messageElement = document.getElementById('message');

    // Palavras relacionadas a advogado para crianças
    const words = [
        "JUIZ", "LEI", "PAZ", "JUSTIÇA", "REGRA",
        "CASO", "OUVIR", "AJUDAR", "DIREITO", "DEVER"
    ];

    const gridSize = 10; // Grade 10x10
    let grid = []; // O tabuleiro do caça-palavras
    let foundWords = new Set(); // Para rastrear as palavras já encontradas
    let selectedCells = []; // Células atualmente selecionadas pelo usuário
    let isDragging = false; // Flag para arrastar seleção

    // --- Funções Auxiliares ---

    // Gera um número aleatório entre min e max (inclusive)
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // --- Gerar o Caça-Palavras ---
    function generateEmptyGrid() {
        grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    }

    // Tenta colocar uma palavra no grid
    function placeWord(word) {
        const directions = [
            { dr: 0, dc: 1 },  // Horizontal
            { dr: 1, dc: 0 },  // Vertical
            { dr: 1, dc: 1 },  // Diagonal \
            { dr: 1, dc: -1 } // Diagonal /
        ];

        // Tenta algumas vezes para posicionar a palavra
        for (let attempt = 0; attempt < 100; attempt++) {
            const row = getRandomInt(0, gridSize - 1);
            const col = getRandomInt(0, gridSize - 1);
            const dir = directions[getRandomInt(0, directions.length - 1)];

            let canPlace = true;
            let cellsToOccupy = [];

            // Verifica se a palavra cabe e não colide
            for (let i = 0; i < word.length; i++) {
                const r = row + i * dir.dr;
                const c = col + i * dir.dc;

                // Fora dos limites?
                if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
                    canPlace = false;
                    break;
                }

                // Colide com uma letra diferente?
                if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
                    canPlace = false;
                    break;
                }
                cellsToOccupy.push({ r, c, char: word[i] });
            }

            // Se puder colocar, faça!
            if (canPlace) {
                cellsToOccupy.forEach(cell => {
                    grid[cell.r][cell.c] = cell.char;
                });
                return true; // Palavra colocada com sucesso
            }
        }
        return false; // Não conseguiu colocar a palavra após muitas tentativas
    }

    // Preenche as células vazias com letras aleatórias
    function fillEmptyCells() {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (grid[r][c] === '') {
                    grid[r][c] = alphabet[getRandomInt(0, alphabet.length - 1)];
                }
            }
        }
    }

    // Renderiza o grid no HTML
    function renderGrid() {
        gridElement.innerHTML = '';
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.textContent = grid[r][c];
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('mousedown', startSelection);
                cell.addEventListener('mouseup', endSelection);
                cell.addEventListener('mouseenter', continueSelection);
                gridElement.appendChild(cell);
            }
        }
    }

    // Renderiza a lista de palavras a serem encontradas
    function renderWordList() {
        wordListElement.innerHTML = '';
        words.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            li.dataset.word = word;
            if (foundWords.has(word)) {
                li.classList.add('found');
            }
            wordListElement.appendChild(li);
        });
    }

    // --- Lógica de Seleção e Verificação ---

    function startSelection(e) {
        if (e.button === 0) { // Botão esquerdo do mouse
            isDragging = true;
            clearSelection();
            const cell = e.target;
            cell.classList.add('selected');
            selectedCells.push({
                row: parseInt(cell.dataset.row),
                col: parseInt(cell.dataset.col),
                element: cell
            });
            gridElement.addEventListener('mouseleave', endSelection); // Para terminar a seleção se o mouse sair do grid
        }
    }

    function continueSelection(e) {
        if (isDragging) {
            const cell = e.target;
            const newCell = {
                row: parseInt(cell.dataset.row),
                col: parseInt(cell.dataset.col),
                element: cell
            };

            // Evita adicionar a mesma célula repetidamente
            if (selectedCells.length > 0 && selectedCells[selectedCells.length - 1].element === newCell.element) {
                return;
            }

            // A seleção deve ser em linha reta (horizontal, vertical ou diagonal)
            if (selectedCells.length > 0) {
                const prevCell = selectedCells[selectedCells.length - 1];
                const dr = Math.abs(newCell.row - prevCell.row);
                const dc = Math.abs(newCell.col - prevCell.col);

                // Se a nova célula não segue a linha da seleção, não adiciona
                if (dr > 1 || dc > 1 || (dr !== 0 && dc !== 0 && dr !== dc)) {
                     // Se a nova célula não for adjacente e na mesma linha/coluna/diagonal, forçamos o fim da seleção
                     // Isso é um pouco mais complexo de fazer de forma robusta. Por simplicidade,
                     // vamos permitir a seleção e verificar a linha reta no `checkSelection`.
                }
            }

            cell.classList.add('selected');
            selectedCells.push(newCell);
        }
    }

    function endSelection() {
        if (isDragging) {
            isDragging = false;
            gridElement.removeEventListener('mouseleave', endSelection);
            checkSelection();
        }
    }

    function checkSelection() {
        if (selectedCells.length === 0) return;

        let selectedWordChars = '';
        const firstCell = selectedCells[0];
        const lastCell = selectedCells[selectedCells.length - 1];

        // Verificar se a seleção é em linha reta
        const rowDiff = Math.abs(firstCell.row - lastCell.row);
        const colDiff = Math.abs(firstCell.col - lastCell.col);

        // Se não for reta (horizontal, vertical ou diagonal), limpar seleção
        if (!(rowDiff === 0 || colDiff === 0 || rowDiff === colDiff)) {
            clearSelection();
            return;
        }

        // Montar a palavra selecionada
        selectedCells.forEach(cell => {
            selectedWordChars += cell.element.textContent;
        });

        // Verificar se a palavra selecionada está na lista de palavras
        let foundMatch = false;
        for (const word of words) {
            // Verificar a palavra na ordem original
            if (selectedWordChars === word && !foundWords.has(word)) {
                foundMatch = true;
                markWordAsFound(word, selectedCells);
                break;
            }
            // Verificar a palavra na ordem inversa (se a seleção for inversa)
            const reversedSelectedWord = selectedWordChars.split('').reverse().join('');
            if (reversedSelectedWord === word && !foundWords.has(word)) {
                foundMatch = true;
                markWordAsFound(word, selectedCells);
                break;
            }
        }

        if (!foundMatch) {
            clearSelection(); // Se não encontrou, deseleciona tudo
        }
    }

    function markWordAsFound(word, cells) {
        foundWords.add(word);
        cells.forEach(cell => {
            cell.element.classList.remove('selected');
            cell.element.classList.add('found');
        });
        const liElement = wordListElement.querySelector(`li[data-word="${word}"]`);
        if (liElement) {
            liElement.classList.add('found');
        }
        selectedCells = []; // Limpa a seleção após encontrar

        checkGameEnd();
    }

    function clearSelection() {
        selectedCells.forEach(cell => cell.element.classList.remove('selected'));
        selectedCells = [];
    }

    function checkGameEnd() {
        if (foundWords.size === words.length) {
            // Calcular pontuação baseada no número de palavras encontradas
            const score = foundWords.size * 10;
            
            // Adicionar pontos ao sistema de ranking
            if (window.rankingSystem) {
                window.rankingSystem.addGamePoints('advogado', score, true);
                window.rankingSystem.shareGameCompletion('Caça-Palavras da Justiça', score, true);
                console.log(`+${score} pontos no jogo do advogado!`);
            }
            
            showMessage('Parabéns, Pequeno Advogado! Você encontrou todas as palavras!', 'win');
            // Desativar interação com a grade se quiser
        }
    }

    function showMessage(msg, type) {
        messageElement.textContent = msg;
        messageElement.classList.remove('hidden');
        messageElement.classList.add('visible');
        if (type === 'win') {
            messageElement.style.color = 'var(--playtech-yellow)';
        } else {
            messageElement.style.color = 'var(--playtech-blue)';
        }
    }

    function hideMessage() {
        messageElement.classList.remove('visible');
        messageElement.classList.add('hidden');
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

    // --- Inicialização e Reset ---

    function initGame() {
        hideMessage();
        foundWords.clear();
        selectedCells = [];
        isDragging = false;
        generateEmptyGrid();

        // Tenta colocar cada palavra. Se não conseguir, pode ser preciso ajustar gridSize ou palavras.
        words.forEach(word => placeWord(word));
        fillEmptyCells();
        renderGrid();
        renderWordList();
    }

    resetButton.addEventListener('click', initGame);
    backButton.addEventListener('click', goBackToMenu);

    // Adiciona listener global para mouseup para garantir que isDragging seja resetado
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            endSelection();
        }
    });

    // Inicia o jogo
    initGame();
});