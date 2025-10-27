// Sistema de Timer para Atividades Saudáveis
class HealthTimer {
    constructor() {
        this.intervalId = null;
        this.startTime = Date.now();
        this.timerDuration = 30 * 60 * 1000; // 30 minutos em milissegundos
        this.isModalOpen = false;
        
        // Base de dados de atividades saudáveis
        this.activities = [
            {
                id: 'water',
                title: '💧 Missão Água!',
                description: 'Beba um copo de água fresca para reabastecer a energia.',
                icon: '💧',
                duration: '2 minutos',
                category: 'Hidratação'
            },
            {
                id: 'fruit',
                title: '🍎 Lanche Rápido e Colorido!',
                description: 'Coma um pedacinho da sua fruta favorita (maçã, banana, uva).',
                icon: '🍎',
                duration: '3 minutos',
                category: 'Alimentação'
            },
            {
                id: 'reading',
                title: '📚 Leia um Parágrafo!',
                description: 'Vá até um livro e leia uma página ou um parágrafo.',
                icon: '📚',
                duration: '5 minutos',
                category: 'Aprendizado'
            },
            {
                id: 'help',
                title: '🏠 Ajude em Casa!',
                description: 'Ajude em uma tarefa doméstica simples.',
                icon: '🏠',
                duration: '5 minutos',
                category: 'Responsabilidade'
            },
            {
                id: 'stretch',
                title: '🤸 Estique-se!',
                description: 'Faça alguns alongamentos para relaxar o corpo.',
                icon: '🤸',
                duration: '3 minutos',
                category: 'Exercício'
            },
            {
                id: 'breathe',
                title: '🌬️ Respire Fundo!',
                description: 'Faça 5 respirações profundas para relaxar.',
                icon: '🌬️',
                duration: '2 minutos',
                category: 'Relaxamento'
            },
            {
                id: 'dance',
                title: '💃 Dança Rápida!',
                description: 'Dance por 2 minutos com sua música favorita.',
                icon: '💃',
                duration: '2 minutos',
                category: 'Exercício'
            },
            {
                id: 'organize',
                title: '📝 Organize seu Espaço!',
                description: 'Organize sua mesa ou quarto por alguns minutos.',
                icon: '📝',
                duration: '5 minutos',
                category: 'Organização'
            }
        ];
        
        this.init();
    }
    
    init() {
        // Verificar se há um timer salvo
        this.loadSavedTimer();
        
        // Iniciar o timer
        this.startTimer();
        
        // Adicionar estilos CSS para o modal
        this.addModalStyles();
        
        // Adicionar o modal ao DOM
        this.createModal();
        
        console.log('🕐 Health Timer iniciado! Próxima pausa em 30 minutos.');
    }
    
    startTimer() {
        // Limpar timer anterior se existir
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Configurar próximo alerta
        const timeUntilNext = this.calculateTimeUntilNext();
        
        this.intervalId = setTimeout(() => {
            this.showHealthActivity();
            this.resetTimer();
        }, timeUntilNext);
        
        // Salvar o estado do timer
        this.saveTimerState();
    }
    
    calculateTimeUntilNext() {
        const now = Date.now();
        const lastAlert = this.getLastAlertTime();
        const timeSinceLastAlert = now - lastAlert;
        
        if (timeSinceLastAlert >= this.timerDuration) {
            // Já passou do tempo, mostrar imediatamente
            return 1000; // 1 segundo
        } else {
            // Calcular tempo restante
            return this.timerDuration - timeSinceLastAlert;
        }
    }
    
    getLastAlertTime() {
        const saved = localStorage.getItem('playtech_health_timer');
        return saved ? parseInt(saved) : this.startTime;
    }
    
    saveTimerState() {
        localStorage.setItem('playtech_health_timer', Date.now().toString());
    }
    
    loadSavedTimer() {
        const saved = localStorage.getItem('playtech_health_timer');
        if (saved) {
            this.startTime = parseInt(saved);
        }
    }
    
