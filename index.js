/* ============================================================
   TABLE TENNIS — ARCADE EDITION
   Complete game engine
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // ==================== DOM REFERENCES ====================
    const $ = (id) => document.getElementById(id);

    const startScreen    = $("start-screen");
    const pauseOverlay   = $("pause-overlay");
    const gameoverOverlay = $("gameover-overlay");
    const gameContainer  = $("game-container");
    const table          = $("ping-pong-table");
    const ball           = $("ball");
    const paddleLeft     = $("paddle-left");
    const paddleRight    = $("paddle-right");
    const scoreFlash     = $("score-flash");

    // HUD elements
    const p1ScoreEl      = $("p1-score");
    const p2ScoreEl      = $("p2-score");
    const p1NameEl       = $("p1-name");
    const p2NameEl       = $("p2-name");
    const p1ControlsEl   = $("p1-controls");
    const p2ControlsEl   = $("p2-controls");

    // Game over elements
    const winnerText     = $("winner-text");
    const finalScoreText = $("final-score-text");
    const highScoreValue = $("high-score-value");
    const gameoverHS     = $("gameover-high-score");

    // Buttons
    const startBtn       = $("start-btn");
    const resumeBtn      = $("resume-btn");
    const quitBtn        = $("quit-btn");
    const playAgainBtn   = $("play-again-btn");
    const menuBtn        = $("menu-btn");

    // Toggle groups
    const modeToggle     = $("mode-toggle");
    const diffToggle     = $("difficulty-toggle");


    // ==================== GAME CONSTANTS ====================
    const WIN_SCORE      = 7;              // first to 7 wins
    const PADDLE_HEIGHT  = 80;
    const PADDLE_WIDTH   = 14;
    const BALL_SIZE      = 16;
    const PADDLE_MARGIN  = 12;             // distance from table edge

    /** Difficulty presets: [ballSpeed, aiSpeed, aiReaction] */
    const DIFFICULTY = {
        easy:   { ballSpeed: 7,   aiSpeed: 5,   aiReaction: 0.5 },
        medium: { ballSpeed: 10, aiSpeed: 8,   aiReaction: 0.8 },
        hard:   { ballSpeed: 13, aiSpeed: 11,   aiReaction: 1 },
    };

    const SPEED_INCREMENT = 0.3;           // ball speeds up per paddle hit


    // ==================== GAME STATE ====================
    let state = {
        mode: "1P",                        // "1P" or "2P"
        difficulty: "medium",
        running: false,
        paused: false,
        p1Score: 0,
        p2Score: 0,

        // Ball
        ballX: 0,
        ballY: 0,
        dx: 0,                             // x velocity
        dy: 0,                             // y velocity
        ballSpeed: 4.5,
        currentSpeed: 4.5,

        // Paddles
        paddle1Y: 0,
        paddle2Y: 0,
        paddleSpeed: 6,

        // AI
        aiSpeed: 4,
        aiReaction: 0.07,
        aiTargetY: 0,

        // Input
        keysDown: {},

        // Animation frame ID
        animFrameId: null,

        // High score
        highScore: 0,

        // Rally counter (for speed increase)
        rallyCount: 0,
    };


    // ==================== SOUND SYSTEM ====================
    /**
     * Generates short beep sounds using the Web Audio API.
     * No external audio files needed!
     */
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    /** Lazy-init audio context (must happen after user gesture) */
    function ensureAudio() {
        if (!audioCtx) audioCtx = new AudioCtx();
    }

    /**
     * Play a short beep.
     * @param {number} freq   — frequency in Hz
     * @param {number} dur    — duration in seconds
     * @param {string} type   — oscillator waveform
     * @param {number} volume — gain (0-1)
     */
    function beep(freq = 440, dur = 0.08, type = "square", volume = 0.15) {
        try {
            ensureAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.value = volume;
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
            osc.stop(audioCtx.currentTime + dur);
        } catch (e) {
            // Silently fail if audio isn't available
        }
    }

    /** Paddle hit sound — higher pitch click */
    function soundPaddleHit()  { beep(600, 0.06, "square", 0.12); }

    /** Wall bounce sound — soft thud */
    function soundWallBounce() { beep(300, 0.05, "triangle", 0.08); }

    /** Score sound — triumphant rising tone */
    function soundScore() {
        beep(523, 0.12, "sine", 0.15);
        setTimeout(() => beep(659, 0.12, "sine", 0.15), 100);
        setTimeout(() => beep(784, 0.18, "sine", 0.18), 200);
    }

    /** Game over fanfare */
    function soundGameOver() {
        beep(523, 0.15, "sine", 0.2);
        setTimeout(() => beep(659, 0.15, "sine", 0.2),  120);
        setTimeout(() => beep(784, 0.15, "sine", 0.2),  240);
        setTimeout(() => beep(1047, 0.3, "sine", 0.25), 360);
    }


    // ==================== LOCAL STORAGE ====================
    function loadHighScore() {
        const saved = localStorage.getItem("tableTennisHighScore");
        state.highScore = saved ? parseInt(saved, 10) : 0;
        highScoreValue.textContent = state.highScore;
    }

    function saveHighScore(score) {
        if (score > state.highScore) {
            state.highScore = score;
            localStorage.setItem("tableTennisHighScore", score);
        }
    }


    // ==================== TABLE DIMENSIONS ====================
    /**
     * Returns the current table dimensions.
     * Called each frame to support responsive resizing.
     */
    function getTableRect() {
        return {
            w: table.clientWidth,
            h: table.clientHeight,
        };
    }


    // ==================== RESET & INITIALIZATION ====================

    /** Place the ball at center with a random direction */
    function resetBall(direction = 1) {
        const { w, h } = getTableRect();
        state.ballX = w / 2 - BALL_SIZE / 2;
        state.ballY = h / 2 - BALL_SIZE / 2;

        // Random angle between -30° and +30°
        const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
        state.dx = direction * Math.cos(angle) * state.currentSpeed;
        state.dy = Math.sin(angle) * state.currentSpeed;
        state.rallyCount = 0;
    }

    /** Initialize paddle positions to vertical center */
    function resetPaddles() {
        const { h } = getTableRect();
        state.paddle1Y = h / 2 - PADDLE_HEIGHT / 2;
        state.paddle2Y = h / 2 - PADDLE_HEIGHT / 2;
    }

    /** Full game reset */
    function resetGame() {
        const diff = DIFFICULTY[state.difficulty];
        state.ballSpeed    = diff.ballSpeed;
        state.currentSpeed = diff.ballSpeed;
        state.aiSpeed      = diff.aiSpeed;
        state.aiReaction   = diff.aiReaction;
        state.p1Score = 0;
        state.p2Score = 0;
        state.rallyCount = 0;
        state.keysDown = {};
        updateScoreDisplay();
        resetPaddles();
        resetBall(1);
    }


    // ==================== SCORE DISPLAY ====================
    function updateScoreDisplay() {
        p1ScoreEl.textContent = state.p1Score;
        p2ScoreEl.textContent = state.p2Score;
    }

    /** Big score flash animation on the table */
    function showScoreFlash(text) {
        scoreFlash.textContent = text;
        scoreFlash.classList.remove("hidden");
        // Force reflow to restart animation
        scoreFlash.style.animation = "none";
        scoreFlash.offsetHeight; // trigger reflow
        scoreFlash.style.animation = "";
        setTimeout(() => scoreFlash.classList.add("hidden"), 700);
    }


    // ==================== COLLISION DETECTION ====================
    /**
     * AABB collision between ball and a paddle.
     * Returns true if overlapping.
     */
    function checkPaddleCollision(paddleX, paddleY) {
        return (
            state.ballX < paddleX + PADDLE_WIDTH &&
            state.ballX + BALL_SIZE > paddleX &&
            state.ballY < paddleY + PADDLE_HEIGHT &&
            state.ballY + BALL_SIZE > paddleY
        );
    }


    // ==================== BALL MOVEMENT ====================
    function moveBall() {
        const { w, h } = getTableRect();

        // Move
        state.ballX += state.dx;
        state.ballY += state.dy;

        // --- Top / bottom wall bounce ---
        if (state.ballY <= 0) {
            state.ballY = 0;
            state.dy = Math.abs(state.dy);
            soundWallBounce();
        } else if (state.ballY >= h - BALL_SIZE) {
            state.ballY = h - BALL_SIZE;
            state.dy = -Math.abs(state.dy);
            soundWallBounce();
        }

        // --- Left paddle collision ---
        const p1X = PADDLE_MARGIN;
        if (checkPaddleCollision(p1X, state.paddle1Y)) {
            // Only bounce if ball is moving left
            if (state.dx < 0) {
                state.ballX = p1X + PADDLE_WIDTH;
                state.dx = Math.abs(state.dx);
                deflectBall(state.paddle1Y);
                onPaddleHit(paddleLeft);
            }
        }

        // --- Right paddle collision ---
        const p2X = w - PADDLE_MARGIN - PADDLE_WIDTH;
        if (checkPaddleCollision(p2X, state.paddle2Y)) {
            // Only bounce if ball is moving right
            if (state.dx > 0) {
                state.ballX = p2X - BALL_SIZE;
                state.dx = -Math.abs(state.dx);
                deflectBall(state.paddle2Y);
                onPaddleHit(paddleRight);
            }
        }

        // --- Scoring (ball goes past left or right edge) ---
        if (state.ballX <= -BALL_SIZE) {
            // Player 2 scores
            state.p2Score++;
            updateScoreDisplay();
            soundScore();
            showScoreFlash(`${state.p1Score} — ${state.p2Score}`);
            state.currentSpeed = state.ballSpeed; // reset speed
            checkGameOver() || resetBall(1);       // serve toward loser
        } else if (state.ballX >= w) {
            // Player 1 scores
            state.p1Score++;
            updateScoreDisplay();
            soundScore();
            showScoreFlash(`${state.p1Score} — ${state.p2Score}`);
            state.currentSpeed = state.ballSpeed;
            checkGameOver() || resetBall(-1);
        }
    }

    /**
     * Adjusts ball Y velocity based on where it hit the paddle.
     * Hitting the edge = steeper angle, center = flatter.
     */
    function deflectBall(paddleY) {
        const paddleCenter = paddleY + PADDLE_HEIGHT / 2;
        const ballCenter   = state.ballY + BALL_SIZE / 2;
        const offset       = (ballCenter - paddleCenter) / (PADDLE_HEIGHT / 2); // -1 to +1

        // Max deflection angle: 60°
        const maxAngle = 60 * (Math.PI / 180);
        const angle    = offset * maxAngle;

        const speed = Math.sqrt(state.dx * state.dx + state.dy * state.dy);
        const newSpeed = speed + SPEED_INCREMENT; // increase speed each hit!
        state.currentSpeed = newSpeed;
        state.rallyCount++;

        const dir = state.dx > 0 ? 1 : -1;
        state.dx = dir * Math.cos(angle) * newSpeed;
        state.dy = Math.sin(angle) * newSpeed;
    }

    /** Visual + audio feedback on paddle hit */
    function onPaddleHit(paddleEl) {
        soundPaddleHit();
        // Ball pulse
        ball.classList.add("pulse");
        setTimeout(() => ball.classList.remove("pulse"), 200);
        // Paddle hit flash
        paddleEl.classList.add("hit");
        setTimeout(() => paddleEl.classList.remove("hit"), 150);
    }


    // ==================== PADDLE MOVEMENT ====================
    function movePaddles() {
        const { h } = getTableRect();
        const speed = state.paddleSpeed;

        // --- Player 1 always uses W / S (both modes) ---
        if (state.keysDown["w"] || state.keysDown["W"]) state.paddle1Y -= speed;
        if (state.keysDown["s"] || state.keysDown["S"]) state.paddle1Y += speed;

        // --- In 1P mode: also allow arrow keys for Player 1 ---
        if (state.mode === "1P") {
            if (state.keysDown["ArrowUp"])   state.paddle1Y -= speed;
            if (state.keysDown["ArrowDown"]) state.paddle1Y += speed;
            moveAI(); // AI controls right paddle
        }

        // --- In 2P mode: Player 2 uses arrow keys ---
        if (state.mode === "2P") {
            if (state.keysDown["ArrowUp"])   state.paddle2Y -= speed;
            if (state.keysDown["ArrowDown"]) state.paddle2Y += speed;
        }

        // Clamp paddles within table
        state.paddle1Y = clamp(state.paddle1Y, 0, h - PADDLE_HEIGHT);
        state.paddle2Y = clamp(state.paddle2Y, 0, h - PADDLE_HEIGHT);
    }


    // ==================== AI LOGIC ====================
    /**
     * Simple AI that tracks the ball with a reaction delay.
     * Difficulty controls speed and reaction smoothness.
     */
    function moveAI() {
        const { h } = getTableRect();
        const ballCenterY = state.ballY + BALL_SIZE / 2;
        const paddleCenterY = state.paddle2Y + PADDLE_HEIGHT / 2;

        // Only actively track when ball is coming toward AI
        if (state.dx > 0) {
            // Smoothly move toward ball with reaction delay
            state.aiTargetY = ballCenterY - PADDLE_HEIGHT / 2;

            // Add slight imperfection based on difficulty
            const diff = state.aiTargetY - state.paddle2Y;
            state.paddle2Y += diff * state.aiReaction + Math.sign(diff) * Math.min(Math.abs(diff), state.aiSpeed);
        } else {
            // Ball going away → drift back toward center
            const center = h / 2 - PADDLE_HEIGHT / 2;
            const diff = center - state.paddle2Y;
            state.paddle2Y += diff * 0.02;
        }
    }


    // ==================== GAME OVER ====================
    function checkGameOver() {
        if (state.p1Score >= WIN_SCORE || state.p2Score >= WIN_SCORE) {
            state.running = false;
            cancelAnimationFrame(state.animFrameId);

            const winner = state.p1Score >= WIN_SCORE ? "PLAYER 1" : (state.mode === "1P" ? "CPU" : "PLAYER 2");
            winnerText.textContent = `${winner} WINS!`;
            finalScoreText.textContent = `${state.p1Score} — ${state.p2Score}`;

            // Save high score (winner's score)
            const winnerScore = Math.max(state.p1Score, state.p2Score);
            saveHighScore(winnerScore);
            gameoverHS.textContent = state.highScore;

            soundGameOver();
            showOverlay(gameoverOverlay);
            return true;
        }
        return false;
    }


    // ==================== RENDERING ====================
    function render() {
        const { w } = getTableRect();

        // Ball position
        ball.style.left = `${state.ballX}px`;
        ball.style.top  = `${state.ballY}px`;

        // Paddle positions
        paddleLeft.style.top  = `${state.paddle1Y}px`;
        paddleRight.style.top = `${state.paddle2Y}px`;
    }


    // ==================== GAME LOOP ====================
    /**
     * Main game loop using requestAnimationFrame for smooth 60fps.
     * Much better than setInterval(fn, 1)!
     */
    function gameLoop() {
        if (!state.running || state.paused) return;

        movePaddles();
        moveBall();
        render();

        state.animFrameId = requestAnimationFrame(gameLoop);
    }


    // ==================== SCREEN MANAGEMENT ====================
    function showOverlay(overlay) {
        [startScreen, pauseOverlay, gameoverOverlay].forEach(o => o.classList.add("hidden"));
        if (overlay) overlay.classList.remove("hidden");
    }

    function showGame() {
        showOverlay(null);
        gameContainer.classList.remove("hidden");
    }


    // ==================== START / PAUSE / RESTART ====================
    function startGame() {
        ensureAudio(); // Init audio on user gesture

        // Read settings from toggles
        state.mode = getToggleValue(modeToggle);
        state.difficulty = getToggleValue(diffToggle);

        // Update HUD names and controls
        if (state.mode === "1P") {
            p2NameEl.textContent = "CPU";
            p2ControlsEl.textContent = "🤖 AI Opponent";
            p1ControlsEl.textContent = "🅿1: W / S or Mouse";
        } else {
            p2NameEl.textContent = "PLAYER 2";
            p2ControlsEl.textContent = "🅿2: ↑ / ↓";
            p1ControlsEl.textContent = "🅿1: W / S";
        }

        resetGame();
        showGame();

        state.running = true;
        state.paused = false;
        state.animFrameId = requestAnimationFrame(gameLoop);
    }

    function pauseGame() {
        if (!state.running) return;
        state.paused = true;
        showOverlay(pauseOverlay);
    }

    function resumeGame() {
        if (!state.running) return;
        state.paused = false;
        showOverlay(null);
        gameContainer.classList.remove("hidden");
        state.animFrameId = requestAnimationFrame(gameLoop);
    }

    function quitToMenu() {
        state.running = false;
        state.paused = false;
        cancelAnimationFrame(state.animFrameId);
        gameContainer.classList.add("hidden");
        loadHighScore();
        showOverlay(startScreen);
    }


    // ==================== INPUT HANDLING ====================

    /** Track keys being held down for smooth movement */
    document.addEventListener("keydown", (e) => {
        state.keysDown[e.key] = true;

        // Escape to toggle pause
        if (e.key === "Escape" && state.running) {
            e.preventDefault();
            state.paused ? resumeGame() : pauseGame();
        }

        // Prevent page scroll when using arrow keys during game
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && state.running) {
            e.preventDefault();
        }
    });

    document.addEventListener("keyup", (e) => {
        state.keysDown[e.key] = false;
    });

    /**
     * Mouse control for Player 1 paddle (1P mode).
     * Only active when mouse is over the left half of the table.
     */
    document.addEventListener("mousemove", (e) => {
        if (!state.running || state.paused) return;

        const tableRect = table.getBoundingClientRect();

        // Only respond if mouse is roughly over the table area
        if (e.clientX > tableRect.left + tableRect.width * 0.6) return;

        const mouseY = e.clientY - tableRect.top - PADDLE_HEIGHT / 2;
        state.paddle1Y = clamp(mouseY, 0, table.clientHeight - PADDLE_HEIGHT);
    });


    // ==================== TOGGLE BUTTONS ====================
    function setupToggleGroup(group) {
        const buttons = group.querySelectorAll(".toggle-btn");
        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                buttons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            });
        });
    }

    function getToggleValue(group) {
        const active = group.querySelector(".toggle-btn.active");
        return active ? active.dataset.value : null;
    }

    setupToggleGroup(modeToggle);
    setupToggleGroup(diffToggle);


    // ==================== BUTTON EVENT LISTENERS ====================
    startBtn.addEventListener("click", startGame);
    resumeBtn.addEventListener("click", resumeGame);
    quitBtn.addEventListener("click", quitToMenu);
    playAgainBtn.addEventListener("click", startGame);
    menuBtn.addEventListener("click", quitToMenu);


    // ==================== UTILITY ====================
    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }


    // ==================== INIT ====================
    loadHighScore();

});