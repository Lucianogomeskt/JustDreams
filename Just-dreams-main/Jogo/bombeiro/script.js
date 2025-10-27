document.addEventListener('DOMContentLoaded', () => {
    // Avatar do jogador
    try {
        const avatarImg = document.getElementById('player-avatar');
        if (avatarImg) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const personagem = localStorage.getItem(`personagemEscolhido_${user.id}`) || 'joao';
            const profissao = (localStorage.getItem(`profissaoEscolhida_${user.id}`) || 'bombeiro').toLowerCase();
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
        const prof = (profissao || 'bombeiro').toLowerCase();
        const pers = (personagem || 'joao').toLowerCase();
        return (mapa[prof] && mapa[prof][pers]) ? mapa[prof][pers] : '';
    }
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackMessage = document.getElementById('feedback-message');
    const nextButton = document.getElementById('next-button');
    const backButton = document.getElementById('back-button');
    const backButtonResult = document.getElementById('back-button-result');
    const scoreText = document.getElementById('score-text');
    const finalMessage = document.getElementById('final-message');
    const restartButton = document.getElementById('restart-button');

    // Array de perguntas do quiz
    const questions = [
        {
            question: "Qual é a principal ferramenta do bombeiro para apagar o fogo?",
            options: ["Machado", "Mangueira", "Pá", "Tesoura"],
            correct: "Mangueira",
            feedbackCorrect: "Isso mesmo! A mangueira leva água para apagar o fogo!",
            feedbackWrong: "Quase! A mangueira é a principal ferramenta para a água."
        },
        {
            question: "Qual veículo o bombeiro usa para chegar rápido aos locais de emergência?",
            options: ["Carro de polícia", "Ambulância", "Caminhão de bombeiros", "Ônibus"],
            correct: "Caminhão de bombeiros",
            feedbackCorrect: "Acertou! O caminhão tem tudo que o bombeiro precisa!",
            feedbackWrong: "Não! O caminhão de bombeiros é o veículo certo."
        },
        {
            question: "Além de apagar incêndios, o que mais os bombeiros fazem?",
            options: ["Cozinham bolos", "Resgatam pessoas e animais", "Constroem casas", "Plantam flores"],
            correct: "Resgatam pessoas e animais",
            feedbackCorrect: "Muito bem! Eles são heróis em muitos tipos de resgates!",
            feedbackWrong: "Não! Eles também ajudam a resgatar pessoas e bichinhos."
        },
        {
            question: "Que tipo de roupa o bombeiro usa para se proteger do fogo?",
            options: ["Roupa de festa", "Pijama", "Uniforme especial", "Roupa de banho"],
            correct: "Uniforme especial",
            feedbackCorrect: "Exato! É um uniforme feito para aguentar o calor e proteger!",
            feedbackWrong: "Não! Eles usam um uniforme especial e resistente."
        },
        {
            question: "O que o bombeiro usa na cabeça para se proteger?",
            options: ["Chapéu de sol", "Boné", "Capacete", "Tiara"],
            correct: "Capacete",
            feedbackCorrect: "Isso mesmo! O capacete protege a cabeça dos perigos!",
            feedbackWrong: "Quase! Eles usam um capacete para proteger a cabeça."
        }
    ];

    let currentQuestionIndex = 0;
    let score = 0;
    let quizActive = true; // Para controlar se o usuário pode clicar nas opções

    // --- Funções para o Quiz ---

    function showQuestion() {
        if (currentQuestionIndex >= questions.length) {
            showResults();
            return;
        }

        const q = questions[currentQuestionIndex];
        questionText.textContent = q.question;
        optionsContainer.innerHTML = ''; // Limpa as opções anteriores
        feedbackMessage.classList.remove('visible'); // Esconde feedback anterior
        feedbackMessage.classList.add('hidden');
        nextButton.classList.remove('visible'); // Esconde botão "Próxima"
        nextButton.classList.add('hidden');
        quizActive = true;

        // Renderiza as novas opções
        q.options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.textContent = option;
            button.dataset.option = option; // Armazena a opção no dataset
            button.addEventListener('click', handleOptionClick);
            optionsContainer.appendChild(button);
        });
    }

    function handleOptionClick(event) {
        if (!quizActive) return; // Não permite clicar se o quiz não estiver ativo

        quizActive = false; // Desativa cliques para esta pergunta

        const selectedOption = event.target.dataset.option;
        const q = questions[currentQuestionIndex];

        // Desabilita todos os botões de opção
        Array.from(optionsContainer.children).forEach(button => {
            button.disabled = true;
            if (button.dataset.option === q.correct) {
                button.classList.add('correct'); // Marca a resposta correta
            } else if (button.dataset.option === selectedOption) {
                button.classList.add('wrong'); // Marca a resposta errada escolhida
            }
        });

        if (selectedOption === q.correct) {
            score++;
            feedbackMessage.style.color = 'var(--correct-color)';
            feedbackMessage.textContent = q.feedbackCorrect;
        } else {
            feedbackMessage.style.color = 'var(--wrong-color)';
            feedbackMessage.textContent = q.feedbackWrong;
        }
        feedbackMessage.classList.remove('hidden');
        feedbackMessage.classList.add('visible');

        nextButton.classList.remove('hidden');
        nextButton.classList.add('visible');
    }

    function showResults() {
        quizScreen.classList.remove('visible');
        quizScreen.classList.add('hidden');

        resultScreen.classList.remove('hidden');
        resultScreen.classList.add('visible');

        scoreText.textContent = `Você acertou ${score} de ${questions.length} perguntas!`;

        // Calcular pontuação para o ranking
        const gameScore = score * 10;
        const completed = score === questions.length;

        // Adicionar pontos ao sistema de ranking
        if (window.rankingSystem) {
            window.rankingSystem.addGamePoints('bombeiro', gameScore, completed);
            window.rankingSystem.shareGameCompletion('Quiz do Bombeiro', gameScore, completed);
            console.log(`+${gameScore} pontos no jogo do bombeiro!`);
        }

        if (score === questions.length) {
            finalMessage.textContent = "Uau! Você é um expert em bombeiros! Parabéns!";
            finalMessage.style.color = 'var(--playtech-yellow)';
        } else if (score >= questions.length / 2) {
            finalMessage.textContent = "Muito bom! Você sabe bastante sobre bombeiros!";
            finalMessage.style.color = 'var(--playtech-blue)';
        } else {
            finalMessage.textContent = "Continue aprendendo! Os bombeiros são muito importantes!";
            finalMessage.style.color = 'var(--playtech-pink)';
        }
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        quizActive = true;

        resultScreen.classList.remove('visible');
        resultScreen.classList.add('hidden');

        quizScreen.classList.remove('hidden');
        quizScreen.classList.add('visible');
        
        showQuestion(); // Inicia o quiz novamente
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

    // --- Event Listeners ---
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        showQuestion();
    });

    restartButton.addEventListener('click', restartQuiz);
    backButton.addEventListener('click', goBackToMenu);
    backButtonResult.addEventListener('click', goBackToMenu);

    // --- Início do Jogo ---
    // Embaralhar as perguntas para que não apareçam sempre na mesma ordem
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Embaralha as perguntas uma vez ao carregar a página
    shuffleArray(questions); 

    // Inicializa o quiz
    showQuestion();
});