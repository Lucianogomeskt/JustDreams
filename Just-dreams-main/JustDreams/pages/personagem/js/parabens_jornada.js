document.addEventListener('DOMContentLoaded', () => {
            // Verificar se o usuário está logado
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
 /*           
            if (!token || user.tipo !== 'aluno') {
                alert('Você precisa estar logado como aluno!');
                window.location.href = 'aluno_login.html';
                return;
            }
*/
            // Carregar informações do personagem e profissão (específico para o usuário)
            const personagemKey = `personagemEscolhido_${user.id}`;
            const profissaoKey = `profissaoEscolhida_${user.id}`;
            const personagemEscolhido = localStorage.getItem(personagemKey);
            const profissaoEscolhida = localStorage.getItem(profissaoKey);
            
            if (!personagemEscolhido || !profissaoEscolhida) {
                alert('Por favor, escolha seu personagem e profissão primeiro!');
                window.location.href = 'escolha_profissao.html';
                return;
            }

            // Configurar informações do personagem
            configurarPersonagem(personagemEscolhido, profissaoEscolhida);

            // Configurar estatísticas (simuladas)
            configurarEstatisticas();
        });

        function configurarPersonagem(personagem, profissao) {
            const personagens = {
                'joao': { nome: 'João', avatar: '👦' },
                'maria': { nome: 'Maria', avatar: '👧' },
                'pedro': { nome: 'Pedro', avatar: '🧑' },
                'ana': { nome: 'Ana', avatar: '👩' },
                'lucas': { nome: 'Lucas', avatar: '👨' },
                'sofia': { nome: 'Sofia', avatar: '👩‍🎓' }
            };

            const profissoes = {
                'medico': { nome: 'Médico', titulo: 'médico' },
                'engenheiro': { nome: 'Engenheiro', titulo: 'engenheiro' },
                'astronauta': { nome: 'Astronauta', titulo: 'astronauta' },
                'chef': { nome: 'Chef', titulo: 'chef' },
                'artista': { nome: 'Artista', titulo: 'artista' },
                'cientista': { nome: 'Cientista', titulo: 'cientista' }
            };

            const personagemInfo = personagens[personagem] || { nome: 'Personagem', avatar: '👤' };
            const profissaoInfo = profissoes[profissao] || { nome: 'Profissão', titulo: 'profissional' };

            document.getElementById('character-avatar').textContent = personagemInfo.avatar;
            document.getElementById('character-name').textContent = personagemInfo.nome;
            document.getElementById('character-profession').textContent = profissaoInfo.nome;
            document.getElementById('profession-title').textContent = profissaoInfo.nome;
            document.getElementById('profession-message').textContent = profissaoInfo.titulo;
        }

        function configurarEstatisticas() {
            // Estatísticas simuladas - em um sistema real, viriam da API
            document.getElementById('total-fases').textContent = '4';
            document.getElementById('total-problemas').textContent = '150';
            document.getElementById('taxa-acerto').textContent = '92%';
            document.getElementById('tempo-total').textContent = '45';
        }