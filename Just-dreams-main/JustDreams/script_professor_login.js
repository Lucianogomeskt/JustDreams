document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('professor-login-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('professor-email').value;
        const senha = document.getElementById('professor-password').value;
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Salvar token no localStorage
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.usuario));
                
                alert('Login realizado com sucesso!');
                // Redirecionar para dashboard do professor
                window.location.href = 'professor_dashboard.html';
            } else {
                alert('Erro no login: ' + data.message);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão. Verifique se o servidor está rodando.');
        }
    });
});