    showHealthActivity() {
        if (this.isModalOpen) return;
        
        this.isModalOpen = true;
        
        // Selecionar atividade aleatória
        const randomActivity = this.getRandomActivity();
        
        // Mostrar modal
        this.displayActivityModal(randomActivity);
        
        // Salvar última atividade mostrada
        localStorage.setItem('playtech_last_activity', randomActivity.id);
    }
    
    getRandomActivity() {
        let availableActivities = [...this.activities];
        
        // Evitar repetir a última atividade
        const lastActivityId = localStorage.getItem('playtech_last_activity');
        if (lastActivityId) {
            availableActivities = availableActivities.filter(activity => activity.id !== lastActivityId);
        }
        
        // Se não há atividades disponíveis, usar todas
        if (availableActivities.length === 0) {
            availableActivities = [...this.activities];
        }
        
        const randomIndex = Math.floor(Math.random() * availableActivities.length);
        return availableActivities[randomIndex];
    }
    
    displayActivityModal(activity) {
        const modal = document.getElementById('health-activity-modal');
        
        // Atualizar conteúdo do modal
        modal.querySelector('.activity-icon').textContent = activity.icon;
        modal.querySelector('.activity-title').textContent = activity.title;
        modal.querySelector('.activity-description').textContent = activity.description;
        modal.querySelector('.activity-duration').textContent = `⏱️ ${activity.duration}`;
        modal.querySelector('.activity-category').textContent = activity.category;
        
        // Mostrar modal
        modal.style.display = 'flex';
        
        // Adicionar animação
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
        
        // Configurar eventos dos botões
        this.setupModalEvents(activity);
        
        // Auto-fechar após 2 minutos se não interagir
        setTimeout(() => {
            if (this.isModalOpen) {
                this.closeModal();
            }
        }, 2 * 60 * 1000); // 2 minutos
    }
    
