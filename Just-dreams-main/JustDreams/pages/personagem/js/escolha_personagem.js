let personagemSelecionado = null;
let profissaoEscolhida = null;
let user = null;

document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o usuário está logado (com BYPASS)
    const urlParams = new URLSearchParams(window.location.search);
    const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
    const token = localStorage.getItem('token');
    user = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log('Usuário carregado do localStorage:', user);
    console.log('Bypass habilitado:', bypassEnabled);
    
/*          
    if ((!token || user.tipo !== 'aluno') && !bypassEnabled) {
        alert('Você precisa estar logado como aluno!');
        window.location.href = 'aluno_login.html';
        return;
    }
*/ 
    if (bypassEnabled && (!user || !user.id)) {
        user = { id: 0, nome: 'Dev Bypass', tipo: 'aluno' };
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Usuário de bypass criado:', user);
    }
    
    // Garantir que o usuário tenha um ID válido
    if (!user || !user.id) {
        user = { id: 0, nome: 'Usuário Teste', tipo: 'aluno' };
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Usuário de fallback criado:', user);
    }

    // Verificar se a profissão foi escolhida (específico para o usuário)
    const profissaoKey = `profissaoEscolhida_${user.id}`;
    profissaoEscolhida = localStorage.getItem(profissaoKey);
    if (!profissaoEscolhida) {
        if (bypassEnabled) {
            profissaoEscolhida = 'medico';
            localStorage.setItem(profissaoKey, profissaoEscolhida);
        } else {
            alert('Por favor, escolha uma profissão primeiro!');
            window.location.href = 'escolha_profissao.html';
            return;
        }
    }

    // Exibir informações do usuário
    document.getElementById('user-name').textContent = `Olá, ${user.nome}!`;

    // Exibir informações da profissão escolhida
    exibirProfissaoEscolhida();

    // Configurar seleção de personagens
    configurarSelecaoPersonagens();

    // Definir imagens de avatar por profissão
    definirAvataresPorProfissao();

    // Ocultar loading e mostrar conteúdo
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
});

function exibirProfissaoEscolhida() {
    const profissoes = {
        'medico': { nome: '👨‍⚕️ Médico', descricao: 'Você escolheu ser um médico! Cure pacientes resolvendo problemas matemáticos.' },
        'engenheiro': { nome: '👷‍♂️ Engenheiro', descricao: 'Você escolheu ser um engenheiro! Construa estruturas incríveis com cálculos matemáticos.' },
        'astronauta': { nome: '🚀 Astronauta', descricao: 'Você escolheu ser um astronauta! Explore o espaço calculando trajetórias e distâncias.' },
        'chef': { nome: '👨‍🍳 Chef', descricao: 'Você escolheu ser um chef! Crie pratos deliciosos calculando ingredientes e proporções.' },
        'artista': { nome: '🎨 Artista', descricao: 'Você escolheu ser um artista! Crie obras de arte usando geometria e proporções matemáticas.' },
        'cientista': { nome: '🔬 Cientista', descricao: 'Você escolheu ser um cientista! Faça descobertas incríveis através de cálculos e experimentos.' },
        'advogado': { nome: '⚖️ Advogado', descricao: 'Você escolheu ser um advogado! Defenda a justiça resolvendo caça-palavras e aprendendo sobre o mundo jurídico.' },
        'bombeiro': { nome: '🚒 Bombeiro', descricao: 'Você escolheu ser um bombeiro! Salve vidas testando seus conhecimentos sobre segurança e resgate.' },
        'policial': { nome: '👮 Policial', descricao: 'Você escolheu ser um policial! Mantenha a ordem e a segurança como um detetive mirim.' }
    };

    const profissao = profissoes[profissaoEscolhida] || { nome: 'Profissão', descricao: 'Você escolheu uma profissão!' };
    
    document.getElementById('profissao-nome').textContent = profissao.nome;
    document.getElementById('profissao-descricao').textContent = profissao.descricao;
}

function configurarSelecaoPersonagens() {
    const cards = document.querySelectorAll('.personagem-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            console.log('Personagem clicado:', card.dataset.personagem);
            
            // Remover seleção anterior
            cards.forEach(c => c.classList.remove('selected'));
            
            // Selecionar novo personagem
            card.classList.add('selected');
            personagemSelecionado = card.dataset.personagem;
            
            console.log('Personagem selecionado:', personagemSelecionado);
            
            // Habilitar botão continuar
            const btnContinuar = document.getElementById('btn-continuar');
            btnContinuar.disabled = false;
            console.log('Botão continuar habilitado');
        });
    });
    
    // Adicionar listener para o botão continuar
    const btnContinuar = document.getElementById('btn-continuar');
    if (btnContinuar) {
        console.log('Botão continuar encontrado, adicionando listener...');
        btnContinuar.addEventListener('click', (e) => {
            console.log('Botão continuar clicado via addEventListener');
            e.preventDefault();
            e.stopPropagation();
            continuar();
        });
        console.log('Listener adicionado com sucesso');
    } else {
        console.log('❌ Botão continuar não encontrado!');
    }
}

