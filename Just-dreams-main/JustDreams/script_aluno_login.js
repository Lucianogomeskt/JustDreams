document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('aluno-login-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('aluno-username').value;
        const senha = document.getElementById('aluno-password').value;
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: nome,
                    senha: senha,
                    tipo: 'aluno'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Salvar token no localStorage
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.usuario));
                
                console.log('=== DEBUG DO LOGIN ===');
                console.log('Token salvo:', data.data.token);
                console.log('Usuário salvo:', data.data.usuario);
                console.log('Tipo do usuário:', data.data.usuario.tipo);
                console.log('ID do usuário:', data.data.usuario.id);
                console.log('======================');
                
                alert('Login realizado com sucesso!');
                // Redirecionar para dashboard do aluno
                window.location.href = 'aluno_dashboard.html';
            } else {
                alert('Erro no login: ' + data.message);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão. Verifique se o servidor está rodando.');
        }
    });
});