    setupModalEvents(activity) {
        const modal = document.getElementById('health-activity-modal');
        const completedBtn = modal.querySelector('.complete-activity');
        const skipBtn = modal.querySelector('.skip-activity');
        
        // Limpar eventos anteriores
        completedBtn.replaceWith(completedBtn.cloneNode(true));
        skipBtn.replaceWith(skipBtn.cloneNode(true));
        
        const newCompletedBtn = modal.querySelector('.complete-activity');
        const newSkipBtn = modal.querySelector('.skip-activity');
        
        // Evento para completar atividade
        newCompletedBtn.addEventListener('click', () => {
            this.completeActivity(activity);
        });
        
        // Evento para pular atividade
        newSkipBtn.addEventListener('click', () => {
            this.skipActivity();
        });
        
        // Fechar modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }
    
    completeActivity(activity) {
        // Salvar atividade completada
        const completed = JSON.parse(localStorage.getItem('playtech_completed_activities') || '[]');
        completed.push({
            activity: activity.id,
            timestamp: Date.now(),
            title: activity.title
        });
        localStorage.setItem('playtech_completed_activities', JSON.stringify(completed));
        
        // Adicionar pontos ao sistema de ranking
        if (window.rankingSystem) {
            const points = window.rankingSystem.addHealthActivityPoints(activity.id);
            console.log(`+${points} pontos por atividade saudável: ${activity.title}`);
            
            // Verificar se conquistou uma medalha e compartilhar
            const userStats = window.rankingSystem.getPlayerStats();
            const recentMedals = window.rankingSystem.getEarnedMedals();
            if (recentMedals.length > 0) {
                const latestMedal = recentMedals[recentMedals.length - 1];
                if (new Date() - new Date(latestMedal.earnedDate) < 5000) { // Medalha conquistada nos últimos 5 segundos
                    window.rankingSystem.shareAchievementWithFriends(latestMedal.name, latestMedal.type);
                }
            }
        }
        
        // Mostrar mensagem de sucesso
        this.showCompletionMessage(activity);
        
        this.closeModal();
    }
    
    skipActivity() {
        this.closeModal();
    }
    
    showCompletionMessage(activity) {
        // Criar notificação temporária
        const notification = document.createElement('div');
        notification.className = 'activity-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🎉</span>
                <span class="notification-text">Parabéns! Você completou: ${activity.title}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    closeModal() {
        const modal = document.getElementById('health-activity-modal');
        modal.classList.remove('show');
        
        setTimeout(() => {
            modal.style.display = 'none';
            this.isModalOpen = false;
        }, 300);
    }
    
    resetTimer() {
        this.startTime = Date.now();
        this.startTimer();
    }
    
    createModal() {
        // Verificar se o modal já existe
        if (document.getElementById('health-activity-modal')) {
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'health-activity-modal';
        modal.className = 'health-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⏰ Hora da Pausa Saudável!</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="activity-icon"></div>
                    <div class="activity-title"></div>
                    <div class="activity-description"></div>
                    <div class="activity-details">
                        <span class="activity-duration"></span>
                        <span class="activity-category"></span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="complete-activity">✅ Fiz a atividade!</button>
                    <button class="skip-activity">⏭️ Pular</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Evento para fechar com X
        modal.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal();
        });
    }
    
    addModalStyles() {
        // Verificar se os estilos já foram adicionados
        if (document.getElementById('health-timer-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'health-timer-styles';
        styles.textContent = `
            .health-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                font-family: 'Fredoka One', cursive, sans-serif;
            }
            
            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                position: relative;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                padding: 0;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                transform: scale(0.8);
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .health-modal.show .modal-content {
                transform: scale(1);
                opacity: 1;
            }
            
            .modal-header {
                background: rgba(255, 255, 255, 0.1);
                padding: 20px;
                border-radius: 20px 20px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 1.5rem;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .close-modal {
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.3s ease;
            }
            
            .close-modal:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .modal-body {
                padding: 30px;
                text-align: center;
                background: rgba(255, 255, 255, 0.95);
                color: #333;
            }
            
            .activity-icon {
                font-size: 4rem;
                margin-bottom: 20px;
                animation: bounce 1s infinite;
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                60% {
                    transform: translateY(-5px);
                }
            }
            
            .activity-title {
                font-size: 1.8rem;
                font-weight: bold;
                margin-bottom: 15px;
                color: #667eea;
            }
            
            .activity-description {
                font-size: 1.2rem;
                margin-bottom: 20px;
                line-height: 1.6;
                color: #666;
            }
            
            .activity-details {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .activity-duration,
            .activity-category {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: bold;
            }
            
            .modal-footer {
                padding: 20px;
                display: flex;
                gap: 15px;
                justify-content: center;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 0 0 20px 20px;
            }
            
            .modal-footer button {
                padding: 12px 24px;
                border: none;
                border-radius: 25px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: inherit;
            }
            
            .complete-activity {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
            }
            
            .complete-activity:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
            }
            
            .skip-activity {
                background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                color: white;
            }
            
            .skip-activity:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
            }
            
            .activity-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                z-index: 10001;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notification-icon {
                font-size: 1.5rem;
            }
            
            .notification-text {
                font-weight: bold;
            }
            
            @media (max-width: 600px) {
                .modal-content {
                    width: 95%;
                }
                
                .modal-body {
                    padding: 20px;
                }
                
                .activity-title {
                    font-size: 1.5rem;
                }
                
                .activity-description {
                    font-size: 1rem;
                }
                
                .modal-footer {
                    flex-direction: column;
                    align-items: center;
                }
                
                .modal-footer button {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    // Método para pausar o timer (útil para quando o usuário sai do jogo)
    pause() {
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }
    }
    
    // Método para retomar o timer
    resume() {
        if (!this.intervalId) {
            this.startTimer();
        }
    }
    
    // Método para obter estatísticas
    getStats() {
        const completed = JSON.parse(localStorage.getItem('playtech_completed_activities') || '[]');
        return {
            totalCompleted: completed.length,
            lastActivity: completed[completed.length - 1] || null,
            completedToday: completed.filter(activity => {
                const today = new Date().toDateString();
                const activityDate = new Date(activity.timestamp).toDateString();
                return today === activityDate;
            }).length
        };
    }
}

// Inicializar o timer globalmente
window.healthTimer = new HealthTimer();

// Pausar quando a página não está visível (opcional)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        window.healthTimer.pause();
    } else {
        window.healthTimer.resume();
    }
});
