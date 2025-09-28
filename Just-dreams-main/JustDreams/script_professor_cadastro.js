document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('professor-cadastro-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('teacher-name').value;
        const email = document.getElementById('teacher-email').value;
        const senha = document.getElementById('teacher-password').value;
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    senha: senha,
                    tipo: 'professor'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Cadastro do professor realizado com sucesso! Redirecionando para o login.');
                window.location.href = 'professor_login.html';
            } else {
                alert('Erro no cadastro: ' + data.message);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão. Verifique se o servidor está rodando.');
        }
    });
});