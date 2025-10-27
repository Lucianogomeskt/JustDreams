// Sistema de Ranking e Medalhas PlayTech Games
class RankingSystem {
    constructor() {
        this.playerName = this.getPlayerName();
        this.medals = this.initializeMedals();
        this.achievements = this.initializeAchievements();
        this.rankingData = this.loadRankingData();
        
        this.init();
    }
    
    init() {
        this.addRankingStyles();
        this.createRankingModal();
        this.updatePlayerStats();
        console.log('🏆 Sistema de Ranking iniciado!');
    }
    
    // Obter nome do jogador
    getPlayerName() {
        let name = localStorage.getItem('playtech_player_name');
        if (!name) {
            // Tentar obter o nome do usuário logado no sistema JustDreams
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user && user.nome) {
                    name = user.nome;
                } else {
                    name = 'Jogador Anônimo';
                }
            } catch (error) {
                name = 'Jogador Anônimo';
            }
            localStorage.setItem('playtech_player_name', name);
        }
        return name;
    }
    
    // Inicializar sistema de medalhas
    initializeMedals() {
        return {
            // Medalhas por atividades saudáveis
            health: {
                'first_water': { name: '💧 Primeira Gota', description: 'Bebeu água pela primeira vez', points: 10, earned: false },
                'water_master': { name: '🌊 Mestre da Hidratação', description: 'Bebeu água 10 vezes', points: 50, earned: false, requirement: 10 },
                'fruit_lover': { name: '🍎 Amante das Frutas', description: 'Comeu frutas 5 vezes', points: 30, earned: false, requirement: 5 },
                'book_worm': { name: '📚 Minhoca dos Livros', description: 'Leu 7 vezes', points: 40, earned: false, requirement: 7 },
                'helper': { name: '🏠 Pequeno Ajudante', description: 'Ajudou em casa 5 vezes', points: 35, earned: false, requirement: 5 },
                'flexible': { name: '🤸 Acrobata', description: 'Fez alongamentos 8 vezes', points: 45, earned: false, requirement: 8 },
                'zen': { name: '🧘 Mestre Zen', description: 'Praticou respiração 6 vezes', points: 35, earned: false, requirement: 6 },
                'dancer': { name: '💃 Estrela da Dança', description: 'Dançou 5 vezes', points: 30, earned: false, requirement: 5 },
                'organizer': { name: '📝 Organizador', description: 'Organizou seu espaço 6 vezes', points: 40, earned: false, requirement: 6 },
                'health_champion': { name: '🏆 Campeão da Saúde', description: 'Completou 50 atividades saudáveis', points: 200, earned: false, requirement: 50 }
            },
            
            // Medalhas por jogos
            games: {
                'advogado_starter': { name: '⚖️ Primeiro Advogado', description: 'Completou o jogo do advogado', points: 25, earned: false },
                'advogado_master': { name: '⚖️ Mestre da Justiça', description: 'Pontuação alta no jogo do advogado', points: 50, earned: false, requirement: 80 },
                'bombeiro_starter': { name: '🚒 Primeiro Bombeiro', description: 'Completou o jogo do bombeiro', points: 25, earned: false },
                'bombeiro_master': { name: '🚒 Herói do Resgate', description: 'Pontuação alta no jogo do bombeiro', points: 50, earned: false, requirement: 90 },
                'medico_starter': { name: '🏥 Primeiro Médico', description: 'Completou o jogo do médico', points: 25, earned: false },
                'medico_master': { name: '🏥 Doutor Experiente', description: 'Curou muitos pacientes', points: 50, earned: false, requirement: 100 },
                'policial_starter': { name: '👮 Primeiro Detetive', description: 'Completou o jogo do policial', points: 25, earned: false },
                'policial_master': { name: '👮 Sherlock Mirim', description: 'Excelente detetive', points: 50, earned: false, requirement: 120 }
            },
            
            // Medalhas especiais
            special: {
                'daily_player': { name: '📅 Jogador Diário', description: 'Jogou por 7 dias consecutivos', points: 100, earned: false, requirement: 7 },
                'streak_master': { name: '🔥 Mestre da Sequência', description: 'Manteve sequência de 15 dias', points: 150, earned: false, requirement: 15 },
                'point_collector': { name: '💎 Colecionador de Pontos', description: 'Acumulou 1000 pontos totais', points: 200, earned: false, requirement: 1000 },
                'multitasker': { name: '🎯 Multitarefa', description: 'Jogou todos os 4 jogos', points: 75, earned: false },
                'persistent': { name: '💪 Persistente', description: 'Jogou por 30 dias', points: 300, earned: false, requirement: 30 }
            }
        };
    }
    
    // Inicializar conquistas
    initializeAchievements() {
        return {
            'first_steps': { name: '👶 Primeiros Passos', description: 'Complete sua primeira atividade saudável', points: 5 },
            'early_bird': { name: '🐦 Madrugador', description: 'Jogue antes das 8h da manhã', points: 15 },
            'night_owl': { name: '🦉 Coruja Noturna', description: 'Jogue após as 22h', points: 15 },
            'weekend_warrior': { name: '⚔️ Guerreiro do Fim de Semana', description: 'Jogue no sábado e domingo', points: 25 },
            'speed_demon': { name: '⚡ Demônio da Velocidade', description: 'Complete um jogo em tempo recorde', points: 30 },
            'perfectionist': { name: '✨ Perfeccionista', description: 'Complete um jogo sem erros', points: 40 }
        };
    }
    
    // Carregar dados de ranking
    loadRankingData() {
        const saved = localStorage.getItem('playtech_ranking_data');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            playerStats: {
                totalPoints: 0,
                healthActivities: 0,
                gamesPlayed: 0,
                gamesCompleted: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastPlayDate: null,
                totalPlayDays: 0,
                playDates: [],
                gameStats: {
                    advogado: { played: 0, completed: 0, bestScore: 0 },
                    bombeiro: { played: 0, completed: 0, bestScore: 0 },
                    medico: { played: 0, completed: 0, bestScore: 0 },
                    policial: { played: 0, completed: 0, bestScore: 0 }
                },
                healthActivityCounts: {
                    water: 0,
                    fruit: 0,
                    reading: 0,
                    help: 0,
                    stretch: 0,
                    breathe: 0,
                    dance: 0,
                    organize: 0
                }
            },
            earnedMedals: [],
            earnedAchievements: []
        };
    }
    
    // Salvar dados de ranking
    saveRankingData() {
        localStorage.setItem('playtech_ranking_data', JSON.stringify(this.rankingData));
    }
    
    // Adicionar pontos por atividade saudável
    addHealthActivityPoints(activityType) {
        const points = 10; // Pontos base por atividade
        this.rankingData.playerStats.totalPoints += points;
        this.rankingData.playerStats.healthActivities++;
        this.rankingData.playerStats.healthActivityCounts[activityType]++;
        
        this.checkHealthMedals();
        this.updatePlayerStats();
        this.saveRankingData();
        
        return points;
    }
    
    // Adicionar pontos por jogo
    addGamePoints(gameType, score, completed = false) {
        let points = 0;
        
        // Pontos base por jogar
        points += 5;
        this.rankingData.playerStats.gameStats[gameType].played++;
        
        // Pontos por completar
        if (completed) {
            points += 20;
            this.rankingData.playerStats.gameStats[gameType].completed++;
            this.rankingData.playerStats.gamesCompleted++;
        }
        
        // Pontos por pontuação
        if (score > this.rankingData.playerStats.gameStats[gameType].bestScore) {
            const bonusPoints = Math.floor(score / 10);
            points += bonusPoints;
            this.rankingData.playerStats.gameStats[gameType].bestScore = score;
        }
        
        this.rankingData.playerStats.totalPoints += points;
        this.rankingData.playerStats.gamesPlayed++;
        
        this.checkGameMedals(gameType, score);
        this.checkSpecialMedals();
        this.updatePlayerStats();
        this.saveRankingData();
        
        return points;
    }
    
    // Verificar medalhas de saúde
    checkHealthMedals() {
        const stats = this.rankingData.playerStats;
        
        // Medalhas por contagem de atividades
        const healthMedals = this.medals.health;
        
        Object.keys(healthMedals).forEach(medalKey => {
            const medal = healthMedals[medalKey];
            if (medal.earned) return;
            
            let earned = false;
            
            switch (medalKey) {
                case 'first_water':
                    earned = stats.healthActivityCounts.water >= 1;
                    break;
                case 'water_master':
                    earned = stats.healthActivityCounts.water >= medal.requirement;
                    break;
                case 'fruit_lover':
                    earned = stats.healthActivityCounts.fruit >= medal.requirement;
                    break;
                case 'book_worm':
                    earned = stats.healthActivityCounts.reading >= medal.requirement;
                    break;
                case 'helper':
                    earned = stats.healthActivityCounts.help >= medal.requirement;
                    break;
                case 'flexible':
                    earned = stats.healthActivityCounts.stretch >= medal.requirement;
                    break;
                case 'zen':
                    earned = stats.healthActivityCounts.breathe >= medal.requirement;
                    break;
                case 'dancer':
                    earned = stats.healthActivityCounts.dance >= medal.requirement;
                    break;
                case 'organizer':
                    earned = stats.healthActivityCounts.organize >= medal.requirement;
                    break;
                case 'health_champion':
                    earned = stats.healthActivities >= medal.requirement;
                    break;
            }
            
            if (earned) {
                this.earnMedal('health', medalKey);
            }
        });
    }
    
    // Verificar medalhas de jogos
    checkGameMedals(gameType, score) {
        const stats = this.rankingData.playerStats.gameStats[gameType];
        const gameMedals = this.medals.games;
        
        Object.keys(gameMedals).forEach(medalKey => {
            const medal = gameMedals[medalKey];
            if (medal.earned) return;
            
            let earned = false;
            
            if (medalKey.includes(gameType)) {
                if (medalKey.includes('starter')) {
                    earned = stats.completed > 0;
                } else if (medalKey.includes('master')) {
                    earned = score >= medal.requirement;
                }
                
                if (earned) {
                    this.earnMedal('games', medalKey);
                }
            }
        });
    }
    
    // Verificar medalhas especiais
    checkSpecialMedals() {
        const stats = this.rankingData.playerStats;
        
        // Medalha multitarefa
        const allGamesPlayed = Object.values(stats.gameStats).every(game => game.played > 0);
        if (allGamesPlayed && !this.medals.special.multitasker.earned) {
            this.earnMedal('special', 'multitasker');
        }
        
        // Medalha colecionador de pontos
        if (stats.totalPoints >= 1000 && !this.medals.special.point_collector.earned) {
            this.earnMedal('special', 'point_collector');
        }
        
        // Medalhas de sequência (será implementado com sistema de datas)
        this.checkStreakMedals();
    }
    
    // Verificar medalhas de sequência
    checkStreakMedals() {
        const stats = this.rankingData.playerStats;
        
        if (stats.currentStreak >= 7 && !this.medals.special.daily_player.earned) {
            this.earnMedal('special', 'daily_player');
        }
        
        if (stats.currentStreak >= 15 && !this.medals.special.streak_master.earned) {
            this.earnMedal('special', 'streak_master');
        }
        
        if (stats.totalPlayDays >= 30 && !this.medals.special.persistent.earned) {
            this.earnMedal('special', 'persistent');
        }
    }
    
    // Ganhar medalha
    earnMedal(category, medalKey) {
        const medal = this.medals[category][medalKey];
        medal.earned = true;
        
        this.rankingData.earnedMedals.push({
            category,
            medalKey,
            earnedDate: new Date().toISOString(),
            name: medal.name,
            description: medal.description,
            points: medal.points
        });
        
        this.rankingData.playerStats.totalPoints += medal.points;
        
        this.showMedalNotification(medal);
        this.saveRankingData();
        
        console.log(`🏆 Medalha conquistada: ${medal.name}`);
    }
    
    // Mostrar notificação de medalha
    showMedalNotification(medal) {
        const notification = document.createElement('div');
        notification.className = 'medal-notification';
        notification.innerHTML = `
            <div class="medal-content">
                <div class="medal-icon">🏆</div>
                <div class="medal-info">
                    <div class="medal-title">Nova Medalha!</div>
                    <div class="medal-name">${medal.name}</div>
                    <div class="medal-description">${medal.description}</div>
                    <div class="medal-points">+${medal.points} pontos</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    // Atualizar estatísticas do jogador
    updatePlayerStats() {
        const today = new Date().toDateString();
        const stats = this.rankingData.playerStats;
        
        // Verificar se é um novo dia
        if (stats.lastPlayDate !== today) {
            if (stats.lastPlayDate) {
                // Verificar se é sequência
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (stats.lastPlayDate === yesterday.toDateString()) {
                    stats.currentStreak++;
                } else {
                    stats.currentStreak = 1;
                }
            } else {
                stats.currentStreak = 1;
            }
            
            stats.lastPlayDate = today;
            stats.totalPlayDays++;
            
            if (stats.currentStreak > stats.longestStreak) {
                stats.longestStreak = stats.currentStreak;
            }
        }
        
        this.saveRankingData();
    }
    
    // Criar modal de ranking
    createRankingModal() {
        if (document.getElementById('ranking-modal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'ranking-modal';
        modal.className = 'ranking-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🏆 Ranking & Medalhas</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="player-stats">
                        <div class="stat-card">
                            <div class="stat-icon">👤</div>
                            <div class="stat-info">
                                <div class="stat-label">Jogador</div>
                                <div class="stat-value">${this.playerName}</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">💎</div>
                            <div class="stat-info">
                                <div class="stat-label">Pontos Totais</div>
                                <div class="stat-value">${this.rankingData.playerStats.totalPoints}</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🎯</div>
                            <div class="stat-info">
                                <div class="stat-label">Atividades Saudáveis</div>
                                <div class="stat-value">${this.rankingData.playerStats.healthActivities}</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🎮</div>
                            <div class="stat-info">
                                <div class="stat-label">Jogos Completados</div>
                                <div class="stat-value">${this.rankingData.playerStats.gamesCompleted}</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🔥</div>
                            <div class="stat-info">
                                <div class="stat-label">Sequência Atual</div>
                                <div class="stat-value">${this.rankingData.playerStats.currentStreak} dias</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🏆</div>
                            <div class="stat-info">
                                <div class="stat-label">Medalhas</div>
                                <div class="stat-value">${this.rankingData.earnedMedals.length}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="medals-section">
                        <h3>🏅 Suas Medalhas</h3>
                        <div class="medals-grid" id="medals-grid">
                            <!-- Medalhas serão inseridas aqui -->
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="close-btn">Fechar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Eventos para fechar modal
        const closeModal = () => {
            modal.style.display = 'none';
        };
        
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.querySelector('.close-btn').addEventListener('click', closeModal);
        modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    }
    
    // Mostrar modal de ranking
    showRanking() {
        const modal = document.getElementById('ranking-modal');
        if (modal) {
            this.updateMedalsDisplay();
            modal.style.display = 'flex';
        }
    }
    
    // Atualizar exibição das medalhas
    updateMedalsDisplay() {
        const medalsGrid = document.getElementById('medals-grid');
        if (!medalsGrid) return;
        
        medalsGrid.innerHTML = '';
        
        // Agrupar medalhas por categoria
        const categories = ['health', 'games', 'special'];
        
        categories.forEach(category => {
            const categoryMedals = this.rankingData.earnedMedals.filter(medal => medal.category === category);
            
            if (categoryMedals.length > 0) {
                const categoryTitle = document.createElement('h4');
                categoryTitle.className = 'medal-category-title';
                
                switch (category) {
                    case 'health':
                        categoryTitle.textContent = '💚 Atividades Saudáveis';
                        break;
                    case 'games':
                        categoryTitle.textContent = '🎮 Jogos';
                        break;
                    case 'special':
                        categoryTitle.textContent = '⭐ Especiais';
                        break;
                }
                
                medalsGrid.appendChild(categoryTitle);
                
                categoryMedals.forEach(medal => {
                    const medalElement = document.createElement('div');
                    medalElement.className = 'medal-item earned';
                    medalElement.innerHTML = `
                        <div class="medal-icon">${medal.name.split(' ')[0]}</div>
                        <div class="medal-details">
                            <div class="medal-name">${medal.name}</div>
                            <div class="medal-description">${medal.description}</div>
                            <div class="medal-date">Conquistada em: ${new Date(medal.earnedDate).toLocaleDateString('pt-BR')}</div>
                        </div>
                        <div class="medal-points">+${medal.points}</div>
                    `;
                    
                    medalsGrid.appendChild(medalElement);
                });
            }
        });
        
        // Mostrar medalhas não conquistadas (opcional)
        this.showUnearnedMedals(medalsGrid);
    }
    
    // Mostrar medalhas não conquistadas
    showUnearnedMedals(container) {
        const unearnedTitle = document.createElement('h4');
        unearnedTitle.className = 'medal-category-title';
        unearnedTitle.textContent = '🔒 Medalhas Disponíveis';
        container.appendChild(unearnedTitle);
        
        const categories = ['health', 'games', 'special'];
        
        categories.forEach(category => {
            Object.keys(this.medals[category]).forEach(medalKey => {
                const medal = this.medals[category][medalKey];
                if (!medal.earned) {
                    const medalElement = document.createElement('div');
                    medalElement.className = 'medal-item locked';
                    medalElement.innerHTML = `
                        <div class="medal-icon">🔒</div>
                        <div class="medal-details">
                            <div class="medal-name">${medal.name}</div>
                            <div class="medal-description">${medal.description}</div>
                            <div class="medal-progress">
                                ${this.getMedalProgress(category, medalKey)}
                            </div>
                        </div>
                        <div class="medal-points">+${medal.points}</div>
                    `;
                    
                    container.appendChild(medalElement);
                }
            });
        });
    }
    
    // Obter progresso da medalha
    getMedalProgress(category, medalKey) {
        const stats = this.rankingData.playerStats;
        
        switch (medalKey) {
            case 'water_master':
                return `Água: ${stats.healthActivityCounts.water}/10`;
            case 'fruit_lover':
                return `Frutas: ${stats.healthActivityCounts.fruit}/5`;
            case 'book_worm':
                return `Leitura: ${stats.healthActivityCounts.reading}/7`;
            case 'health_champion':
                return `Atividades: ${stats.healthActivities}/50`;
            case 'point_collector':
                return `Pontos: ${stats.totalPoints}/1000`;
            default:
                return 'Continue jogando!';
        }
    }
    
    // Adicionar estilos CSS
    addRankingStyles() {
        if (document.getElementById('ranking-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'ranking-styles';
        styles.textContent = `
            .ranking-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                display: none;
                align-items: center;
                justify-content: center;
                font-family: 'Fredoka One', cursive, sans-serif;
            }
            
            .ranking-modal .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
            }
            
            .ranking-modal .modal-content {
                position: relative;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 25px;
                padding: 0;
                max-width: 900px;
                width: 95%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
                transform: scale(0.8);
                opacity: 0;
                transition: all 0.4s ease;
            }
            
            .ranking-modal .modal-content {
                transform: scale(1);
                opacity: 1;
            }
            
            .ranking-modal .modal-header {
                background: rgba(255, 255, 255, 0.1);
                padding: 25px;
                border-radius: 25px 25px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
            }
            
            .ranking-modal .modal-header h2 {
                margin: 0;
                font-size: 2rem;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .ranking-modal .close-modal {
                background: none;
                border: none;
                color: white;
                font-size: 2.5rem;
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .ranking-modal .close-modal:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }
            
            .ranking-modal .modal-body {
                padding: 30px;
                background: rgba(255, 255, 255, 0.95);
                color: #333;
                max-height: 70vh;
                overflow-y: auto;
            }
            
            .player-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                background: linear-gradient(135deg, #f8f9ff, #e8ecff);
                border-radius: 15px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
            }
            
            .stat-icon {
                font-size: 2.5rem;
                width: 60px;
                text-align: center;
            }
            
            .stat-info {
                flex: 1;
            }
            
            .stat-label {
                font-size: 0.9rem;
                color: #666;
                margin-bottom: 5px;
            }
            
            .stat-value {
                font-size: 1.8rem;
                font-weight: bold;
                color: #667eea;
            }
            
            .medals-section h3 {
                color: #667eea;
                font-size: 1.8rem;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .medal-category-title {
                color: #764ba2;
                font-size: 1.3rem;
                margin: 25px 0 15px 0;
                padding-bottom: 10px;
                border-bottom: 2px solid #e8ecff;
            }
            
            .medals-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 15px;
            }
            
            .medal-item {
                background: white;
                border-radius: 15px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                border: 3px solid transparent;
            }
            
            .medal-item.earned {
                border-color: #4CAF50;
                background: linear-gradient(135deg, #f8fff8, #e8f5e8);
            }
            
            .medal-item.locked {
                opacity: 0.7;
                background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
            }
            
            .medal-item:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }
            
            .medal-icon {
                font-size: 2.5rem;
                width: 60px;
                text-align: center;
                flex-shrink: 0;
            }
            
            .medal-details {
                flex: 1;
            }
            
            .medal-name {
                font-size: 1.2rem;
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
            }
            
            .medal-description {
                font-size: 0.9rem;
                color: #666;
                margin-bottom: 5px;
            }
            
            .medal-date {
                font-size: 0.8rem;
                color: #999;
                font-style: italic;
            }
            
            .medal-progress {
                font-size: 0.8rem;
                color: #667eea;
                font-weight: bold;
            }
            
            .medal-points {
                font-size: 1.2rem;
                font-weight: bold;
                color: #4CAF50;
                background: rgba(76, 175, 80, 0.1);
                padding: 5px 10px;
                border-radius: 20px;
                flex-shrink: 0;
            }
            
            .ranking-modal .modal-footer {
                padding: 25px;
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 0 0 25px 25px;
            }
            
            .close-btn {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 15px 40px;
                border-radius: 30px;
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: inherit;
            }
            
            .close-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
            }
            
            .medal-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                z-index: 10002;
                animation: slideInRight 0.5s ease;
                max-width: 350px;
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
            
            .medal-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .medal-notification .medal-icon {
                font-size: 3rem;
                animation: bounce 1s infinite;
            }
            
            .medal-info {
                flex: 1;
            }
            
            .medal-title {
                font-size: 1.1rem;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .medal-notification .medal-name {
                font-size: 1.3rem;
                margin-bottom: 5px;
            }
            
            .medal-notification .medal-description {
                font-size: 0.9rem;
                opacity: 0.9;
                margin-bottom: 5px;
            }
            
            .medal-notification .medal-points {
                font-size: 1rem;
                font-weight: bold;
                background: rgba(255, 255, 255, 0.2);
                padding: 3px 8px;
                border-radius: 10px;
                display: inline-block;
            }
            
            @media (max-width: 768px) {
                .ranking-modal .modal-content {
                    width: 98%;
                    max-height: 95vh;
                }
                
                .player-stats {
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                }
                
                .medals-grid {
                    grid-template-columns: 1fr;
                }
                
                .medal-item {
                    flex-direction: column;
                    text-align: center;
                }
                
                .medal-icon {
                    margin-bottom: 10px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    // Métodos públicos para integração
    getPlayerStats() {
        return this.rankingData.playerStats;
    }
    
    getEarnedMedals() {
        return this.rankingData.earnedMedals;
    }
    
    getTotalPoints() {
        return this.rankingData.playerStats.totalPoints;
    }
    
    // Compartilhar conquista com amigos
    shareAchievementWithFriends(medalName, medalType) {
        const userData = JSON.parse(localStorage.getItem('playtech_user_data') || '{}');
        if (!userData.userCode) return;
        
        // Adicionar atividade ao feed dos amigos
        const activity = {
            type: 'achievement',
            friendCode: userData.userCode,
            friendName: userData.name,
            achievementName: medalName,
            medalType: medalType,
            timestamp: new Date().toISOString()
        };
        
        // Obter feed de atividades existente
        let activityFeed = JSON.parse(localStorage.getItem('playtech_activity_feed') || '[]');
        
        // Adicionar nova atividade
        activityFeed.unshift(activity);
        
        // Manter apenas as últimas 100 atividades
        if (activityFeed.length > 100) {
            activityFeed = activityFeed.slice(0, 100);
        }
        
        // Salvar feed atualizado
        localStorage.setItem('playtech_activity_feed', JSON.stringify(activityFeed));
        
        console.log(`🎉 Conquista "${medalName}" compartilhada com amigos!`);
    }
    
    // Compartilhar conclusão de jogo com amigos
    shareGameCompletion(gameName, score, completed) {
        const userData = JSON.parse(localStorage.getItem('playtech_user_data') || '{}');
        if (!userData.userCode) return;
        
        const activity = {
            type: 'game_completed',
            friendCode: userData.userCode,
            friendName: userData.name,
            gameName: gameName,
            score: score,
            completed: completed,
            timestamp: new Date().toISOString()
        };
        
        // Obter feed de atividades existente
        let activityFeed = JSON.parse(localStorage.getItem('playtech_activity_feed') || '[]');
        
        // Adicionar nova atividade
        activityFeed.unshift(activity);
        
        // Manter apenas as últimas 100 atividades
        if (activityFeed.length > 100) {
            activityFeed = activityFeed.slice(0, 100);
        }
        
        // Salvar feed atualizado
        localStorage.setItem('playtech_activity_feed', JSON.stringify(activityFeed));
        
        console.log(`🎮 Jogo "${gameName}" compartilhado com amigos!`);
    }
}

// Inicializar sistema de ranking globalmente
window.rankingSystem = new RankingSystem();
