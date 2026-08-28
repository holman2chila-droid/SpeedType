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

    // Achievement Container DOM
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
                startTest();
            }
        });

        startBtn.addEventListener('click', () => {
            startTest();
        });

        // --- Random Texts events ---
        function setRandomText(type) {
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

    // ===== Start Test =====
    function startTest() {
        // If text is empty, pick a random text from all categories
        if (textInput.value.trim().length === 0) {
            textInput.value = getRandomTextFromAll();
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
                    } else {
                        // Any other key (including pressing the broken key itself) is an ERROR!
                        typedChars.push(char === expectedChar ? '•' : char);
                        totalKeystrokes++;
                        totalErrors++;
                        currentCombo = 0;
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
                    } else {
                        totalErrors++;
                        currentCombo = 0;
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

    // ===== ACHIEVEMENTS SYSTEM =====
    function checkAchievements(stats) {
        const earned = [];

        // 1. "Cirujano": Precisión 100%
        if (stats.accuracy === 100 && totalKeystrokes >= 20) {
            earned.push({
                icon: '🎯',
                title: 'Cirujano',
                desc: '¡Completaste la prueba con 100% de precisión perfecta!'
            });
        }

        // 2. "Por un pelo": Completar modo vidas con 1 sola vida restante
        if (isLivesMode && !stats.isGameOver && currentLives === 1) {
            earned.push({
                icon: '😰',
                title: 'Por un pelo',
                desc: '¡Superaste el Modo Vidas con solo 1 vida restante!'
            });
        }

        // 3. "Velocidad de la luz": Superar 100 WPM
        if (stats.wpm >= 100) {
            earned.push({
                icon: '⚡',
                title: 'Velocidad de la luz',
                desc: '¡Alcanzaste una velocidad superior a 100 WPM!'
            });
        }

        // 4. "Inmune a las sombras": Superar Modo Desvanecimiento en modo Rápido (60 WPM)
        if (isFadeMode && fadeWpm === 60 && !stats.isGhostOver && !stats.isGameOver) {
            earned.push({
                icon: '👻',
                title: 'Inmune a las sombras',
                desc: '¡Completaste el Modo Desvanecimiento a 60 WPM Rápido!'
            });
        }

        // Show toasts with staggered delay
        earned.forEach((ach, index) => {
            setTimeout(() => {
                showAchievementToast(ach.icon, ach.title, ach.desc);
            }, 600 + index * 1400);
        });
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

        // Remove toast after 4 seconds
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
            checkAchievements({
                wpm: wpm,
                accuracy: accuracy,
                isGameOver: false,
                isGhostOver: true
            });
        }, 450);
    }

    // ===== Finish Test =====
    function finishTest() {
        stopFadeLoop();
        clearStorm();
        deactivateFire();
        isFinished = true;
        clearInterval(timerInterval);

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

        // Show results after a short delay for polish
        setTimeout(() => {
            showSection('results');
            checkAchievements({
                wpm: wpm,
                accuracy: accuracy,
                isGameOver: false,
                isGhostOver: false
            });
        }, 600);
    }

    // ===== Game Over (Lives Mode) =====
    function triggerGameOver() {
        stopFadeLoop();
        clearStorm();
        deactivateFire();
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
            checkAchievements({
                wpm: wpm,
                accuracy: accuracy,
                isGameOver: true,
                isGhostOver: false
            });
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
        document.body.classList.remove('survival-active', 'fade-active', 'storm-active', 'deadzone-active');
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
