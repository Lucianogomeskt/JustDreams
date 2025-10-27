// Dados do jogo - cenas e objetos
const gameScenes = [
    {
        name: "Delegacia de Polícia",
        background: "#a8d0e6",
        objects: [
            { name: "Uniforme Policial", x: 10, y: 50, width: 80, height: 120, correct: true, image: "👮" },
            { name: "Rádio Comunicador", x: 100, y: 60, width: 60, height: 60, correct: true, image: "📻" },
            { name: "Algemas", x: 180, y: 70, width: 50, height: 40, correct: true, image: "🔗" },
            { name: "Boneca", x: 250, y: 60, width: 60, height: 80, correct: false, image: "👧" },
            { name: "Arma de Borracha", x: 330, y: 70, width: 60, height: 40, correct: true, image: "🔫" },
            { name: "Bicicleta", x: 410, y: 50, width: 100, height: 100, correct: false, image: "🚲" },
            { name: "Lanterna", x: 530, y: 60, width: 50, height: 70, correct: true, image: "🔦" },
            { name: "Bola de Futebol", x: 600, y: 70, width: 60, height: 60, correct: false, image: "⚽" }
        ]
    },
    {
        name: "Viatura Policial",
        background: "#caf0f8",
        objects: [
            { name: "Viatura", x: 50, y: 100, width: 200, height: 120, correct: true, image: "🚓" },
            { name: "Megafone", x: 270, y: 80, width: 60, height: 60, correct: true, image: "📢" },
            { name: "Câmera", x: 350, y: 90, width: 50, height: 50, correct: true, image: "📷" },
            { name: "Bolo de Aniversário", x: 420, y: 80, width: 70, height: 70, correct: false, image: "🎂" },
            { name: "Colete à Prova de Balas", x: 510, y: 70, width: 80, height: 100, correct: true, image: "🦺" },
            { name: "Carrinho de Controle Remoto", x: 610, y: 100, width: 70, height: 70, correct: false, image: "🚗" }
        ]
    },
    {
        name: "Cena de Crime",
        background: "#e0fbfc",
        objects: [
            { name: "Fita de Isolamento", x: 50, y: 50, width: 300, height: 20, correct: true, image: "🚧" },
            { name: "Luvas de Latex", x: 370, y: 60, width: 60, height: 40, correct: true, image: "🧤" },
            { name: "Evidências", x: 450, y: 70, width: 60, height: 60, correct: true, image: "🔍" },
            { name: "Brinquedo de Pelúcia", x: 530, y: 80, width: 70, height: 70, correct: false, image: "🧸" },
            { name: "Máscara", x: 620, y: 70, width: 50, height: 50, correct: true, image: "😷" },
            { name: "Patinete", x: 100, y: 200, width: 80, height: 100, correct: false, image: "🛴" },
            { name: "Kit de Impressão Digital", x: 200, y: 210, width: 80, height: 80, correct: true, image: "🖐️" }
        ]
    }
];

// Variáveis do jogo
let currentSceneIndex = 0;
let score = 0;
let objectsFound = 0;
let totalObjectsToFind = 0;

// Elementos do DOM
const sceneElement = document.getElementById('scene');
const scoreElement = document.getElementById('score');
const feedbackElement = document.getElementById('feedback');
const hintButton = document.getElementById('hint');
const nextButton = document.getElementById('next');
const backButton = document.getElementById('back-button');
const backButtonCompleted = document.getElementById('back-button-completed');
const completedScreen = document.getElementById('completed');
const restartButton = document.getElementById('restart');

// Função para voltar ao menu principal
function goBackToMenu() {
    if (window.opener) {
        window.close();
    } else {
        // Se não foi aberto em nova janela, redireciona
        window.location.href = '../index.html';
    }
}

// Inicializar o jogo
function initGame() {
    currentSceneIndex = 0;
    score = 0;
    updateScore();
    loadScene(currentSceneIndex);
    completedScreen.style.display = 'none';
    document.querySelector('.game-area').style.display = 'block';
}

// Carregar uma cena
function loadScene(sceneIndex) {
    const scene = gameScenes[sceneIndex];
    sceneElement.innerHTML = '';
    sceneElement.style.backgroundColor = scene.background;
    
    // Adicionar título da cena
    const title = document.createElement('div');
    title.style.position = 'absolute';
    title.style.top = '10px';
    title.style.left = '0';
    title.style.width = '100%';
    title.style.textAlign = 'center';
    title.style.fontSize = '1.5rem';
    title.style.fontWeight = 'bold';
    title.style.color = '#1a2a6c';
    title.textContent = scene.name;
    sceneElement.appendChild(title);
    
    // Contar objetos incorretos (que precisam ser encontrados)
    totalObjectsToFind = scene.objects.filter(obj => !obj.correct).length;
    objectsFound = 0;
    
    // Adicionar objetos à cena
    scene.objects.forEach(obj => {
        const objectElement = document.createElement('div');
        objectElement.className = 'object';
        objectElement.style.left = `${obj.x}px`;
        objectElement.style.top = `${obj.y}px`;
        objectElement.style.width = `${obj.width}px`;
        objectElement.style.height = `${obj.height}px`;
        objectElement.dataset.correct = obj.correct;
        objectElement.dataset.name = obj.name;
        
        const img = document.createElement('div');
        img.style.fontSize = `${Math.min(obj.width, obj.height) * 0.8}px`;
        img.style.textAlign = 'center';
        img.style.lineHeight = `${obj.height}px`;
        img.textContent = obj.image;
        objectElement.appendChild(img);
        
        objectElement.addEventListener('click', handleObjectClick);
        sceneElement.appendChild(objectElement);
    });
    
    // Atualizar estado dos botões
    nextButton.disabled = true;
    feedbackElement.textContent = `Encontre ${totalObjectsToFind} objeto(s) que não pertencem!`;
    feedbackElement.className = 'feedback';
}

