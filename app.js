// ===== SpeedType — Typing Speed Test App =====

(function () {
    'use strict';

    // ===== DOM Elements =====
    const setupSection = document.getElementById('setup-section');
    const typingSection = document.getElementById('typing-section');
    const resultsSection = document.getElementById('results-section');

    const textInput = document.getElementById('text-input');
    const startBtn = document.getElementById('start-btn');

    const textDisplay = document.getElementById('text-display');
    const typingInput = document.getElementById('typing-input');
    const typingHint = document.getElementById('typing-hint');

    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownNumber = document.getElementById('countdown-number');
    const countdownLabel = document.getElementById('countdown-label');

    const wpmDisplay = document.getElementById('wpm-display');
    const accuracyDisplay = document.getElementById('accuracy-display');
    const timeDisplay = document.getElementById('time-display');
    const errorsDisplay = document.getElementById('errors-display');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    const restartBtn = document.getElementById('restart-btn');
    const newTextBtn = document.getElementById('new-text-btn');

    const resultWpm = document.getElementById('result-wpm');
    const resultAccuracy = document.getElementById('result-accuracy');
    const resultTime = document.getElementById('result-time');
    const resultErrors = document.getElementById('result-errors');
    const resultsRestartBtn = document.getElementById('results-restart-btn');
    const resultsNewBtn = document.getElementById('results-new-btn');

    // Theme elements
    const themeMenuEl = document.getElementById('theme-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const themeDropdown = document.getElementById('theme-dropdown');
    const themeOptions = document.querySelectorAll('.theme-option');

    // Random text buttons
    const btnRandShort = document.getElementById('btn-rand-short');
    const btnRandNoAccent = document.getElementById('btn-rand-noaccent');
    const btnRandLearn = document.getElementById('btn-rand-learn');
    const btnRandPhilosophy = document.getElementById('btn-rand-philosophy');
    const btnRandRomance = document.getElementById('btn-rand-romance');
    const btnRandSayings = document.getElementById('btn-rand-sayings');
    const btnRandClassic = document.getElementById('btn-rand-classic');
    const btnRandLong = document.getElementById('btn-rand-long');

    // Lives Mode DOM elements
    const livesModeSwitch = document.getElementById('lives-mode-switch');
    const difficultyWrapper = document.getElementById('difficulty-wrapper');
    const diffButtons = document.querySelectorAll('.btn-diff');
    const statsBar = document.getElementById('stats-bar');
    const livesStatCard = document.getElementById('lives-stat-card');
    const livesCountDisplay = document.getElementById('lives-count');
    const livesHeartsDisplay = document.getElementById('lives-hearts');
    const resultsCard = document.querySelector('.results-card');
    const resultsTitle = document.querySelector('.results-title');
    const resultsSubtitle = document.querySelector('.results-subtitle');

    // Fade Mode DOM elements
    const fadeModeSwitch = document.getElementById('fade-mode-switch');
    const fadeSpeedWrapper = document.getElementById('fade-speed-wrapper');
    const speedButtons = document.querySelectorAll('.btn-speed');

    // Streak Combo DOM elements (siempre activo en partida)
    const comboStatCard = document.getElementById('combo-stat-card');
    const comboCountDisplay = document.getElementById('combo-count');
    const comboLabelDisplay = document.getElementById('combo-label');

    // Storm Mode DOM elements
    const stormModeSwitch = document.getElementById('storm-mode-switch');

    // Dead Zone DOM elements
    const deadzoneModeSwitch = document.getElementById('deadzone-mode-switch');
    const deadzoneBanner = document.getElementById('deadzone-banner');
    const deadzoneKeysDisplay = document.getElementById('deadzone-keys');

    // Anti-Cheat & Practice Mode DOM elements
    const anticheatWarning = document.getElementById('anticheat-warning');
    const anticheatWarningDesc = document.getElementById('anticheat-warning-desc');
    const btnPracticeStart = document.getElementById('btn-practice-start');
    const practiceModeBanner = document.getElementById('practice-mode-banner');

    // Achievement Modal & Toast DOM elements
    const achievementsToggle = document.getElementById('achievements-toggle');
    const achievementsBadgeCount = document.getElementById('achievements-badge-count');
    const achievementsModal = document.getElementById('achievements-modal');
    const achievementsClose = document.getElementById('achievements-close');
    const achievementsProgressScore = document.getElementById('achievements-progress-score');
    const achievementsBarFill = document.getElementById('achievements-bar-fill');
    const achievementsGrid = document.getElementById('achievements-grid');
    const achCatButtons = document.querySelectorAll('.ach-cat-btn');
    const achievementContainer = document.getElementById('achievement-container');

    // ===== State =====
    let originalText = '';
    let characters = [];       // Array of expected characters
    let charSpans = [];        // Cached span references
    let typedChars = [];       // Array of characters the user has typed
    let totalKeystrokes = 0;   // Total characters typed (not backspaces)
    let correctKeystrokes = 0; // Correct characters typed
    let totalErrors = 0;       // Total incorrect keystrokes
    let startTime = null;
    let timerInterval = null;
    let isStarted = false;
    let isFinished = false;

    // Countdown state
    let isCountingDown = false;
    let countdownInterval = null;
    let countdownTimeout = null;

    // ===== Lives Mode State =====
    let isLivesMode = false;
    let maxLives = 5;
    let currentLives = 5;
    let isGameOver = false;

    // ===== Fade Mode State =====
    let isFadeMode = false;
    let fadeWpm = 40;               // Default: Medio
    let fadeIndex = 0;              // Next char index to fade out
    let fadeRafId = null;           // requestAnimationFrame ID
    let fadeAccumulator = 0;        // Accumulated time (ms) for fractional char progress
    let fadePrevTimestamp = null;   // Last rAF timestamp

    // ===== Streak Combo State (Siempre activo) =====
    let currentCombo = 0;
    let isOnFire = false;
    const FIRE_THRESHOLD = 30;

    // ===== Word Streak & User Statistics State (Gamificación) =====
    let currentWordStreak = 0;       // Racha de palabras correctas seguidas sin cometer errores
    let currentWordHadError = false; // Indica si la palabra en curso tuvo algún fallo
    let selectedAchievementCat = 'all';
    let isEligibleForAchievements = true; // Interruptor antitrampas: false si falla validación y juega en práctica

    // Cargar estadísticas guardadas del usuario
    let userStats = {
        testsCompleted: 0,
        maxWordStreak: 0
    };

    try {
        const savedStats = localStorage.getItem('speedtype-user-stats');
        if (savedStats) {
            userStats = Object.assign(userStats, JSON.parse(savedStats));
        }
    } catch (err) {
        console.warn('Error reading speedtype-user-stats:', err);
    }

    // ===== Storm Mode State =====
    let isStormMode = false;
    let stormInterval = null;
    let scrambledPositions = new Set(); // Conjunto de índices que han sido transformados

    // ===== Dead Zone State =====
    let isDeadzoneMode = false;
    let deadKeys = [];                  // 3 teclas rotas

    // ===== Theme State =====
    let currentTheme = localStorage.getItem('speedtype-theme') || 'dark';

    // ===== Initialize =====
    function init() {
        // Apply saved theme
        applyTheme(currentTheme);

        // Ensure start button is active
        startBtn.disabled = false;

        // --- Theme menu events ---
        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!themeMenuEl.contains(e.target)) {
                themeDropdown.classList.add('hidden');
            }
        });

        // Theme option buttons
        themeOptions.forEach(btn => {
            btn.addEventListener('click', () => {
                applyTheme(btn.dataset.theme);
                themeDropdown.classList.add('hidden');
            });
        });

        // --- Setup events ---
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleStartAttempt();
            }
        });

        textInput.addEventListener('input', () => {
            hideAntiCheatWarning();
        });

        startBtn.addEventListener('click', () => {
            handleStartAttempt();
        });

        if (btnPracticeStart) {
            btnPracticeStart.addEventListener('click', () => {
                handleStartAttempt(true);
            });
        }

        // --- Random Texts events ---
        function setRandomText(type) {
            hideAntiCheatWarning();
            const textsArray = typingTexts[type];
            if (textsArray && textsArray.length > 0) {
                const randomIndex = Math.floor(Math.random() * textsArray.length);
                textInput.value = textsArray[randomIndex];
            }
        }

        btnRandShort.addEventListener('click', () => setRandomText('short'));
        btnRandNoAccent.addEventListener('click', () => setRandomText('noaccent'));
        if (btnRandLearn) btnRandLearn.addEventListener('click', () => setRandomText('learn'));
        if (btnRandPhilosophy) btnRandPhilosophy.addEventListener('click', () => setRandomText('philosophy'));
        if (btnRandRomance) btnRandRomance.addEventListener('click', () => setRandomText('romance'));
        if (btnRandSayings) btnRandSayings.addEventListener('click', () => setRandomText('sayings'));
        btnRandClassic.addEventListener('click', () => setRandomText('classic'));
        btnRandLong.addEventListener('click', () => setRandomText('long'));

        // --- Typing events ---
        typingInput.addEventListener('input', handleInput);
        typingInput.addEventListener('keydown', handleKeydown);

        // --- Controls ---
        restartBtn.addEventListener('click', restartTest);
        newTextBtn.addEventListener('click', goToSetup);
        resultsRestartBtn.addEventListener('click', restartTest);
        resultsNewBtn.addEventListener('click', goToSetup);

        // Click text display to focus input
        textDisplay.addEventListener('click', () => {
            if (!isCountingDown && !typingInput.disabled) {
                typingInput.focus();
            }
        });

        // --- Exclusividad de Modos de Juego (Solo uno activo a la vez) ---
        function setExclusiveMode(modeName, isChecked) {
            // Apagar todos los modos
            isLivesMode = false;
            isFadeMode = false;
            isStormMode = false;
            isDeadzoneMode = false;

            // Desmarcar otros switches y ocultar sus selectores
            if (modeName !== 'lives') {
                if (livesModeSwitch) livesModeSwitch.checked = false;
                if (difficultyWrapper) difficultyWrapper.classList.add('hidden');
            }
            if (modeName !== 'fade') {
                if (fadeModeSwitch) fadeModeSwitch.checked = false;
                if (fadeSpeedWrapper) fadeSpeedWrapper.classList.add('hidden');
            }
            if (modeName !== 'storm') {
                if (stormModeSwitch) stormModeSwitch.checked = false;
            }
            if (modeName !== 'deadzone') {
                if (deadzoneModeSwitch) deadzoneModeSwitch.checked = false;
            }

            // Activar el modo seleccionado si fue marcado
            if (isChecked) {
                if (modeName === 'lives') {
                    isLivesMode = true;
                    if (difficultyWrapper) difficultyWrapper.classList.remove('hidden');
                } else if (modeName === 'fade') {
                    isFadeMode = true;
                    if (fadeSpeedWrapper) fadeSpeedWrapper.classList.remove('hidden');
                } else if (modeName === 'storm') {
                    isStormMode = true;
                } else if (modeName === 'deadzone') {
                    isDeadzoneMode = true;
                }
            }
        }

        // Listeners de los switches con exclusividad mutua
        if (livesModeSwitch) {
            livesModeSwitch.addEventListener('change', (e) => setExclusiveMode('lives', e.target.checked));
        }

        diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                diffButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                maxLives = parseInt(btn.dataset.lives, 10);
                currentLives = maxLives;
            });
        });

        if (fadeModeSwitch) {
            fadeModeSwitch.addEventListener('change', (e) => setExclusiveMode('fade', e.target.checked));
        }

        speedButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                speedButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                fadeWpm = parseInt(btn.dataset.wpm, 10);
            });
        });

        if (stormModeSwitch) {
            stormModeSwitch.addEventListener('change', (e) => setExclusiveMode('storm', e.target.checked));
        }

        if (deadzoneModeSwitch) {
            deadzoneModeSwitch.addEventListener('change', (e) => setExclusiveMode('deadzone', e.target.checked));
        }

        // --- Sistema de Logros: Inicialización & Eventos de Modal ---
        loadAchievementsFromStorage();
        updateAchievementsBadge();

        if (achievementsToggle) {
            achievementsToggle.addEventListener('click', () => {
                renderAchievementsGrid();
                updateAchievementsBadge();
                if (achievementsModal) achievementsModal.classList.remove('hidden');
            });
        }

        if (achievementsClose) {
            achievementsClose.addEventListener('click', () => {
                if (achievementsModal) achievementsModal.classList.add('hidden');
            });
        }

        if (achievementsModal) {
            achievementsModal.addEventListener('click', (e) => {
                if (e.target === achievementsModal) {
                    achievementsModal.classList.add('hidden');
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && achievementsModal && !achievementsModal.classList.contains('hidden')) {
                achievementsModal.classList.add('hidden');
            }
        });

        achCatButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                achCatButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedAchievementCat = btn.dataset.category || 'all';
                renderAchievementsGrid();
            });
        });
    }

    // ===== Pick random text across ALL available categories =====
    function getRandomTextFromAll() {
        const allCategories = Object.keys(typingTexts);
        const randomCat = allCategories[Math.floor(Math.random() * allCategories.length)];
        const categoryArray = typingTexts[randomCat];
        return categoryArray[Math.floor(Math.random() * categoryArray.length)];
    }

    // ===== Word Helpers for Word-by-Word typing =====
    function getCurrentWordTyped() {
        let lastSpaceIndex = -1;
        for (let i = typedChars.length - 1; i >= 0; i--) {
            if (i < characters.length && characters[i] === ' ') {
                lastSpaceIndex = i;
                break;
            }
        }
        return typedChars.slice(lastSpaceIndex + 1).join('');
    }

    function getTargetWord() {
        const cursorIndex = typedChars.length;
        if (cursorIndex >= characters.length) return '';

        if (characters[cursorIndex] === ' ') {
            return '[Espacio]';
        }

        let start = cursorIndex;
        while (start > 0 && characters[start - 1] !== ' ') {
            start--;
        }

        let end = cursorIndex;
        while (end < characters.length && characters[end] !== ' ') {
            end++;
        }

        return characters.slice(start, end).join('');
    }

    function syncInputBox() {
        const currentWordTyped = getCurrentWordTyped();
        typingInput.value = currentWordTyped;

        const target = getTargetWord();
        const cursorIndex = typedChars.length;
        const nextChar = cursorIndex < characters.length ? characters[cursorIndex] : null;

        if (typedChars.length >= characters.length) {
            typingInput.placeholder = '¡Texto completado!';
        } else if (isDeadzoneMode && isDeadKeyChar(nextChar)) {
            typingInput.placeholder = '¡Tecla rota! Pulsa [Espacio]...';
        } else if (target === '[Espacio]') {
            typingInput.placeholder = 'Pulsa espacio...';
        } else if (target) {
            typingInput.placeholder = `Escribe: ${target}`;
        } else {
            typingInput.placeholder = 'Empieza a escribir aquí...';
        }
    }

    // ===== Theme =====
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        currentTheme = theme;
        localStorage.setItem('speedtype-theme', theme);

        // Update active state in dropdown
        themeOptions.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    // ===== ANTI-CHEAT & CUSTOM TEXT VALIDATION =====
    function checkIfSystemText(text) {
        if (!text || typeof typingTexts === 'undefined') return false;
        const normalized = text.trim();
        for (const cat in typingTexts) {
            if (typingTexts[cat] && typingTexts[cat].some(t => t.trim() === normalized)) {
                return true;
            }
        }
        return false;
    }

    function validateCustomText(text) {
        if (!text || typeof text !== 'string') {
            return { isValid: false, reason: 'El texto no puede estar vacío.' };
        }

        // Limpieza de espacios dobles y saltos de línea innecesarios
        const cleanText = text.trim().replace(/\s+/g, ' ');
        if (cleanText.length === 0) {
            return { isValid: false, reason: 'El texto no puede estar vacío.' };
        }

        const words = cleanText.split(' ').filter(w => w.length > 0);
        const totalWords = words.length;

        if (totalWords < 3) {
            return { isValid: false, reason: 'El texto debe contener al menos 3 palabras.' };
        }

        // Filtro 1: Longitud Mínima de Palabras Únicas (Diversidad Léxica >= 40% si totalWords > 10)
        const normalizedWords = words.map(w =>
            w.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
        ).filter(Boolean);

        const uniqueWords = new Set(normalizedWords).size;
        const lexicalDiversity = (uniqueWords / totalWords) * 100;

        if (totalWords > 10 && lexicalDiversity < 40) {
            return {
                isValid: false,
                reason: `Diversidad léxica muy baja (${Math.round(lexicalDiversity)}%). El texto debe tener al menos 40% de palabras únicas.`
            };
        }

        // Filtro 2: Patrones Repetitivos de Caracteres (El truco "aaaaa")
        const repetitiveRegex = /(.)\1{3,}/i;
        for (const word of words) {
            if (repetitiveRegex.test(word)) {
                return {
                    isValid: false,
                    reason: `Patrón repetitivo detectado en "${word}". No se permiten más de 3 caracteres iguales seguidos.`
                };
            }
        }

        // Filtro 3: Longitud Promedio de las Palabras (2.5 a 15 caracteres)
        const totalLetters = words.reduce((acc, w) => acc + w.length, 0);
        const avgWordLength = totalLetters / totalWords;

        if (avgWordLength < 2.5) {
            return {
                isValid: false,
                reason: `Palabras demasiado cortas (promedio: ${avgWordLength.toFixed(1)} letras). El promedio mínimo es 2.5.`
            };
        }

        if (avgWordLength > 15) {
            return {
                isValid: false,
                reason: `Palabras excesivamente largas (promedio: ${avgWordLength.toFixed(1)} letras). Incluye espacios naturales.`
            };
        }

        return { isValid: true, reason: null };
    }

    function checkAntiCheat(text) {
        return validateCustomText(text).isValid;
    }

    function showAntiCheatWarning(reason) {
        if (textInput) {
            textInput.classList.remove('shake-error', 'has-anticheat-error');
            void textInput.offsetWidth; // Force CSS reflow to re-trigger shake animation
            textInput.classList.add('shake-error', 'has-anticheat-error');
        }
        if (anticheatWarningDesc) {
            anticheatWarningDesc.textContent = reason || 'Asegúrate de usar un texto real con palabras variadas.';
        }
        if (anticheatWarning) {
            anticheatWarning.classList.remove('hidden');
        }
    }

    function hideAntiCheatWarning() {
        if (textInput) {
            textInput.classList.remove('has-anticheat-error', 'shake-error');
        }
        if (anticheatWarning) {
            anticheatWarning.classList.add('hidden');
        }
    }

    function handleStartAttempt(forcePractice = false) {
        const rawText = textInput.value.trim();

        // 1. Si el textarea está vacío, cargar texto aleatorio del sistema
        if (rawText.length === 0) {
            textInput.value = getRandomTextFromAll();
            isEligibleForAchievements = true;
            hideAntiCheatWarning();
            startTest();
            return;
        }

        // 2. Si el texto coincide con una categoría del sistema
        const isSystemText = checkIfSystemText(rawText);

        if (isSystemText) {
            isEligibleForAchievements = true;
            hideAntiCheatWarning();
            startTest();
            return;
        }

        // 3. Si el usuario pulsó expresamente "Modo Práctica"
        if (forcePractice) {
            isEligibleForAchievements = false;
            hideAntiCheatWarning();
            startTest();
            return;
        }

        // 4. Validar texto personalizado contra filtros antitrampas
        const validation = validateCustomText(rawText);

        if (validation.isValid) {
            isEligibleForAchievements = true;
            hideAntiCheatWarning();
            startTest();
        } else {
            // Rechazar y mostrar retroalimentación con opción a Modo Práctica
            showAntiCheatWarning(validation.reason);
            showAchievementToast('⚠️', 'Texto No Válido para Logros', validation.reason);
        }
    }

    // ===== Start Test =====
    function startTest() {
        // If text is empty, pick a random text from all categories
        if (textInput.value.trim().length === 0) {
            textInput.value = getRandomTextFromAll();
            isEligibleForAchievements = true;
        }

        originalText = textInput.value.trimEnd();
        characters = originalText.split('');
        typedChars = [];
        totalKeystrokes = 0;
        correctKeystrokes = 0;
        totalErrors = 0;
        startTime = null;
        isStarted = false;
        isFinished = false;
        isGameOver = false;
        currentWordHadError = false;

        // Reset lives for this round
        currentLives = maxLives;

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        clearCountdown();
        stopFadeLoop();

        // Build the character display & reset stats
        renderTextDisplay();
        updateStats();
        syncInputBox();

        // Configure survival mode atmosphere & lives stat card
        if (isLivesMode) {
            document.body.classList.add('survival-active');
            livesStatCard.classList.remove('hidden');
            statsBar.classList.add('has-lives');
            updateLivesUI();
        } else {
            document.body.classList.remove('survival-active');
            livesStatCard.classList.add('hidden');
            statsBar.classList.remove('has-lives');
        }

        // Configure Fade Mode atmosphere
        if (isFadeMode) {
            document.body.classList.add('fade-active');
        } else {
            document.body.classList.remove('fade-active');
        }

        // Configure Practice Mode Atmosphere (Anti-Cheat)
        if (!isEligibleForAchievements) {
            document.body.classList.add('practice-active');
            if (practiceModeBanner) practiceModeBanner.classList.remove('hidden');
        } else {
            document.body.classList.remove('practice-active');
            if (practiceModeBanner) practiceModeBanner.classList.add('hidden');
        }

        // Configure Streak Combo (Siempre activo)
        currentCombo = 0;
        deactivateFire();
        updateComboUI();
        if (comboStatCard) {
            comboStatCard.classList.remove('hidden');
        }

        // Configure Storm Mode
        clearStorm();
        if (isStormMode) {
            document.body.classList.add('storm-active');
        } else {
            document.body.classList.remove('storm-active');
        }

        // Configure Dead Zone
        clearDeadzone();
        if (isDeadzoneMode) {
            pickDeadKeys();
            document.body.classList.add('deadzone-active');
            if (deadzoneBanner) deadzoneBanner.classList.remove('hidden');
        } else {
            document.body.classList.remove('deadzone-active');
            if (deadzoneBanner) deadzoneBanner.classList.add('hidden');
        }

        // Switch to typing view
        showSection('typing');
        typingInput.classList.remove('has-error');
        typingInput.classList.remove('damage-hit');
        typingInput.disabled = true;

        // Start 3-second animated countdown
        startCountdown(() => {
            typingInput.disabled = false;
            typingInput.focus();
        });
    }

    // ===== Lives Mode Helpers =====
    function updateLivesUI() {
        if (!isLivesMode) return;
        livesCountDisplay.textContent = currentLives;

        if (maxLives === 1) {
            livesHeartsDisplay.textContent = currentLives === 1 ? '💀' : '☠️';
        } else {
            livesHeartsDisplay.textContent = '❤️'.repeat(Math.max(0, currentLives)) + '🖤'.repeat(Math.max(0, maxLives - currentLives));
        }
    }

    // ===== 3s Countdown =====
    function startCountdown(callback) {
        isCountingDown = true;
        countdownOverlay.classList.remove('hidden');

        function triggerPulse(numText, labelText) {
            countdownNumber.textContent = numText;
            countdownLabel.textContent = labelText;
            countdownNumber.classList.remove('pulse');
            void countdownNumber.offsetWidth; // Force CSS reflow to re-trigger animation
            countdownNumber.classList.add('pulse');
        }

        let currentCount = 3;
        triggerPulse('3', '¡Prepárate!');

        countdownInterval = setInterval(() => {
            currentCount--;
            if (currentCount === 2) {
                triggerPulse('2', '¡Listo!');
            } else if (currentCount === 1) {
                triggerPulse('1', '¡A escribir!');
            } else if (currentCount === 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                triggerPulse('¡YA!', '¡Adelante!');

                countdownTimeout = setTimeout(() => {
                    countdownOverlay.classList.add('hidden');
                    isCountingDown = false;
                    if (typeof callback === 'function') {
                        callback();
                    }
                }, 500);
            }
        }, 1000);
    }

    function clearCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        if (countdownTimeout) {
            clearTimeout(countdownTimeout);
            countdownTimeout = null;
        }
        isCountingDown = false;
        if (countdownOverlay) {
            countdownOverlay.classList.add('hidden');
        }
    }

    // ===== Render Text Display =====
    function renderTextDisplay() {
        textDisplay.innerHTML = '';
        charSpans = [];

        let currentWord = document.createElement('span');
        currentWord.className = 'word';

        characters.forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char;

            if (i === 0) {
                span.classList.add('char-current');
            } else {
                span.classList.add('char-pending');
            }

            if (char === ' ') {
                span.classList.add('char-space');
                if (currentWord.children.length > 0) {
                    textDisplay.appendChild(currentWord);
                    currentWord = document.createElement('span');
                    currentWord.className = 'word';
                }
                textDisplay.appendChild(span);
            } else {
                currentWord.appendChild(span);
            }

            charSpans.push(span);
        });

        if (currentWord.children.length > 0) {
            textDisplay.appendChild(currentWord);
        }
    }

    // ===== Handle Input (character typed) =====
    function handleInput(e) {
        if (isFinished || isCountingDown || isGameOver) return;

        // Start timer on first keypress
        if (!isStarted) {
            isStarted = true;
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 100);

            // Kick off fade loop on first keypress
            if (isFadeMode) {
                startFadeLoop();
            }

            // Kick off storm loop on first keypress
            if (isStormMode) {
                startStormLoop();
            }
        }

        const prevWord = getCurrentWordTyped();
        const inputVal = typingInput.value;

        if (inputVal.length > prevWord.length) {
            // New character(s) typed or pasted
            const newChars = inputVal.slice(prevWord.length);
            for (const char of newChars) {
                if (typedChars.length >= characters.length) break;

                const expectedChar = characters[typedChars.length];
                const isDeadKey = isDeadKeyChar(expectedChar);

                if (isDeadKey) {
                    // In Dead Zone: only [Space] skips the broken key
                    if (char === ' ') {
                        typedChars.push(expectedChar); // Mark as correctly resolved
                        totalKeystrokes++;
                        correctKeystrokes++;
                        currentCombo++;
                        if (currentCombo >= FIRE_THRESHOLD && !isOnFire) {
                            activateFire();
                        }

                        // Si el carácter esperado era un espacio y no hubo errores en la palabra
                        if (expectedChar === ' ') {
                            if (!currentWordHadError) {
                                currentWordStreak++;
                                userStats.maxWordStreak = Math.max(userStats.maxWordStreak, currentWordStreak);
                                saveUserStats();
                                checkStreakAchievements();
                            }
                            currentWordHadError = false;
                        }
                    } else {
                        // Any other key (including pressing the broken key itself) is an ERROR!
                        typedChars.push(char === expectedChar ? '•' : char);
                        totalKeystrokes++;
                        totalErrors++;
                        currentCombo = 0;
                        currentWordHadError = true;
                        currentWordStreak = 0;
                        if (isOnFire) {
                            deactivateFire();
                        }
                        if (isLivesMode) {
                            currentLives--;
                            updateLivesUI();
                            typingInput.classList.remove('damage-hit');
                            void typingInput.offsetWidth; // Force reflow to re-trigger animation
                            typingInput.classList.add('damage-hit');
                            if (currentLives <= 0) {
                                syncInputBox();
                                updateDisplay();
                                updateStats();
                                updateComboUI();
                                triggerGameOver();
                                return;
                            }
                        }
                    }
                } else {
                    // Normal key comparison
                    typedChars.push(char);
                    totalKeystrokes++;

                    if (char === expectedChar) {
                        correctKeystrokes++;
                        currentCombo++;
                        if (currentCombo >= FIRE_THRESHOLD && !isOnFire) {
                            activateFire();
                        }

                        // Si se completó una palabra al pulsar espacio con éxito
                        if (expectedChar === ' ') {
                            if (!currentWordHadError) {
                                currentWordStreak++;
                                userStats.maxWordStreak = Math.max(userStats.maxWordStreak, currentWordStreak);
                                saveUserStats();
                                checkStreakAchievements();
                            }
                            currentWordHadError = false;
                        }
                    } else {
                        totalErrors++;
                        currentCombo = 0;
                        currentWordHadError = true;
                        currentWordStreak = 0;
                        if (isOnFire) {
                            deactivateFire();
                        }

                        // ===== LIVES MODE: Deduct a life on each error =====
                        if (isLivesMode) {
                            currentLives--;
                            updateLivesUI();

                            // Damage hit visual feedback
                            typingInput.classList.remove('damage-hit');
                            void typingInput.offsetWidth; // Force reflow to re-trigger animation
                            typingInput.classList.add('damage-hit');

                            // Game Over if no lives left
                            if (currentLives <= 0) {
                                syncInputBox();
                                updateDisplay();
                                updateStats();
                                updateComboUI();
                                triggerGameOver();
                                return;
                            }
                        }
                    }
                }
                updateComboUI();
            }
        } else if (inputVal.length < prevWord.length) {
            // Deletion via mobile/IME input event
            const diff = prevWord.length - inputVal.length;
            for (let i = 0; i < diff; i++) {
                if (typedChars.length > 0) {
                    typedChars.pop();
                }
            }
        }

        // Sync input box value & placeholder
        syncInputBox();

        // Update display and stats
        updateDisplay();
        updateStats();
        scrollToCurrent();

        // Check collision in Fade Mode immediately if user is behind or left errors behind
        if (isFadeMode && isStarted) {
            const consecutiveCorrect = getConsecutiveCorrect();
            if (fadeIndex > consecutiveCorrect) {
                triggerGhostOver();
                return;
            }
        }

        // Check if test is complete
        checkCompletion();
    }

    // ===== Handle Keydown (Backspace, Tab) =====
    function handleKeydown(e) {
        if (isFinished || isCountingDown || isGameOver) return;

        if (e.key === 'Backspace') {
            e.preventDefault();
            if (typedChars.length > 0) {
                // In Fade Mode: cannot backspace into characters that have already vanished
                if (isFadeMode && typedChars.length <= fadeIndex) {
                    triggerGhostOver();
                    return;
                }
                typedChars.pop();
                syncInputBox();
                updateDisplay();
                updateStats();
                scrollToCurrent();
            }
        }

        // Prevent Tab from leaving
        if (e.key === 'Tab') {
            e.preventDefault();
        }
    }

    // ===== Update Display =====
    function updateDisplay() {
        let hasError = false;

        for (let i = 0; i < characters.length; i++) {
            const span = charSpans[i];
            const expectedChar = characters[i];

            // Remove all state classes
            span.classList.remove('char-pending', 'char-correct', 'char-error', 'char-current', 'char-on-fire');

            if (i < typedChars.length) {
                if (typedChars[i] === expectedChar) {
                    // Correct character
                    span.classList.add('char-correct');
                    if (isOnFire) {
                        span.classList.add('char-on-fire');
                    }
                    span.textContent = expectedChar;
                } else {
                    // Wrong character — show what the user actually typed
                    hasError = true;
                    span.classList.add('char-error');
                    if (typedChars[i] === ' ') {
                        span.textContent = '·'; // Visible space indicator for wrong space
                    } else {
                        span.textContent = typedChars[i];
                    }
                }
            } else if (i === typedChars.length) {
                // Cursor position
                span.classList.add('char-current');
                span.textContent = expectedChar;
            } else {
                // Not yet reached
                span.classList.add('char-pending');
                span.textContent = expectedChar;
            }
        }

        // Input border glow changes when there are errors
        if (hasError) {
            typingInput.classList.add('has-error');
        } else {
            typingInput.classList.remove('has-error');
        }
    }

    // ===== Get Consecutive Correct Count =====
    // Counts correct characters from the beginning until the first error
    function getConsecutiveCorrect() {
        let count = 0;
        for (let i = 0; i < typedChars.length; i++) {
            if (typedChars[i] === characters[i]) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    // ===== Scroll to Current Character =====
    function scrollToCurrent() {
        const cursorIndex = typedChars.length;
        if (cursorIndex >= characters.length) return;

        const currentEl = charSpans[cursorIndex];
        if (!currentEl) return;

        const container = textDisplay;
        const elTop = currentEl.offsetTop;
        const containerHeight = container.clientHeight;
        const scrollTop = container.scrollTop;

        if (elTop > scrollTop + containerHeight - 60) {
            container.scrollTo({
                top: elTop - containerHeight / 2,
                behavior: 'smooth'
            });
        } else if (elTop < scrollTop + 20) {
            container.scrollTo({
                top: Math.max(0, elTop - 20),
                behavior: 'smooth'
            });
        }
    }

    // ===== Update Stats =====
    function updateStats() {
        const elapsed = getElapsedSeconds();
        const minutes = elapsed / 60;
        const consecutiveCorrect = getConsecutiveCorrect();

        // WPM: only consecutive correct characters count
        let wpm = 0;
        if (minutes > 0) {
            wpm = Math.round((consecutiveCorrect / 5) / minutes);
        }

        // Accuracy: correct keystrokes / total keystrokes
        let accuracy = 100;
        if (totalKeystrokes > 0) {
            accuracy = Math.round((correctKeystrokes / totalKeystrokes) * 100);
        }

        // Progress: based on consecutive correct (must reach 100%)
        const progress = characters.length > 0
            ? Math.round((consecutiveCorrect / characters.length) * 100)
            : 0;

        // Update DOM
        wpmDisplay.textContent = wpm;
        accuracyDisplay.innerHTML = accuracy + '<small>%</small>';
        errorsDisplay.textContent = totalErrors;

        progressBar.style.width = progress + '%';
        progressText.textContent = progress + '%';

        // Color progress based on completion
        if (progress >= 100) {
            progressText.style.color = 'var(--accent-secondary)';
        } else if (progress >= 75) {
            progressText.style.color = 'var(--accent-primary)';
        } else {
            progressText.style.color = '';
        }
    }

    // ===== Update Timer =====
    function updateTimer() {
        const elapsed = getElapsedSeconds();
        const mins = Math.floor(elapsed / 60);
        const secs = Math.floor(elapsed % 60);
        timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

        // Also update WPM in real-time
        updateStats();
    }

    // ===== Get Elapsed Seconds =====
    function getElapsedSeconds() {
        if (!startTime) return 0;
        return (Date.now() - startTime) / 1000;
    }

    // ===== Format Time =====
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ===== Check Completion =====
    function checkCompletion() {
        // Test is complete when ALL characters are typed correctly
        const consecutiveCorrect = getConsecutiveCorrect();
        if (consecutiveCorrect === characters.length && typedChars.length === characters.length) {
            finishTest();
        }
    }

    // ===== Fade Mode: Loop Engine =====
    function startFadeLoop() {
        fadeIndex = 0;
        fadeAccumulator = 0;
        fadePrevTimestamp = null;

        function fadeTick(timestamp) {
            if (isFinished || isGameOver) return;

            if (fadePrevTimestamp === null) fadePrevTimestamp = timestamp;
            const deltaMs = timestamp - fadePrevTimestamp;
            fadePrevTimestamp = timestamp;

            // chars per second = (WPM * 5) / 60
            const charsPerSec = (fadeWpm * 5) / 60;
            const charsPerMs = charsPerSec / 1000;

            fadeAccumulator += deltaMs * charsPerMs;

            // Advance fadeIndex by however many whole chars have accumulated
            while (fadeAccumulator >= 1 && fadeIndex < characters.length) {
                fadeAccumulator -= 1;

                // Remove ghost-front from previous leading edge
                if (fadeIndex > 0 && charSpans[fadeIndex - 1]) {
                    charSpans[fadeIndex - 1].classList.remove('char-ghost-front');
                }

                // Fade the current char
                const span = charSpans[fadeIndex];
                if (span) {
                    span.classList.add('char-faded');
                }

                fadeIndex++;

                // Mark the new leading edge with ghost glow
                if (fadeIndex < characters.length && charSpans[fadeIndex]) {
                    charSpans[fadeIndex].classList.add('char-ghost-front');
                }

                // === COLLISION CHECK ===
                const consecutiveCorrect = getConsecutiveCorrect();
                if (fadeIndex > consecutiveCorrect) {
                    triggerGhostOver();
                    return; // Stop the loop
                }
            }

            fadeRafId = requestAnimationFrame(fadeTick);
        }

        fadeRafId = requestAnimationFrame(fadeTick);
    }

    function stopFadeLoop() {
        if (fadeRafId !== null) {
            cancelAnimationFrame(fadeRafId);
            fadeRafId = null;
        }
        fadePrevTimestamp = null;
    }

    // ===== STREAK COMBO HELPERS =====
    function updateComboUI() {
        if (!comboCountDisplay) return;
        comboCountDisplay.textContent = currentCombo;
    }

    function activateFire() {
        isOnFire = true;
        textDisplay.classList.add('on-fire');
        typingInput.classList.add('on-fire-border');
        if (comboLabelDisplay) {
            comboLabelDisplay.textContent = '⚡ RACHA';
            comboLabelDisplay.style.color = '#22c55e';
        }
    }

    function deactivateFire() {
        isOnFire = false;
        textDisplay.classList.remove('on-fire');
        typingInput.classList.remove('on-fire-border');
        if (comboLabelDisplay) {
            comboLabelDisplay.textContent = 'Combo';
            comboLabelDisplay.style.color = '';
        }
    }

    // ===== STORM MODE HELPERS =====
    function startStormLoop() {
        clearStorm();
        stormInterval = setInterval(scrambleRandomChars, 4000);
    }

    function scrambleRandomChars() {
        if (isFinished || isGameOver) return;

        // Solo buscar caracteres adelante del cursor (typedChars.length + 1)
        // que no hayan sido transformados antes y que no sean espacios
        const availableIndices = [];
        for (let i = typedChars.length + 1; i < characters.length; i++) {
            if (characters[i] !== ' ' && !scrambledPositions.has(i)) {
                availableIndices.push(i);
            }
        }

        if (availableIndices.length === 0) return;

        // Elegir de 1 a 2 letras nuevas adelante
        const count = Math.min(Math.floor(Math.random() * 2) + 1, availableIndices.length);
        const symbols = ['@', '#', '$', '*', '&', '!', '?', '%'];

        for (let i = 0; i < count; i++) {
            const slot = Math.floor(Math.random() * availableIndices.length);
            const targetIndex = availableIndices.splice(slot, 1)[0];
            const sym = symbols[Math.floor(Math.random() * symbols.length)];

            // Se queda transformado permanentemente
            characters[targetIndex] = sym;
            if (charSpans[targetIndex]) {
                charSpans[targetIndex].textContent = sym;
                charSpans[targetIndex].classList.add('char-scrambled');
            }

            scrambledPositions.add(targetIndex);
        }
    }

    function clearStorm() {
        if (stormInterval) {
            clearInterval(stormInterval);
            stormInterval = null;
        }
        scrambledPositions.clear();
    }

    // ===== DEAD ZONE HELPERS =====
    function normalizeLetter(c) {
        if (!c) return '';
        return c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function isDeadKeyChar(c) {
        if (!isDeadzoneMode || deadKeys.length === 0 || !c) return false;
        const norm = normalizeLetter(c);
        return deadKeys.some(k => normalizeLetter(k) === norm);
    }

    function pickDeadKeys() {
        deadKeys = [];
        // Extraer letras alfabéticas únicas del texto actual
        const lettersInText = Array.from(new Set(
            characters
                .map(c => normalizeLetter(c))
                .filter(c => /^[a-zñ]$/i.test(c))
        ));

        if (lettersInText.length >= 3) {
            const shuffled = lettersInText.sort(() => 0.5 - Math.random());
            deadKeys = shuffled.slice(0, 3);
        } else if (lettersInText.length === 2) {
            deadKeys = [lettersInText[0], lettersInText[1], 'a'];
        } else if (lettersInText.length === 1) {
            deadKeys = [lettersInText[0], 'e', 'a'];
        } else {
            deadKeys = ['a', 'e', 'o'];
        }

        if (deadzoneKeysDisplay) {
            deadzoneKeysDisplay.innerHTML = deadKeys
                .map(k => `<span class="deadzone-key-pill">[${k.toLowerCase()}]</span>`)
                .join(', ');
        }
    }

    function clearDeadzone() {
        deadKeys = [];
        if (deadzoneBanner) deadzoneBanner.classList.add('hidden');
    }

    // ===== ACHIEVEMENTS DEFINITION & DATA =====
    const ACHIEVEMENTS_LIST = [
        // 1. Categoría: Rachas de Palabras Correctas Seguidas (Sin cometer errores)
        {
            id: 'racha-bronce',
            titulo: 'Racha Bronce',
            descripcion: 'Conseguir una racha de 30 palabras seguidas sin cometer errores.',
            categoria: 'rachas',
            icono: '🥉',
            completado: false,
            fecha: null
        },
        {
            id: 'racha-plata',
            titulo: 'Racha Plata',
            descripcion: 'Conseguir una racha de 90 palabras seguidas sin cometer errores.',
            categoria: 'rachas',
            icono: '🥈',
            completado: false,
            fecha: null
        },
        {
            id: 'racha-oro',
            titulo: 'Racha Oro',
            descripcion: 'Conseguir una racha de 200 palabras seguidas sin cometer errores.',
            categoria: 'rachas',
            icono: '🥇',
            completado: false,
            fecha: null
        },
        {
            id: 'racha-platino',
            titulo: 'Racha Platino',
            descripcion: 'Conseguir una racha de 500 palabras seguidas sin cometer errores.',
            categoria: 'rachas',
            icono: '💎',
            completado: false,
            fecha: null
        },
        {
            id: 'racha-divina',
            titulo: 'Racha Divina',
            descripcion: 'Conseguir una racha de 1000 palabras seguidas (Dificultad extrema).',
            categoria: 'rachas',
            icono: '👑',
            completado: false,
            fecha: null
        },

        // 2. Categoría: Velocidad Pura (Palabras por Minuto - WPM)
        {
            id: 'wpm-40',
            titulo: 'Velocidad Crucero',
            descripcion: 'Alcanzar 40 WPM en una prueba completada.',
            categoria: 'velocidad',
            icono: '🚗',
            completado: false,
            fecha: null
        },
        {
            id: 'wpm-60',
            titulo: 'Mecanógrafo Veloz',
            descripcion: 'Alcanzar 60 WPM en una prueba completada.',
            categoria: 'velocidad',
            icono: '⚡',
            completado: false,
            fecha: null
        },
        {
            id: 'wpm-80',
            titulo: 'Rompiendo la Barrera',
            descripcion: 'Alcanzar 80 WPM en una prueba completada.',
            categoria: 'velocidad',
            icono: '🚀',
            completado: false,
            fecha: null
        },
        {
            id: 'wpm-120',
            titulo: 'Modo Dios',
            descripcion: 'Alcanzar 120 WPM en una prueba completada.',
            categoria: 'velocidad',
            icono: '🔮',
            completado: false,
            fecha: null
        },
        {
            id: 'wpm-160',
            titulo: 'Inalcanzable',
            descripcion: 'Alcanzar 160 WPM o más en una prueba completada.',
            categoria: 'velocidad',
            icono: '🌌',
            completado: false,
            fecha: null
        },

        // 3. Categoría: Precisión Perfecta (100% Accuracy)
        {
            id: 'acc-50',
            titulo: 'Cirujano del Teclado',
            descripcion: 'Terminar un texto de más de 50 palabras con 100% de precisión.',
            categoria: 'precision',
            icono: '🎯',
            completado: false,
            fecha: null
        },
        {
            id: 'acc-150',
            titulo: 'Mente Fría',
            descripcion: 'Terminar un texto de más de 150 palabras con 100% de precisión.',
            categoria: 'precision',
            icono: '❄️',
            completado: false,
            fecha: null
        },

        // 4. Categoría: Modo Vidas (Supervivencia)
        {
            id: 'survivor-med',
            titulo: 'Sobreviviente',
            descripcion: 'Completar un texto en dificultad "Medio" (5 vidas) sin morir.',
            categoria: 'vidas',
            icono: '🛡️',
            completado: false,
            fecha: null
        },
        {
            id: 'survivor-exp',
            titulo: 'Inmortal',
            descripcion: 'Completar un texto en dificultad "Experto" (1 vida) con éxito.',
            categoria: 'vidas',
            icono: '💀',
            completado: false,
            fecha: null
        },

        // 5. Categoría: Persistencia (Consistencia en el tiempo)
        {
            id: 'tests-10',
            titulo: 'Adicto al Click',
            descripcion: 'Completar 10 pruebas en total.',
            categoria: 'persistencia',
            icono: '⌨️',
            completado: false,
            fecha: null
        },
        {
            id: 'tests-100',
            titulo: 'Leyenda Local',
            descripcion: 'Completar 100 pruebas en total.',
            categoria: 'persistencia',
            icono: '🏆',
            completado: false,
            fecha: null
        },
        {
            id: 'tests-500',
            titulo: 'Gran Maestro',
            descripcion: 'Completar 500 pruebas en total.',
            categoria: 'persistencia',
            icono: '🌟',
            completado: false,
            fecha: null
        }
    ];

    // ===== ACHIEVEMENTS HELPERS & STORAGE =====
    function loadAchievementsFromStorage() {
        try {
            const stored = localStorage.getItem('speedtype-achievements-data');
            if (stored) {
                const data = JSON.parse(stored);
                ACHIEVEMENTS_LIST.forEach(ach => {
                    if (data[ach.id] && data[ach.id].completado) {
                        ach.completado = true;
                        ach.fecha = data[ach.id].fecha || null;
                    }
                });
            }
        } catch (e) {
            console.warn('Error loading achievements from storage:', e);
        }
    }

    function saveAchievementsToStorage() {
        try {
            const data = {};
            ACHIEVEMENTS_LIST.forEach(ach => {
                if (ach.completado) {
                    data[ach.id] = {
                        completado: true,
                        fecha: ach.fecha
                    };
                }
            });
            localStorage.setItem('speedtype-achievements-data', JSON.stringify(data));
        } catch (e) {
            console.warn('Error saving achievements to storage:', e);
        }
    }

    function saveUserStats() {
        try {
            localStorage.setItem('speedtype-user-stats', JSON.stringify(userStats));
        } catch (e) {
            console.warn('Error saving user stats:', e);
        }
    }

    function updateAchievementsBadge() {
        const completedCount = ACHIEVEMENTS_LIST.filter(a => a.completado).length;
        const totalCount = ACHIEVEMENTS_LIST.length;
        const pct = Math.round((completedCount / totalCount) * 100);

        if (achievementsBadgeCount) {
            achievementsBadgeCount.textContent = `${completedCount}/${totalCount}`;
        }
        if (achievementsProgressScore) {
            achievementsProgressScore.textContent = `${completedCount} / ${totalCount} (${pct}%)`;
        }
        if (achievementsBarFill) {
            achievementsBarFill.style.width = `${pct}%`;
        }
    }

    function renderAchievementsGrid() {
        if (!achievementsGrid) return;
        achievementsGrid.innerHTML = '';

        const list = selectedAchievementCat === 'all'
            ? ACHIEVEMENTS_LIST
            : ACHIEVEMENTS_LIST.filter(a => a.categoria === selectedAchievementCat);

        list.forEach(ach => {
            const card = document.createElement('div');
            card.className = `ach-card ${ach.completado ? 'ach-unlocked' : 'ach-locked'}`;
            card.innerHTML = `
                <div class="ach-card-top">
                    <span class="ach-card-icon">${ach.icono}</span>
                    <span class="ach-status-badge">
                        ${ach.completado ? '✓ Desbloqueado' : '🔒 Bloqueado'}
                    </span>
                </div>
                <div class="ach-card-title">${ach.titulo}</div>
                <div class="ach-card-desc">${ach.descripcion}</div>
                ${ach.completado && ach.fecha ? `
                    <div class="ach-card-date">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Desbloqueado: ${ach.fecha}
                    </div>
                ` : ''}
            `;
            achievementsGrid.appendChild(card);
        });
    }

    // ===== PREVENCIÓN OBLIGATORIA DEL BUG DE DUPLICACIÓN =====
    function unlockAchievement(id) {
        // 0. Verificación Anti-Cheat: Si el texto no es elegible para logros (Modo Práctica), abortar
        if (!isEligibleForAchievements) {
            return;
        }

        const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
        if (!ach) return;

        // 1. Verificación obligatoria: si el campo completado ya es true, ignorar inmediatamente
        if (ach.completado === true) {
            return;
        }

        // Doble verificación directa contra localStorage
        try {
            const raw = localStorage.getItem('speedtype-achievements-data');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed[id] && parsed[id].completado === true) {
                    ach.completado = true;
                    ach.fecha = parsed[id].fecha || null;
                    return;
                }
            }
        } catch (e) {}

        // 2. Cambiar inmediatamente el estado a true
        ach.completado = true;
        const now = new Date();
        const formattedDate = now.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        ach.fecha = formattedDate;

        // 3. Sincronizar inmediatamente con localStorage ANTES de cualquier animación o renderizado
        saveAchievementsToStorage();

        // 4. Actualizar la UI del contador y del modal si está visible
        updateAchievementsBadge();
        renderAchievementsGrid();

        // 5. Disparar notificación toast visual
        showAchievementToast(ach.icono, ach.titulo, ach.descripcion);
    }

    function checkStreakAchievements() {
        if (currentWordStreak >= 30) unlockAchievement('racha-bronce');
        if (currentWordStreak >= 90) unlockAchievement('racha-plata');
        if (currentWordStreak >= 200) unlockAchievement('racha-oro');
        if (currentWordStreak >= 500) unlockAchievement('racha-platino');
        if (currentWordStreak >= 1000) unlockAchievement('racha-divina');
    }

    function checkAllAchievements(stats) {
        if (stats.isGameOver || stats.isGhostOver) return;

        const totalWordsInText = originalText.trim().split(/\s+/).filter(Boolean).length;

        // --- Categoría: Velocidad Pura ---
        if (stats.wpm >= 40) unlockAchievement('wpm-40');
        if (stats.wpm >= 60) unlockAchievement('wpm-60');
        if (stats.wpm >= 80) unlockAchievement('wpm-80');
        if (stats.wpm >= 120) unlockAchievement('wpm-120');
        if (stats.wpm >= 160) unlockAchievement('wpm-160');

        // --- Categoría: Precisión Perfecta ---
        if (stats.accuracy === 100 && totalWordsInText >= 50) {
            unlockAchievement('acc-50');
        }
        if (stats.accuracy === 100 && totalWordsInText >= 150) {
            unlockAchievement('acc-150');
        }

        // --- Categoría: Modo Vidas (Supervivencia) ---
        if (isLivesMode && !stats.isGameOver) {
            if (maxLives === 5) {
                unlockAchievement('survivor-med');
            }
            if (maxLives === 1) {
                unlockAchievement('survivor-exp');
            }
        }

        // --- Categoría: Persistencia ---
        if (userStats.testsCompleted >= 10) unlockAchievement('tests-10');
        if (userStats.testsCompleted >= 100) unlockAchievement('tests-100');
        if (userStats.testsCompleted >= 500) unlockAchievement('tests-500');
    }

    function showAchievementToast(icon, title, desc) {
        if (!achievementContainer) return;

        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="achievement-icon">${icon}</div>
            <div class="achievement-text">
                <span class="achievement-badge">🏆 ¡Logro Desbloqueado!</span>
                <span class="achievement-title">${title}</span>
                <span class="achievement-desc">${desc}</span>
            </div>
        `;

        achievementContainer.appendChild(toast);

        // Desaparece a los 4 segundos con transición suave
        setTimeout(() => {
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 400);
        }, 4000);
    }

    // ===== Game Over by Ghost Collision (Fade Mode) =====
    function triggerGhostOver() {
        stopFadeLoop();
        clearStorm();
        deactivateFire();
        currentWordStreak = 0;
        currentWordHadError = true;
        isGameOver = true;
        isFinished = true;
        clearInterval(timerInterval);

        // Block input immediately
        typingInput.disabled = true;
        typingInput.value = '¡DESVANECIDO!';

        const elapsed = getElapsedSeconds();
        const minutes = elapsed / 60;
        const consecutiveCorrect = getConsecutiveCorrect();
        const wpm = minutes > 0 ? Math.round((consecutiveCorrect / 5) / minutes) : 0;
        const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 0;

        resultWpm.textContent = wpm;
        resultAccuracy.textContent = accuracy + '%';
        resultTime.textContent = formatTime(elapsed);
        resultErrors.textContent = totalErrors;

        // Cyan ghost-over style
        resultsCard.classList.remove('game-over-state');
        resultsCard.classList.add('ghost-over-state');
        resultsTitle.textContent = '¡Te atrapó la sombra!';
        resultsSubtitle.textContent = 'El desvanecimiento alcanzó una letra incorrecta o te quedaste atrás';

        setTimeout(() => {
            showSection('results');
        }, 450);
    }

    // ===== Finish Test =====
    function finishTest() {
        stopFadeLoop();
        clearStorm();
        deactivateFire();
        isFinished = true;
        clearInterval(timerInterval);

        // Si la última palabra no tuvo errores, contarla en la racha
        if (!currentWordHadError) {
            currentWordStreak++;
            userStats.maxWordStreak = Math.max(userStats.maxWordStreak, currentWordStreak);
            checkStreakAchievements();
            currentWordHadError = false;
        }

        // Incrementar y persistir pruebas completadas
        userStats.testsCompleted = (userStats.testsCompleted || 0) + 1;
        saveUserStats();

        const elapsed = getElapsedSeconds();
        const minutes = elapsed / 60;
        const wpm = minutes > 0 ? Math.round((characters.length / 5) / minutes) : 0;
        const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

        // Reset results card to normal state
        resultsCard.classList.remove('game-over-state', 'ghost-over-state');
        resultsTitle.textContent = '¡Prueba completada!';
        resultsSubtitle.textContent = 'Aquí están tus resultados';

        // Fill results
        resultWpm.textContent = wpm;
        resultAccuracy.textContent = accuracy + '%';
        resultTime.textContent = formatTime(elapsed);
        resultErrors.textContent = totalErrors;

        // Evaluar logros de fin de prueba
        checkAllAchievements({
            wpm: wpm,
            accuracy: accuracy,
            isGameOver: false,
            isGhostOver: false
        });

        // Show results after a short delay for polish
        setTimeout(() => {
            showSection('results');
        }, 600);
    }

    // ===== Game Over (Lives Mode) =====
    function triggerGameOver() {
        stopFadeLoop();
        clearStorm();
        deactivateFire();
        currentWordStreak = 0;
        currentWordHadError = true;
        isGameOver = true;
        isFinished = true;
        clearInterval(timerInterval);

        // Block input immediately
        typingInput.disabled = true;
        typingInput.value = '¡GAME OVER!';

        const elapsed = getElapsedSeconds();
        const minutes = elapsed / 60;
        const consecutiveCorrect = getConsecutiveCorrect();
        const wpm = minutes > 0 ? Math.round((consecutiveCorrect / 5) / minutes) : 0;
        const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 0;

        // Fill results with stats up to the moment of death
        resultWpm.textContent = wpm;
        resultAccuracy.textContent = accuracy + '%';
        resultTime.textContent = formatTime(elapsed);
        resultErrors.textContent = totalErrors;

        // Style results card as Game Over
        resultsCard.classList.add('game-over-state');
        resultsTitle.textContent = '¡GAME OVER!';
        resultsSubtitle.textContent = 'Te has quedado sin vidas — modo supervivencia';

        // Show results after a short delay
        setTimeout(() => {
            showSection('results');
        }, 450);
    }

    // ===== Restart Test =====
    function restartTest() {
        stopFadeLoop();
        clearStorm();
        deactivateFire();
        clearInterval(timerInterval);
        clearCountdown();
        startTest();
    }

    // ===== Go to Setup =====
    function goToSetup() {
        stopFadeLoop();
        clearStorm();
        deactivateFire();
        clearDeadzone();
        clearInterval(timerInterval);
        clearCountdown();
        document.body.classList.remove('survival-active', 'fade-active', 'storm-active', 'deadzone-active', 'practice-active');
        if (practiceModeBanner) practiceModeBanner.classList.add('hidden');
        hideAntiCheatWarning();
        resultsCard.classList.remove('game-over-state', 'ghost-over-state');
        textInput.value = '';
        showSection('setup');
    }

    // ===== Show Section =====
    function showSection(name) {
        setupSection.classList.add('hidden');
        typingSection.classList.add('hidden');
        resultsSection.classList.add('hidden');

        const target = name === 'setup' ? setupSection :
                       name === 'typing' ? typingSection :
                       resultsSection;

        // Re-trigger animation
        target.style.animation = 'none';
        void target.offsetWidth; // force reflow
        target.style.animation = '';
        target.classList.remove('hidden');
    }

    // ===== Start App =====
    init();
})();
