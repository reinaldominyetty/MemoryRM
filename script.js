class MemoryGame {
    constructor() {
        this.difficulty = null;
        this.theme = null;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.timer = null;
        this.isGameActive = false;
        this.isPaused = false;
        this.isMuted = false;
        this.totalPairs = 0; // Nueva propiedad para almacenar el total de pares
        this.background = null; // Nueva propiedad para el fondo seleccionado
        this.combo = 0;
        this.maxCombo = 0;
        this.elapsedTimeBeforePause = 0;
        
        this.highScores = {
            easy: { moves: Infinity, time: Infinity },
            medium: { moves: Infinity, time: Infinity },
            hard: { moves: Infinity, time: Infinity }
        };

        this.sounds = {
            flip: document.getElementById('sound-flip'),
            match: document.getElementById('sound-match'),
            noMatch: document.getElementById('sound-no-match'),
            victory: document.getElementById('sound-victory'),
            click: document.getElementById('sound-click')
        };

        this.themes = {
            'Clásico': {
                symbols: ['🌟', '🚀', '🎮', '🎯', '🎨', '🎪', '🎭', '🎰', '🎲', '🎸', '🎺', '🎻'],
                className: 'theme-clasico'
            },
            'Animales': {
                symbols: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
                className: 'theme-animales'
            },
            'Comida': {
                symbols: ['🍎', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍', '🥥', '🥝', '🍅', '🍆'],
                className: 'theme-comida'
            }
        };
        
        // 1. Cache de elementos DOM para un acceso más rápido
        this.dom = {
            welcomeScreen: document.getElementById('welcomeScreen'),
            gameScreen: document.getElementById('gameScreen'),
            playBtn: document.getElementById('playBtn'),
            difficultyContainer: document.querySelector('.difficulty-options'),
            themeOptions: document.getElementById('themeOptions'),
            highScoresDisplay: document.getElementById('highScoresDisplay'),
            moves: document.getElementById('moves'),
            timer: document.getElementById('timer'),
            pairs: document.getElementById('pairs'),
            combo: document.getElementById('combo'),
            soundControlBtn: document.getElementById('soundControlBtn'),
            memoryGrid: document.getElementById('memoryGrid'),
            victoryModal: document.getElementById('victoryModal'),
            victoryStats: document.getElementById('victoryStats'),
            newRecordText: document.getElementById('newRecordText'),
            pauseModal: document.getElementById('pauseModal'),
            backgroundOptions: document.getElementById('backgroundOptions'),
            welcomeParticles: document.getElementById('welcome-particles'),
            gameParticles: document.getElementById('game-particles')
        };

        this.initWelcomeParticles();
        this.initGameParticles();
        this.loadHighScores();
        this.displayHighScores();
        this.initSoundState();
        this.initBackgroundState(); // Corregir: Añadir la inicialización del fondo
        this.createThemeButtons();
        this.createBackgroundButtons();
        this.initEventListeners();
        this.startShootingStars(); // Start shooting stars on welcome screen
    }

    initWelcomeParticles() {
        const container = this.dom.welcomeParticles;
        if (!container) return;
        for (let i = 0; i < 70; i++) {
            const particle = document.createElement('div');
            particle.className = 'welcome-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * -8 + 's'; // Retraso negativo para que empiecen en diferentes posiciones
            particle.style.animationDuration = 2 + Math.random() * 6 + 's'; // Duraciones variadas
            container.appendChild(particle);
        }
    }

    initGameParticles() {
        const container = this.dom.gameParticles;
        if (!container) return;
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            container.appendChild(particle);
        }
    }

    startShootingStars() {
        const container = this.dom.welcomeParticles;
        if (!container) return;

        const createStar = () => {
            const star = document.createElement('div');
            star.className = 'shooting-star';

            // Random rotation for variety (e.g., 30 to 60 degrees from horizontal)
            const rotation = 30 + Math.random() * 30;
            star.style.setProperty('--star-rotation', `rotate(${rotation}deg)`);

            // Random start position (off-screen top-left to mid-screen)
            // Ensuring they start well off-screen to give a full trajectory
            const startX = -300 + Math.random() * (window.innerWidth * 0.7);
            const startY = -300 + Math.random() * (window.innerHeight * 0.7);

            // Random end position (mid-screen to off-screen bottom-right)
            const endX = window.innerWidth * 0.3 + Math.random() * (window.innerWidth * 0.7 + 300);
            const endY = window.innerHeight * 0.3 + Math.random() * (window.innerHeight * 0.7 + 300);

            const duration = 2 + Math.random() * 3; // 2 to 5 seconds
            const delay = Math.random() * 5; // 0 to 5 seconds before it starts

            star.style.setProperty('--start-x', `${startX}px`);
            star.style.setProperty('--start-y', `${startY}px`);
            star.style.setProperty('--end-x', `${endX}px`);
            star.style.setProperty('--end-y', `${endY}px`);
            star.style.setProperty('--star-duration', `${duration}s`);
            star.style.setProperty('--star-delay', `${delay}s`);

            container.appendChild(star);

            star.addEventListener('animationend', () => star.remove(), { once: true });
        };

        // Create a star immediately and then periodically
        createStar();
        setInterval(createStar, 2000 + Math.random() * 3000); // Every 2 to 5 seconds
    }

    loadHighScores() {
        const storedScores = localStorage.getItem('memoryGameHighScores');
        if (storedScores) {
            this.highScores = JSON.parse(storedScores);
        }
    }

    saveHighScores() {
        localStorage.setItem('memoryGameHighScores', JSON.stringify(this.highScores));
    }

    displayHighScores() {
        for (const level in this.highScores) {
            const score = this.highScores[level];
            const element = document.getElementById(`${level}-best`);
            if (element) {
                if (score.moves !== Infinity) {
                    element.textContent = `${score.moves} movs - ${this.formatTime(score.time)}`;
                }
            }
        }
    }

    createThemeButtons() {
        Object.keys(this.themes).forEach(themeName => {
            const btn = document.createElement('button');
            btn.className = 'difficulty-btn'; // Reutilizamos el estilo de los botones de dificultad
            btn.textContent = themeName;
            btn.dataset.theme = themeName;
            this.dom.themeOptions.appendChild(btn);
        });
    }

    createBackgroundButtons() {
        const backgrounds = {
            'Clásico': 'body-bg-default',
            'Galaxia': 'body-bg-nebula',
            'Abismo': 'body-bg-forest',
            'Cian': 'body-bg-sunset'
        };

        Object.keys(backgrounds).forEach(bgName => {
            const btn = document.createElement('button');
            btn.className = 'difficulty-btn'; // Reutilizamos el estilo de los botones de dificultad
            btn.textContent = bgName;
            btn.dataset.backgroundClass = backgrounds[bgName];
            this.dom.backgroundOptions.appendChild(btn);
        });
        // Inicializar el estado del botón seleccionado después de crearlos
        this.updateSelectedButton(this.dom.backgroundOptions, `[data-background-class="${this.background}"]`);
    }

    playSound(sound) {
        // Detiene y rebobina el sonido si ya se está reproduciendo, para permitir sonidos rápidos
        if (sound && !this.isMuted) {
            sound.currentTime = 0;
            sound.play().catch(error => console.error("Error al reproducir sonido:", error));
        }
    }

    initEventListeners() {
        // 2. Optimización con Delegación de Eventos
        // Un solo listener para todos los botones de dificultad
        this.dom.difficultyContainer.addEventListener('click', (e) => {
            const target = e.target.closest('.difficulty-btn');
            if (!target) return;

            this.updateSelectedButton(this.dom.difficultyContainer, target);
            this.difficulty = target.dataset.difficulty;
            this.checkIfReadyToPlay();
            this.playSound(this.sounds.click);
        });

        // Un solo listener para todos los botones de tema
        this.dom.themeOptions.addEventListener('click', (e) => {
            const target = e.target.closest('.difficulty-btn');
            if (!target) return;

            this.updateSelectedButton(this.dom.themeOptions, target);
            this.theme = target.dataset.theme;
            this.checkIfReadyToPlay();
            this.playSound(this.sounds.click);
        });

        // Un solo listener para todos los botones de fondo
        this.dom.backgroundOptions.addEventListener('click', (e) => {
            const target = e.target.closest('.difficulty-btn');
            if (!target) return;

            this.updateSelectedButton(this.dom.backgroundOptions, target);
            this.background = target.dataset.backgroundClass;
            this.applyBackground(this.background);
            localStorage.setItem('memoryGameBackground', this.background);
            this.playSound(this.sounds.click);
        });

        // Inicializar botones seleccionados por defecto
        this.updateSelectedButton(this.dom.difficultyContainer, `[data-difficulty="${this.difficulty}"]`);
        this.updateSelectedButton(this.dom.themeOptions, `[data-theme="${this.theme}"]`);
        this.updateSelectedButton(this.dom.backgroundOptions, `[data-background-class="${this.background}"]`);

        // Botón jugar
        this.dom.playBtn.addEventListener('click', () => {
            if (this.difficulty && this.theme) {
                this.playSound(this.sounds.click);
                this.startGame();
            }
        });

        // Botones de control
        document.getElementById('restartBtn').addEventListener('click', () => { this.playSound(this.sounds.click); this.restartGame(); });
        document.getElementById('backBtn').addEventListener('click', () => { this.playSound(this.sounds.click); this.backToMenu(); });
        document.getElementById('playAgainBtn').addEventListener('click', () => { this.playSound(this.sounds.click); this.playAgain(); });

        // Botón de sonido
        this.dom.soundControlBtn.addEventListener('click', () => this.toggleSound());

        // Botones de pausa
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('pauseRestartBtn').addEventListener('click', () => { this.dom.pauseModal.style.display = 'none'; this.restartGame(); });
        document.getElementById('pauseBackBtn').addEventListener('click', () => { this.dom.pauseModal.style.display = 'none'; this.backToMenu(); });

    }

    initBackgroundState() {
        const savedBackground = localStorage.getItem('memoryGameBackground');
        if (savedBackground) {
            this.background = savedBackground;
        } else {
            this.background = 'body-bg-default'; // Fondo por defecto
        }
        this.applyBackground(this.background);
    }

    // Función auxiliar para manejar la selección de botones
    updateSelectedButton(container, selector) {
        container.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
        const button = typeof selector === 'string' ? container.querySelector(selector) : selector;
        if (button) {
            button.classList.add('selected');
        }
    }

    checkIfReadyToPlay() {
        this.dom.playBtn.disabled = !(this.difficulty && this.theme);
    }

    initSoundState() {
        const savedMuteState = localStorage.getItem('memoryGameMuted');
        this.isMuted = savedMuteState === 'true';
        this.dom.soundControlBtn.classList.toggle('muted', this.isMuted);
    }

    applyBackground(backgroundClass) {
        document.body.className = ''; // Eliminar todas las clases existentes del body
        document.body.classList.add(backgroundClass); // Añadir la clase del fondo seleccionado
    }

    toggleSound() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('memoryGameMuted', this.isMuted);
        this.dom.soundControlBtn.classList.toggle('muted', this.isMuted);
        if (!this.isMuted) this.playSound(this.sounds.click);
    }

    // Función auxiliar para aplicar la animación de "pop" a las estadísticas
    applyStatPop(element) {
        element.classList.remove('stat-pop');
        void element.offsetWidth; // Forzar un reflow para reiniciar la animación
        element.classList.add('stat-pop');
    }

    pauseGame() {
        if (!this.isGameActive) return;
        this.isGameActive = false;
        this.isPaused = true;
        clearInterval(this.timer);
        this.timer = null;
        this.elapsedTimeBeforePause += Date.now() - this.startTime;
        this.dom.pauseModal.style.display = 'flex';
        this.playSound(this.sounds.click);
    }

    resumeGame() {
        if (!this.isPaused) return;
        this.isGameActive = true;
        this.isPaused = false;
        this.startTime = Date.now(); // Reinicia el punto de inicio para el nuevo intervalo
        this.startTimer();
        this.dom.pauseModal.style.display = 'none';
        this.playSound(this.sounds.click);
    }


    startGame() {
        this.dom.welcomeScreen.style.display = 'none';
        this.dom.gameScreen.style.display = 'block';
        // Reiniciar la animación de entrada de la pantalla de juego
        this.dom.gameScreen.style.animation = 'none';
        void this.dom.gameScreen.offsetWidth; // Forzar un reflow para reiniciar la animación
        this.dom.gameScreen.style.animation = '';
        
        this.resetGameState();
        this.createGameBoard();
        this.startTimer();
        this.isGameActive = true;
    }

    resetGameState() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = Date.now();
        this.combo = 0;
        this.maxCombo = 0;
        this.elapsedTimeBeforePause = 0;
        
        // Actualizar UI solo si los elementos existen
        this.dom.combo.textContent = 'x0';
        this.dom.moves.textContent = '0';
        this.dom.timer.textContent = '00:00';
        this.dom.pairs.innerHTML = `0/<span id="totalPairs">0</span>`;
        // Asegurarse de que las animaciones de pop no estén activas al reiniciar
        this.dom.moves.classList.remove('stat-pop');
        this.dom.timer.classList.remove('stat-pop');
        this.dom.pairs.classList.remove('stat-pop');

    }

    createGameBoard() {
        const grid = this.dom.memoryGrid;
        if (!grid) return;
        
        grid.innerHTML = '';
        const themeClassName = this.themes[this.theme].className;
        grid.className = `memory-grid ${this.difficulty} ${themeClassName}`;

        let cardCount;
        switch (this.difficulty) {
            case 'easy': cardCount = 6; break;
            case 'medium': cardCount = 8; break;
            case 'hard': cardCount = 12; break;
        }

        // Almacenar el total de pares en la propiedad de la clase
        this.totalPairs = cardCount;
        
        this.dom.pairs.innerHTML = `0/<span id="totalPairs">${cardCount}</span>`;

        // Crear pares de cartas
        const gameSymbols = this.themes[this.theme].symbols.slice(0, cardCount);
        const cardSymbols = [...gameSymbols, ...gameSymbols];
        
        // Mezclar las cartas
        for (let i = cardSymbols.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardSymbols[i], cardSymbols[j]] = [cardSymbols[j], cardSymbols[i]];
        }

        // 2. Usar un DocumentFragment para minimizar reflows
        const fragment = document.createDocumentFragment();

        // Crear elementos de carta
        cardSymbols.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card dealing'; // Añadir la clase de animación
            card.dataset.symbol = symbol;
            card.dataset.index = index;
            // Aplicar el retraso de la animación a través de una variable CSS
            card.style.setProperty('--deal-delay', `${index * 50}ms`);

            // Limpiar la clase de animación cuando termine para no interferir
            card.addEventListener('animationend', () => {
                card.classList.remove('dealing');
            }, { once: true });
            
            card.innerHTML = `
                <div class="card-face card-front"></div>
                <div class="card-face card-back">${symbol}</div>
            `;
            
            card.addEventListener('click', () => this.flipCard(card));
            fragment.appendChild(card);
        });

        grid.appendChild(fragment);
    }

    flipCard(card) {
        if (!this.isGameActive || this.isPaused || card.classList.contains('flipped') || 
            card.classList.contains('matched') || this.flippedCards.length >= 2) {
            return;
        }

                this.playSound(this.sounds.flip);
        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.dom.moves.textContent = this.moves;
            this.applyStatPop(this.dom.moves); // Aplicar animación
            
            setTimeout(() => this.checkMatch(), 600);
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.dataset.symbol === card2.dataset.symbol) {
            // Match encontrado
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.playSound(this.sounds.match);
            
            // Lógica de Combo
            this.combo++;
            this.maxCombo = Math.max(this.combo, this.maxCombo);
            this.dom.combo.textContent = `x${this.combo}`;
            this.dom.combo.classList.add('combo-pop');
            // Quitar la clase de animación para poder reutilizarla
            setTimeout(() => this.dom.combo.classList.remove('combo-pop'), 400);

            this.matchedPairs++;
            
            this.dom.pairs.innerHTML = `${this.matchedPairs}/<span id="totalPairs">${this.totalPairs}</span>`;
            this.applyStatPop(this.dom.pairs); // Aplicar animación
            
            // Verificar si el juego terminó usando la propiedad de la clase
            console.log(`Pares encontrados: ${this.matchedPairs}, Total pares: ${this.totalPairs}`); // Debug
            
            if (this.matchedPairs === this.totalPairs) {
                // Pequeño retraso para que el usuario vea la última carta emparejada
                setTimeout(() => {
                    this.endGame();
                }, 500);
            }
        } else {
            // No hay match
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.playSound(this.sounds.noMatch);
            // Romper el combo
            this.combo = 0;
            this.dom.combo.textContent = `x${this.combo}`;
        }
        
        this.flippedCards = [];
    }

    startTimer() {
        // Limpiar cualquier timer existente
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            // Verificar si el juego sigue activo y no está en pausa
            if (!this.isGameActive) {
                clearInterval(this.timer);
                return;
            }
            
            const totalElapsedMs = this.elapsedTimeBeforePause + (Date.now() - this.startTime);
            const minutes = Math.floor(totalElapsedMs / 60000);
            const seconds = Math.floor((totalElapsedMs % 60000) / 1000);
            
            if (this.dom.timer) {
                const oldTime = this.dom.timer.textContent;
                const newTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                if (oldTime !== newTime) { // Solo actualizar y animar si el tiempo realmente cambió
                    this.dom.timer.textContent = newTime;
                    this.applyStatPop(this.dom.timer); // Aplicar animación
                }
            }
        }, 1000);
    }

    endGame() {
        console.log('Juego terminado!'); // Debug
        
        // Detener el juego y el timer INMEDIATAMENTE
        this.isGameActive = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.playSound(this.sounds.victory);
        // Corregimos el cálculo del tiempo final
        const finalElapsedTime = this.elapsedTimeBeforePause + (this.isPaused ? 0 : Date.now() - this.startTime);
        const totalTime = Math.floor(finalElapsedTime / 1000);

        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;

        // Comprobar y guardar la mejor puntuación
        this.checkAndSaveHighScore(totalTime);
        this.displayHighScores();
        
        if (this.dom.victoryStats) {
            this.dom.victoryStats.innerHTML = `
                <p><strong>Tiempo:</strong> ${minutes}:${seconds.toString().padStart(2, '0')}</p>
                <p><strong>Movimientos:</strong> ${this.moves}</p>
                <p><strong>Dificultad:</strong> ${this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1)}</p>
                <p><strong>Tema:</strong> ${this.theme}</p>
                <p><strong>Combo Máximo:</strong> x${this.maxCombo}</p>
            `;
        }
        
        if (this.dom.victoryModal) {
            this.dom.victoryModal.style.display = 'flex';
            console.log('Modal de victoria mostrado'); // Debug
        }
    }

    checkAndSaveHighScore(time) {
        const currentScore = { moves: this.moves, time: time };
        const bestScore = this.highScores[this.difficulty];
        this.dom.newRecordText.style.display = 'none'; // Ocultar por defecto

        // Un nuevo récord se consigue con menos movimientos,
        // o con los mismos movimientos pero en menos tiempo.
        if (currentScore.moves < bestScore.moves || (currentScore.moves === bestScore.moves && currentScore.time < bestScore.time)) {
            this.highScores[this.difficulty] = currentScore;
            this.saveHighScores();
            
            // Mostrar mensaje de nuevo récord
            this.dom.newRecordText.textContent = '¡NUEVO RÉCORD!';
            this.dom.newRecordText.style.display = 'block';
        }
    }

    formatTime(totalSeconds) {
        if (totalSeconds === Infinity) return '--';
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    restartGame() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.startGame();
    }

    backToMenu() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Asegurarse de que el modal de pausa también se oculte
        this.dom.pauseModal.style.display = 'none';

        this.dom.gameScreen.style.display = 'none';
        this.dom.welcomeScreen.style.display = 'flex';
        this.dom.victoryModal.style.display = 'none';

        if (this.dom.newRecordText) {
            this.dom.newRecordText.style.display = 'none';
        }
        
        this.isGameActive = false;
        this.isPaused = false;
    }

    playAgain() {
        if (this.dom.victoryModal) this.dom.victoryModal.style.display = 'none';
        this.restartGame();
    }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