function continuar() {
    console.log('=== FUNÇÃO CONTINUAR CHAMADA ===');
    console.log('Personagem selecionado:', personagemSelecionado);
    console.log('Usuário:', user);
    console.log('Profissão escolhida:', profissaoEscolhida);
    
    if (!personagemSelecionado) {
        alert('Por favor, selecione um personagem!');
        return;
    }

    // Verificar se o usuário está definido
    if (!user || !user.id) {
        console.log('Usuário não encontrado, tentando recarregar do localStorage...');
        // Tentar recarregar o usuário do localStorage
        const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
        if (userFromStorage && userFromStorage.id) {
            user = userFromStorage;
            console.log('Usuário recarregado:', user);
        } else {
            // Criar usuário de fallback para teste
            user = { id: 0, nome: 'Usuário Teste', tipo: 'aluno' };
            localStorage.setItem('user', JSON.stringify(user));
            console.log('Usuário de fallback criado:', user);
        }
    }

    // Salvar personagem escolhido no localStorage (específico para o usuário)
    const personagemKey = `personagemEscolhido_${user.id}`;
    localStorage.setItem(personagemKey, personagemSelecionado);
    
    console.log('Personagem salvo:', personagemSelecionado, 'para usuário:', user.id);
    console.log('Chave do personagem:', personagemKey);
    console.log('Valor salvo no localStorage:', localStorage.getItem(personagemKey));
    
    // Verificar se a profissão também está salva
    const profissaoKey = `profissaoEscolhida_${user.id}`;
    const profissaoSalva = localStorage.getItem(profissaoKey);
    console.log('Profissão salva:', profissaoSalva);
    console.log('Chave da profissão:', profissaoKey);
    
    if (!profissaoSalva) {
        console.log('Profissão não encontrada, tentando usar a variável global...');
        if (profissaoEscolhida) {
            console.log('Usando profissão da variável global:', profissaoEscolhida);
            localStorage.setItem(profissaoKey, profissaoEscolhida);
        } else {
            alert('Erro: Profissão não encontrada. Volte e escolha uma profissão primeiro.');
            window.location.href = 'escolha_profissao.html';
            return;
        }
    } else {
        // Atualizar a variável global com a profissão salva
        profissaoEscolhida = profissaoSalva;
        console.log('Profissão carregada do localStorage:', profissaoEscolhida);
    }
    
    console.log('Redirecionando para o jogo...');
    console.log('Profissão escolhida:', profissaoEscolhida);
    
    // Verificar se é uma das novas profissões com jogos específicos
    const profissoesComJogos = ['medico', 'advogado', 'bombeiro', 'policial'];
    
    if (profissoesComJogos.includes(profissaoEscolhida)) {
        // CORREÇÃO: Caminho correto para os jogos específicos
        // De JustDreams/pages/personagem/html para Jogo = ../../../../Jogo/
        const url = `../../../../Jogo/${profissaoEscolhida}/index.html`;
        console.log('Redirecionando para:', url);
        console.log('URL completa:', window.location.origin + '/' + url);
        
        // Redirecionar diretamente
        window.location.href = url;
    } else {
        // Redirecionar para o jogo do médico como padrão
        const url = `../../../../Jogo/medico/index.html`;
        console.log('Redirecionando para jogo padrão:', url);
        window.location.href = url;
    }
}

function definirAvataresPorProfissao() {
    const mapa = {
        'medico': {
            // Note que os caminhos das imagens (quatro ../../..) parecem estar corretos para a pasta 'Jogo/Avatar',
            // mas se tiver problemas com as imagens depois de corrigir o redirecionamento, ajuste-os.
            joao: '../../../../Jogo/Avatar/MedicoP.png', 
            maria: '../../../../Jogo/Avatar/MedicaP.png',
            pedro: '../../../../Jogo/Avatar/MedicoB.png',
            ana: '../../../../Jogo/Avatar/MedicaB.png'
        },
        'bombeiro': {
            joao: '../../../../Jogo/Avatar/BombeiroP.png',
            maria: '../../../../Jogo/Avatar/BombeiraP.png',
            pedro: '../../../../Jogo/Avatar/BombeiroB.png',
            ana: '../../../../Jogo/Avatar/BombeiraB.png'
        },
        'policial': {
            joao: '../../../../Jogo/Avatar/PolicialP.png',
            maria: '../../../../Jogo/Avatar/Policial(a)P.jpeg',
            pedro: '../../../../Jogo/Avatar/PolicialB.png',
            ana: '../../../../Jogo/Avatar/Policial(a)B.jpeg'
        },
        'advogado': {
            joao: '../../../../Jogo/Avatar/AdvogadoP.png',
            maria: '../../../../Jogo/Avatar/AdvogadaP.png',
            pedro: '../../../../Jogo/Avatar/AdvogadoB.png',
            ana: '../../../../Jogo/Avatar/AdvogadaB.png'
        }
    };

    const setSrc = (id, src) => {
        const el = document.getElementById(id);
        if (el) el.src = src;
    };

    const mapaAtual = mapa[profissaoEscolhida] || mapa['medico'];
    setSrc('avatar-joao', mapaAtual.joao);
    setSrc('avatar-maria', mapaAtual.maria);
    setSrc('avatar-pedro', mapaAtual.pedro);
    setSrc('avatar-ana', mapaAtual.ana);
}