// Manipular clique em um objeto
function handleObjectClick(event) {
    const object = event.currentTarget;
    const isCorrect = object.dataset.correct === 'true';
    const objectName = object.dataset.name;
    
    if (object.classList.contains('found')) {
        return; // Objeto já foi encontrado
    }
    
    if (!isCorrect) {
        // Objeto incorreto encontrado
        object.classList.add('found');
        object.style.border = '3px solid #2e8b57';
        object.style.borderRadius = '10px';
        objectsFound++;
        score += 10;
        updateScore();
        
        feedbackElement.textContent = `Correto! ${objectName} não pertence ao trabalho policial.`;
        feedbackElement.className = 'feedback correct';
        
        // Verificar se todos os objetos foram encontrados
        if (objectsFound === totalObjectsToFind) {
            feedbackElement.textContent = `Parabéns! Você encontrou todos os objetos!`;
            nextButton.disabled = false;
            score += 50; // Bônus por completar a cena
            updateScore();
        }
    } else {
        // Objeto correto clicado (erro)
        object.style.border = '3px solid #dc143c';
        object.style.borderRadius = '10px';
        setTimeout(() => {
            object.style.border = 'none';
        }, 1000);
        
        score = Math.max(0, score - 5);
        updateScore();
        
        feedbackElement.textContent = `Ops! ${objectName} é usado pelo policial. Tente novamente!`;
        feedbackElement.className = 'feedback incorrect';
    }
}

// Atualizar a pontuação
function updateScore() {
    scoreElement.textContent = `Pontuação: ${score}`;
}

// Fornecer uma dica
function provideHint() {
    const scene = gameScenes[currentSceneIndex];
    const incorrectObjects = scene.objects.filter(obj => !obj.correct && !document.querySelector(`.object[data-name="${obj.name}"].found`));
    
    if (incorrectObjects.length > 0) {
        const randomObject = incorrectObjects[Math.floor(Math.random() * incorrectObjects.length)];
        const objectElement = document.querySelector(`.object[data-name="${randomObject.name}"]`);
        
        // Piscar o objeto como dica
        objectElement.style.boxShadow = '0 0 20px yellow';
        setTimeout(() => {
            objectElement.style.boxShadow = 'none';
        }, 1000);
        
        score = Math.max(0, score - 2);
        updateScore();
        
        feedbackElement.textContent = `Dica: Preste atenção no objeto que piscou!`;
        feedbackElement.className = 'feedback';
    }
}

// Avançar para a próxima cena
function nextScene() {
    currentSceneIndex++;
    
    if (currentSceneIndex < gameScenes.length) {
        loadScene(currentSceneIndex);
    } else {
        // Jogo concluído
        document.querySelector('.game-area').style.display = 'none';
        completedScreen.style.display = 'block';
        
        // Adicionar pontos ao sistema de ranking
        if (window.rankingSystem) {
            window.rankingSystem.addGamePoints('policial', score, true);
            window.rankingSystem.shareGameCompletion('Detetive Mirim', score, true);
            console.log(`+${score} pontos no jogo do policial!`);
        }
    }
}

// Event Listeners
hintButton.addEventListener('click', provideHint);
nextButton.addEventListener('click', nextScene);
restartButton.addEventListener('click', initGame);
backButton.addEventListener('click', goBackToMenu);
backButtonCompleted.addEventListener('click', goBackToMenu);

// Iniciar o jogo quando a página carregar
window.addEventListener('load', initGame);

// Avatar do jogador no cabeçalho
(function(){
    try {
        const avatarImg = document.getElementById('player-avatar');
        if (!avatarImg) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const personagem = localStorage.getItem(`personagemEscolhido_${user.id}`) || 'joao';
        const profissao = (localStorage.getItem(`profissaoEscolhida_${user.id}`) || 'policial').toLowerCase();
        const avatarSrc = (function mapearAvatarImagem(profissao, personagem){
            const base = '../Avatar/';
            const mapa = {
                'medico': { joao: base+'MedicoP.png', maria: base+'MedicaP.png', pedro: base+'MedicoB.png', ana: base+'MedicaB.png' },
                'bombeiro': { joao: base+'BombeiroP.png', maria: base+'BombeiraP.png', pedro: base+'BombeiroB.png', ana: base+'BombeiraB.png' },
                'policial': { joao: base+'PolicialP.png', maria: base+'Policial(a)P.jpeg', pedro: base+'PolicialB.png', ana: base+'Policial(a)B.jpeg' },
                'advogado': { joao: base+'AdvogadoP.png', maria: base+'AdvogadaP.png', pedro: base+'AdvogadoB.png', ana: base+'AdvogadaB.png' }
            };
            const prof = (profissao||'policial').toLowerCase();
            const pers = (personagem||'joao').toLowerCase();
            return (mapa[prof] && mapa[prof][pers]) ? mapa[prof][pers] : '';
        })(profissao, personagem);
        if (avatarSrc) avatarImg.src = avatarSrc;
    } catch(e) { /* noop */ }
})();
