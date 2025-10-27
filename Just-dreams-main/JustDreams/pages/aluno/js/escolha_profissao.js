 let profissaoSelecionada = null;
        let user = null;

        document.addEventListener('DOMContentLoaded', () => {
            // Verificar se o usuário está logado (com BYPASS)
            const urlParams = new URLSearchParams(window.location.search);
            const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
            const token = localStorage.getItem('token');
            user = JSON.parse(localStorage.getItem('user') || '{}');
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
            }

            // Exibir informações do usuário
            document.getElementById('user-name').textContent = `Olá, ${user.nome}!`;

            // Configurar seleção de profissões
            configurarSelecaoProfissoes();

            // Ocultar loading e mostrar conteúdo
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';
        });

        function configurarSelecaoProfissoes() {
            const cards = document.querySelectorAll('.profissao-card');
            
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    // Remover seleção anterior
                    cards.forEach(c => c.classList.remove('selected'));
                    
                    // Selecionar nova profissão
                    card.classList.add('selected');
                    profissaoSelecionada = card.dataset.profissao;
                    
                    // Habilitar botão continuar
                    document.getElementById('btn-continuar').disabled = false;

                    // Redireciono automaticamente após selecionar para agilizar fluxo
                    setTimeout(() => {
                        try { continuar(); } catch (e) { console.error(e); }
                    }, 50);
                });
            });
        }

        function continuar() {
            if (!profissaoSelecionada) {
                alert('Por favor, selecione uma profissão!');
                return;
            }

            // Garantir usuário mesmo offline (mock se necessário)
            if (!user || !user.id) {
                user = { id: 0, nome: 'Dev Bypass', tipo: 'aluno' };
                localStorage.setItem('user', JSON.stringify(user));
            }

            // Salvar profissão escolhida no localStorage (específico para o usuário)
            const profissaoKey = `profissaoEscolhida_${user.id}`;
            localStorage.setItem(profissaoKey, profissaoSelecionada);
            
            console.log('Profissão salva:', profissaoSelecionada, 'para usuário:', user.id);
            
            // Todas as profissões seguem o mesmo fluxo: escolha de personagem
            const urlParams = new URLSearchParams(window.location.search);
            const bypassEnabled = urlParams.get('bypass') === '1' || localStorage.getItem('BYPASS_AUTH') === 'true';
            const target = '../../personagem/html/escolha_personagem.html' + (bypassEnabled ? '?bypass=1' : '');
            window.location.assign(target);
        }