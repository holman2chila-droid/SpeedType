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
        if (typedChars.length >= characters.length) {
            typingInput.placeholder = '¡Texto completado!';
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

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        clearCountdown();

        // Build the character display & reset stats
        renderTextDisplay();
        updateStats();
        syncInputBox();

        // Switch to typing view
        showSection('typing');
        typingInput.classList.remove('has-error');
        typingInput.disabled = true;

        // Start 3-second animated countdown
        startCountdown(() => {
            typingInput.disabled = false;
            typingInput.focus();
        });
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
        if (isFinished || isCountingDown) return;

        // Start timer on first keypress
        if (!isStarted) {
            isStarted = true;
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 100);
        }

        const prevWord = getCurrentWordTyped();
        const inputVal = typingInput.value;

        if (inputVal.length > prevWord.length) {
            // New character(s) typed or pasted
            const newChars = inputVal.slice(prevWord.length);
            for (const char of newChars) {
                if (typedChars.length >= characters.length) break;

                const expectedChar = characters[typedChars.length];
                typedChars.push(char);
                totalKeystrokes++;

                if (char === expectedChar) {
                    correctKeystrokes++;
                } else {
                    totalErrors++;
                }
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

        // Check if test is complete
        checkCompletion();
    }

    // ===== Handle Keydown (Backspace, Tab) =====
    function handleKeydown(e) {
        if (isFinished || isCountingDown) return;

        if (e.key === 'Backspace') {
            e.preventDefault();
            if (typedChars.length > 0) {
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
            span.classList.remove('char-pending', 'char-correct', 'char-error', 'char-current');

            if (i < typedChars.length) {
                if (typedChars[i] === expectedChar) {
                    // Correct character
                    span.classList.add('char-correct');
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

    // ===== Finish Test =====
    function finishTest() {
        isFinished = true;
        clearInterval(timerInterval);

        const elapsed = getElapsedSeconds();
        const minutes = elapsed / 60;
        const wpm = minutes > 0 ? Math.round((characters.length / 5) / minutes) : 0;
        const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

        // Fill results
        resultWpm.textContent = wpm;
        resultAccuracy.textContent = accuracy + '%';
        resultTime.textContent = formatTime(elapsed);
        resultErrors.textContent = totalErrors;

        // Show results after a short delay for polish
        setTimeout(() => {
            showSection('results');
        }, 600);
    }

    // ===== Restart Test =====
    function restartTest() {
        clearInterval(timerInterval);
        clearCountdown();
        startTest();
    }

    // ===== Go to Setup =====
    function goToSetup() {
        clearInterval(timerInterval);
        clearCountdown();
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
