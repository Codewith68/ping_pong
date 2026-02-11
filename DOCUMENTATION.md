# Table Tennis Arcade — Documentation

This document provides a complete technical reference for the Table Tennis Arcade game.
It covers every part of the codebase — HTML structure, CSS styling system, and the JavaScript game engine — so you can understand, modify, or extend the project with confidence.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [HTML — Game Structure](#html--game-structure)
4. [CSS — Styling & Animations](#css--styling--animations)
5. [JavaScript — Game Engine](#javascript--game-engine)
   - [DOM References](#dom-references)
   - [Constants & Configuration](#constants--configuration)
   - [Game State](#game-state)
   - [Sound System](#sound-system)
   - [Local Storage](#local-storage)
   - [Ball Physics](#ball-physics)
   - [Collision Detection](#collision-detection)
   - [Paddle Movement](#paddle-movement)
   - [AI Logic](#ai-logic)
   - [Scoring & Game Over](#scoring--game-over)
   - [Game Loop](#game-loop)
   - [Screen Management](#screen-management)
   - [Input Handling](#input-handling)
6. [Game Flow Diagram](#game-flow-diagram)
7. [How to Customize](#how-to-customize)
8. [Browser Compatibility](#browser-compatibility)
9. [Known Limitations](#known-limitations)
10. [Future Improvements](#future-improvements)

---

## Project Overview

Table Tennis Arcade is a client-side browser game built entirely with vanilla HTML, CSS, and JavaScript. It has **zero external dependencies** (the only external resource is a Google Fonts CDN link for typography). There is no build step, no bundler, no package.json — you simply open `index.html` in a browser and play.

The game supports:
- Single player (vs AI) and local two-player modes
- Three difficulty levels that control ball speed and AI intelligence
- Real-time scoring with a first-to-7 win condition
- Sound effects generated procedurally with the Web Audio API
- Persistent high scores via `localStorage`

---

## File Structure

```
ping_pong/
│
├── index.html      # Game layout: screens, overlays, HUD, table, paddles, ball
├── style.css       # Complete visual theme: dark neon arcade aesthetic
├── index.js        # Game engine: physics, AI, input, sound, state management
└── README.md       # GitHub-facing project overview
```

| File | Lines | Purpose |
|---|---|---|
| `index.html` | ~120 | Semantic HTML5 structure with 3 overlay screens + main game container |
| `style.css` | ~300 | Dark theme, glow effects, animations, responsive breakpoints |
| `index.js` | ~610 | Full game engine wrapped in a single `DOMContentLoaded` listener |

---

## HTML — Game Structure

The HTML is organized into **4 major sections**, each toggled visible/hidden via the `.hidden` CSS class:

### 1. Start Screen (`#start-screen`)

The first thing the player sees. Contains:
- **Game title** — "TABLE TENNIS" with gradient text
- **Mode toggle** (`#mode-toggle`) — buttons for "1 PLAYER" and "2 PLAYER"
- **Difficulty toggle** (`#difficulty-toggle`) — buttons for "EASY", "MEDIUM", "HARD"
- **Start button** (`#start-btn`) — launches the game
- **High score display** (`#high-score-value`) — loaded from localStorage

### 2. Pause Overlay (`#pause-overlay`)

Appears when the player presses Escape during gameplay:
- **Resume button** (`#resume-btn`) — continues the game
- **Quit button** (`#quit-btn`) — returns to the start screen

### 3. Game Over Overlay (`#gameover-overlay`)

Shown when either player reaches the win score (7):
- **Winner text** (`#winner-text`) — dynamically set to "PLAYER 1 WINS!" or "COMPUTER WINS!"
- **Final score** (`#final-score-text`) — e.g., "7 — 3"
- **High score** (`#gameover-high-score`) — updated if a new record
- **Play Again** (`#play-again-btn`) — restarts with same settings
- **Main Menu** (`#menu-btn`) — returns to start screen

### 4. Game Container (`#game-container`)

The actual game, containing:

#### HUD (`#hud`)
- Player 1 name + score (left, cyan)
- "VS" divider (center)
- Player 2 / Computer name + score (right, pink)

#### Table (`#ping-pong-table`)
- `#center-line` — vertical dashed line splitting the court
- `#center-circle` — decorative circle at midpoint
- `#paddle-left` — Player 1's paddle (left side)
- `#paddle-right` — Player 2 / AI paddle (right side)
- `#ball` — the game ball
- `#score-flash` — large text that briefly animates when someone scores

#### Controls Bar (`#controls-bar`)
- Shows key bindings for P1, pause, and P2

---

## CSS — Styling & Animations

### Design System

The visual theme uses a **dark neon arcade** aesthetic:

| Element | Colors | Effect |
|---|---|---|
| Body background | `#1a1a2e` → `#050510` | Radial gradient |
| Table surface | `#0d2818` → `#071a10` | Green gradient (table tennis feel) |
| Table border | `#1a5c2e` | Neon green glow |
| Player 1 paddle | `#00f0ff` → `#0080ff` | Cyan with glow shadow |
| Player 2 paddle | `#ff00e5` → `#ff6600` | Pink-orange with glow shadow |
| Ball | `#fff` → `#c8ff00` | Yellow-green radial gradient with triple glow |
| Primary buttons | `#00f0ff` → `#0080ff` | Cyan gradient |
| Overlay backdrop | `rgba(5,5,16,0.92)` | Dark with 12px blur |

### Typography

- **Orbitron** (Google Fonts) — used for all game text, gives a retro-futuristic arcade feel
- **Inter** (Google Fonts) — used for control hints (more readable at small sizes)

### Key Animations

#### `fadeIn` — Overlay entrance
```css
@keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}
```
Applied to all `.overlay` elements when they become visible.

#### `paddleHit` — Paddle collision feedback
```css
@keyframes paddleHit {
    0%   { transform: scaleY(1); filter: brightness(1); }
    50%  { transform: scaleY(0.85); filter: brightness(2); }
    100% { transform: scaleY(1); filter: brightness(1); }
}
```
Triggered by adding the `.hit` class to a paddle element. The paddle briefly squishes and flashes bright white. The class is removed after 150ms via JavaScript.

#### `ballPulse` — Ball collision feedback
```css
@keyframes ballPulse {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.4); filter: brightness(2); }
    100% { transform: scale(1); }
}
```
Triggered by adding the `.pulse` class to the ball. The ball briefly enlarges and brightens. Class removed after 200ms.

#### `flashScore` — Score announcement
```css
@keyframes flashScore {
    0%   { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
    50%  { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
}
```
A large score text (e.g., "3 — 2") appears at the table center, scales up, and fades out over 600ms.

### Responsive Design

At screen widths below 850px:
- Table width becomes `95vw` with proportional height (`60vw`)
- HUD and controls bar match the table width
- Title and score font sizes reduce

---

## JavaScript — Game Engine

The entire engine is wrapped in a single `DOMContentLoaded` event listener. All functions and state are scoped within this closure.

### DOM References

A shorthand helper `$()` wraps `document.getElementById()` for cleaner code:

```javascript
const $ = (id) => document.getElementById(id);
const ball = $("ball");
const paddleLeft = $("paddle-left");
// ...etc
```

### Constants & Configuration

```javascript
const WIN_SCORE     = 7;       // First to this score wins
const PADDLE_HEIGHT = 80;      // Paddle height in pixels
const PADDLE_WIDTH  = 14;      // Paddle width in pixels
const BALL_SIZE     = 16;      // Ball diameter in pixels
const PADDLE_MARGIN = 12;      // Distance from table edge to paddle
const SPEED_INCREMENT = 0.3;   // Ball speed increase per paddle hit
```

#### Difficulty Presets

Each difficulty level adjusts three values:

```javascript
const DIFFICULTY = {
    easy:   { ballSpeed: 7,  aiSpeed: 5,  aiReaction: 0.5 },
    medium: { ballSpeed: 10, aiSpeed: 8,  aiReaction: 0.8 },
    hard:   { ballSpeed: 13, aiSpeed: 11, aiReaction: 1   },
};
```

| Property | What it Controls |
|---|---|
| `ballSpeed` | Initial ball velocity (pixels/frame). Resets after each point. |
| `aiSpeed` | Maximum pixels the AI paddle can move per frame |
| `aiReaction` | Multiplier (0-1) for how precisely the AI tracks the ball. Higher = more accurate. |

### Game State

All mutable game data lives in a single `state` object:

```javascript
let state = {
    mode: "1P",           // "1P" or "2P"
    difficulty: "medium",
    running: false,       // Is the game loop active?
    paused: false,        // Is the game paused?

    p1Score: 0,           // Player 1 score
    p2Score: 0,           // Player 2 / CPU score

    ballX: 0, ballY: 0,  // Ball position (px from top-left of table)
    dx: 0, dy: 0,        // Ball velocity components
    ballSpeed: 10,        // Base speed (from difficulty)
    currentSpeed: 10,     // Current speed (increases during rally)

    paddle1Y: 0,          // Player 1 paddle Y position
    paddle2Y: 0,          // Player 2 paddle Y position
    paddleSpeed: 6,       // Paddle movement speed (px/frame)

    aiSpeed: 8,           // AI max movement speed
    aiReaction: 0.8,      // AI tracking precision
    aiTargetY: 0,         // Where AI is trying to move

    keysDown: {},         // Currently held keys (for smooth movement)
    animFrameId: null,    // requestAnimationFrame ID (for cancellation)
    highScore: 0,         // Best score from localStorage
    rallyCount: 0,        // Hits in current rally (for speed tracking)
};
```

### Sound System

Sound effects are generated entirely in JavaScript using the **Web Audio API**. No audio files are loaded.

#### How it Works

```javascript
function beep(freq, dur, type, volume) {
    const osc = audioCtx.createOscillator();    // Create tone generator
    const gain = audioCtx.createGain();          // Create volume control
    osc.type = type;                             // "square", "sine", "triangle"
    osc.frequency.value = freq;                  // Pitch in Hz
    gain.gain.value = volume;                    // 0 to 1
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.stop(audioCtx.currentTime + dur);
}
```

#### Sound Effects

| Sound | Function | Frequency | Waveform |
|---|---|---|---|
| Paddle hit | `soundPaddleHit()` | 600 Hz | Square wave |
| Wall bounce | `soundWallBounce()` | 300 Hz | Triangle wave |
| Score | `soundScore()` | 523→659→784 Hz | Sine (rising arpeggio) |
| Game over | `soundGameOver()` | 523→659→784→1047 Hz | Sine (triumphant fanfare) |

The `AudioContext` is lazily initialized on the first user gesture (click/keypress) to comply with browser autoplay policies.

### Local Storage

High scores persist across browser sessions:

```javascript
// Load on page init
localStorage.getItem("tableTennisHighScore");

// Save after game over (only if new record)
localStorage.setItem("tableTennisHighScore", score);
```

The storage key is `"tableTennisHighScore"`. The high score is displayed on both the start screen and the game over screen.

### Ball Physics

#### Reset Ball (`resetBall`)

When a point is scored, the ball resets to the center of the table and launches in a random direction:

```javascript
const angle = (Math.random() * 60 - 30) * (Math.PI / 180);  // -30° to +30°
state.dx = direction * Math.cos(angle) * state.currentSpeed;
state.dy = Math.sin(angle) * state.currentSpeed;
```

The `direction` parameter is `1` (serve right, toward the scorer) or `-1` (serve left).

#### Move Ball (`moveBall`)

Each frame, the ball position updates by its velocity:
```
ballX += dx
ballY += dy
```

**Wall bouncing**: If the ball touches the top or bottom edge, `dy` is inverted:
```javascript
if (ballY <= 0) { ballY = 0; dy = Math.abs(dy); }
if (ballY >= tableHeight - BALL_SIZE) { dy = -Math.abs(dy); }
```

**Scoring**: If the ball exits the left edge, Player 2 scores. If it exits the right edge, Player 1 scores.

#### Deflection (`deflectBall`)

When the ball hits a paddle, its new angle depends on **where** it hit:

```
offset = (ballCenter - paddleCenter) / (paddleHeight / 2)   // -1 to +1
angle = offset * maxAngle                                     // max 60°
```

- Hit the **center** of the paddle → ball goes nearly straight
- Hit the **edge** of the paddle → ball deflects at up to 60°

Speed also increases by `SPEED_INCREMENT` (0.3) after each hit, making rallies progressively faster.

### Collision Detection

The game uses **AABB (Axis-Aligned Bounding Box)** collision:

```javascript
function checkPaddleCollision(paddleX, paddleY) {
    return (
        ballX < paddleX + PADDLE_WIDTH &&     // ball left < paddle right
        ballX + BALL_SIZE > paddleX &&         // ball right > paddle left
        ballY < paddleY + PADDLE_HEIGHT &&     // ball top < paddle bottom
        ballY + BALL_SIZE > paddleY            // ball bottom > paddle top
    );
}
```

This checks if the ball's bounding rectangle overlaps with the paddle's bounding rectangle. A direction check (`dx < 0` for left paddle, `dx > 0` for right paddle) prevents double-bouncing.

### Paddle Movement

Paddle movement uses a **held-key tracking** system for smooth, continuous motion:

```javascript
// On keydown: mark key as held
document.addEventListener("keydown", (e) => { state.keysDown[e.key] = true; });

// On keyup: mark key as released
document.addEventListener("keyup", (e) => { state.keysDown[e.key] = false; });
```

Each frame, `movePaddles()` checks which keys are currently held and moves accordingly:

| Mode | Player 1 | Player 2 |
|---|---|---|
| 1 Player | W/S + Arrow keys + Mouse | AI controlled |
| 2 Player | W / S | Arrow Up / Arrow Down |

**Mouse control** (1P mode): Player 1 can also control the paddle by moving the mouse over the left half of the table. The paddle follows the cursor's Y position.

All paddle positions are **clamped** to stay within the table boundaries.

### AI Logic

The AI controls the right paddle in single-player mode. Its behavior is governed by two parameters:

```javascript
function moveAI() {
    if (state.dx > 0) {
        // Ball coming toward AI → actively track
        const diff = targetY - currentY;
        paddle2Y += diff * aiReaction + sign(diff) * min(abs(diff), aiSpeed);
    } else {
        // Ball going away → drift back to center
        paddle2Y += (centerY - currentY) * 0.02;
    }
}
```

**When the ball is approaching** (`dx > 0`):
- The AI calculates where it needs to be (`targetY`) based on the ball's current Y position
- It moves toward that target, limited by `aiSpeed` (max pixels per frame)
- `aiReaction` controls how smoothly it interpolates — low values = sluggish, high values = snappy

**When the ball is moving away** (`dx < 0`):
- The AI slowly drifts back toward the center of the table
- This creates a natural-looking idle behavior

### Scoring & Game Over

- When the ball exits the left edge → Player 2 scores
- When the ball exits the right edge → Player 1 scores
- A large **score flash** appears on the table ("3 — 2")
- Ball speed resets to the base difficulty speed
- Ball re-serves toward the player who just scored

**Game over** triggers when either player reaches `WIN_SCORE` (7):
1. Game loop stops (`cancelAnimationFrame`)
2. Winner text is set dynamically
3. High score is checked and saved if beaten
4. Game over overlay appears with final score
5. Game over fanfare sound plays

### Game Loop

The game uses `requestAnimationFrame` for smooth, browser-synchronized rendering:

```javascript
function gameLoop() {
    if (!state.running || state.paused) return;

    movePaddles();    // Process input + AI
    moveBall();       // Physics + collision + scoring
    render();         // Update DOM positions

    state.animFrameId = requestAnimationFrame(gameLoop);
}
```

This runs at the browser's native refresh rate (typically 60fps). The `animFrameId` is stored so the loop can be cancelled on pause or game over.

**Why `requestAnimationFrame` over `setInterval`?**
- Syncs with the browser's repaint cycle — no wasted frames
- Automatically pauses when the tab is in background — saves CPU
- Provides smoother, more consistent frame timing

### Screen Management

Three overlay screens and the game container are toggled with a simple utility:

```javascript
function showOverlay(overlay) {
    // Hide all overlays
    [startScreen, pauseOverlay, gameoverOverlay].forEach(o => o.classList.add("hidden"));
    // Show the requested one (or null = hide all)
    if (overlay) overlay.classList.remove("hidden");
}
```

The `.hidden` class uses `display: none !important` to completely remove elements from layout.

### Input Handling

| Input | Action |
|---|---|
| `W` / `S` | Move Player 1 paddle |
| `↑` / `↓` | Move Player 1 (1P) or Player 2 (2P) |
| `Escape` | Toggle pause |
| Mouse move | Move Player 1 paddle (left half of table only) |
| Click | UI buttons (start, resume, quit, play again, menu) |

Arrow key default scroll behavior is prevented during gameplay with `e.preventDefault()`.

---

## Game Flow Diagram

```
┌──────────────┐
│  Page Load   │
│  Load High   │
│  Score from  │
│  localStorage│
└──────┬───────┘
       ▼
┌──────────────┐
│ START SCREEN │◄──────────────────────────────┐
│  Mode: 1P/2P │                               │
│  Difficulty   │                               │
│  [START]      │                               │
└──────┬───────┘                               │
       ▼                                        │
┌──────────────┐     ┌──────────┐              │
│  GAME LOOP   │────►│  PAUSED  │              │
│  movePaddles  │◄────│ [RESUME] │              │
│  moveBall     │     │  [QUIT]──┼──────────────┘
│  render       │     └──────────┘
│  60fps via rAF│
└──────┬───────┘
       │ Score reaches 7
       ▼
┌──────────────┐
│  GAME OVER   │
│  Winner text  │
│  Final score  │
│  High score   │
│ [PLAY AGAIN]──┼──► Reset + new game loop
│ [MAIN MENU]───┼──► Back to START SCREEN
└──────────────┘
```

---

## How to Customize

### Change Win Score
In `index.js`, modify the constant:
```javascript
const WIN_SCORE = 7;  // Change to 5, 10, 21, etc.
```

### Adjust Ball / Paddle Sizes
```javascript
const PADDLE_HEIGHT = 80;   // Taller = easier
const PADDLE_WIDTH  = 14;
const BALL_SIZE     = 16;   // Larger = easier to hit
```

### Tune Difficulty
Edit the `DIFFICULTY` object:
```javascript
const DIFFICULTY = {
    easy:   { ballSpeed: 7,  aiSpeed: 5,  aiReaction: 0.5 },
    medium: { ballSpeed: 10, aiSpeed: 8,  aiReaction: 0.8 },
    hard:   { ballSpeed: 13, aiSpeed: 11, aiReaction: 1   },
};
```

### Change Colors
In `style.css`, search for the color values:
- Player 1 paddle: `#00f0ff` (cyan)
- Player 2 paddle: `#ff00e5` (pink)
- Ball: `#c8ff00` (yellow-green)
- Table surface: `#0d2818` (dark green)

### Add a New Difficulty Level
1. Add a new button in `index.html` inside `#difficulty-toggle`:
   ```html
   <button class="toggle-btn" data-value="insane">INSANE</button>
   ```
2. Add the preset in `index.js`:
   ```javascript
   insane: { ballSpeed: 18, aiSpeed: 15, aiReaction: 1.2 },
   ```

---

## Browser Compatibility

| Browser | Supported | Notes |
|---|---|---|
| Chrome 60+ | Yes | Full support |
| Firefox 55+ | Yes | Full support |
| Edge 79+ | Yes | Full support |
| Safari 14+ | Yes | `webkitAudioContext` fallback included |
| IE 11 | No | No `const`, `let`, arrow functions, etc. |

Key API requirements:
- `requestAnimationFrame`
- `Web Audio API` (`AudioContext` / `webkitAudioContext`)
- `localStorage`
- `classList`
- `backdrop-filter` (graceful degradation — overlays work without blur)

---

## Known Limitations

1. **No delta-time normalization** — ball speed is frame-dependent. On a 120Hz monitor the ball moves twice as fast as on 60Hz. A proper fix would multiply velocities by `deltaTime`.
2. **No mobile/touch support** — the game requires a keyboard or mouse. Adding touch events for paddle control is a potential improvement.
3. **Single tab only** — localStorage doesn't sync across tabs in real-time.
4. **No AI prediction** — the AI tracks the ball's current position, not its predicted trajectory. This makes it less challenging at extreme speeds.

---

## Future Improvements

- **Delta-time game loop** — frame-rate-independent physics
- **Touch controls** — on-screen drag zones for mobile play
- **Power-ups** — speed boost, paddle size changes, ball split
- **Online multiplayer** — WebSocket-based real-time play
- **Custom themes** — player-selectable color schemes
- **AI prediction** — calculate ball trajectory for smarter AI
- **Particle effects** — sparks on paddle hit, trail behind ball
- **Match history** — store past game results in localStorage

---
