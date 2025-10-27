// Sistema principal da página de jogos
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar estatísticas
    updateStats();
    
    // Configurar eventos dos botões
    setupEventListeners();
    
    console.log('🎮 Página de jogos carregada com sucesso!');
});

// Atualizar estatísticas na página
function updateStats() {
    if (window.rankingSystem) {
        const stats = window.rankingSystem.getPlayerStats();
        
        // Atualizar contador de atividades de hoje
        const todayCount = getTodayActivitiesCount();
        const todayCountElement = document.getElementById('today-count');
        if (todayCountElement) {
            todayCountElement.textContent = todayCount;
        }
        
        // Atualizar pontos totais
        const pointsCountElement = document.getElementById('points-count');
        if (pointsCountElement) {
            pointsCountElement.textContent = stats.totalPoints;
        }
    }
}

// Obter contagem de atividades de hoje
function getTodayActivitiesCount() {
    const completed = JSON.parse(localStorage.getItem('playtech_completed_activities') || '[]');
    const today = new Date().toDateString();
    
    return completed.filter(activity => {
        const activityDate = new Date(activity.timestamp).toDateString();
        return today === activityDate;
    }).length;
}

// Configurar event listeners
function setupEventListeners() {
    // Botão de estatísticas
    const statsButton = document.querySelector('.stats-button');
    if (statsButton) {
        statsButton.addEventListener('click', showStats);
    }
    
    // Botão de ranking
    const rankingButton = document.querySelector('.ranking-button');
    if (rankingButton) {
        rankingButton.addEventListener('click', showRanking);
    }
}

// Mostrar estatísticas
function showStats() {
    if (window.rankingSystem) {
        const stats = window.rankingSystem.getPlayerStats();
        
        const statsMessage = `
📊 Suas Estatísticas:

🎮 Jogos Jogados: ${stats.gamesPlayed}
✅ Jogos Completados: ${stats.gamesCompleted}
💚 Atividades Saudáveis: ${stats.healthActivities}
🔥 Sequência Atual: ${stats.currentStreak} dias
🏆 Medalhas: ${window.rankingSystem.getEarnedMedals().length}
        `;
        
        alert(statsMessage);
    } else {
        alert('Sistema de estatísticas não disponível.');
    }
}

// Mostrar ranking
function showRanking() {
    if (window.rankingSystem) {
        window.rankingSystem.showRanking();
    } else {
        alert('Sistema de ranking não disponível.');
    }
}

// Adicionar efeitos visuais aos cards de jogos
document.addEventListener('DOMContentLoaded', function() {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Sistema de notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    // Adicionar estilos se não existirem
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                max-width: 300px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            
            .notification-success {
                background: linear-gradient(135deg, #4CAF50, #45a049);
            }
            
            .notification-error {
                background: linear-gradient(135deg, #f44336, #d32f2f);
            }
            
            .notification-info {
                background: linear-gradient(135deg, #2196F3, #1976D2);
            }
            
            @keyframes slideInRight {
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
                font-size: 1.2rem;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Verificar se o usuário está logado
function checkUserLogin() {
    const userData = localStorage.getItem('playtech_user_data');
    if (!userData) {
        showNotification('Faça login para acessar os jogos!', 'info');
        return false;
    }
    return true;
}

// Adicionar verificação de login aos botões de jogar
document.addEventListener('DOMContentLoaded', function() {
    const playButtons = document.querySelectorAll('.play-btn');
    
    playButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!checkUserLogin()) {
                e.preventDefault();
                return false;
            }
        });
    });
});

// Sistema de progresso dos jogos
function updateGameProgress(gameType, completed = false) {
    if (window.rankingSystem) {
        const stats = window.rankingSystem.getPlayerStats();
        const gameStats = stats.gameStats[gameType];
        
        if (completed) {
            gameStats.completed++;
            showNotification(`Parabéns! Você completou o jogo ${gameType}!`, 'success');
        } else {
            gameStats.played++;
        }
        
        // Salvar progresso
        window.rankingSystem.saveRankingData();
    }
}

// Exportar funções para uso global
window.showNotification = showNotification;
window.updateGameProgress = updateGameProgress;
