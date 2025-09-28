document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('aluno-cadastro-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('student-name').value;
        const idade = document.getElementById('student-age').value;
        const turma = document.getElementById('student-class').value;
        const senha = document.getElementById('student-password').value;
        
        if (idade < 5 || idade > 100) {
            alert('A idade deve ser entre 5 e 100 anos.');
            return;
        }
        
        if (!turma || turma.trim().length === 0) {
            alert('A turma é obrigatória.');
            return;
        }
        
        if (!senha || senha.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: nome,
                    tipo: 'aluno',
                    idade: parseInt(idade),
                    turma: turma.trim(),
                    senha: senha
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Cadastro do aluno realizado com sucesso! Redirecionando para o login.');
                window.location.href = 'aluno_login.html';
            } else {
                alert('Erro no cadastro: ' + data.message);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão. Verifique se o servidor está rodando.');
        }
    });
});