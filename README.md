# 🏓 Table Tennis — Arcade Edition

A retro-arcade style table tennis game built with **pure HTML, CSS & JavaScript** — no frameworks, no dependencies, no build step. Just open and play!

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

##  Features

### 🎮 Gameplay
- **Single Player** mode with AI opponent
- **Two Player** mode (local multiplayer)
- **3 Difficulty Levels** — Easy, Medium, Hard
- **Ball speed increases** with every paddle hit during a rally
- **Smooth 60fps** game loop using `requestAnimationFrame`
- **AABB collision detection** with angle-based deflection
- **First to 7** wins the match

###  Visual Design
- Dark **neon arcade** aesthetic with glowing paddles & ball
- **Frosted glass** overlays (start screen, pause, game over)
- **Retro "Orbitron"** font from Google Fonts
- Animated **paddle hit flash** & **ball pulse** on collision
- **Center court line** & circle for authentic table tennis feel
- Fully **responsive** — works on smaller screens too

###  Sound
- **Web Audio API** generated sound effects — no audio files needed
- Distinct sounds for paddle hit, wall bounce, scoring, and game over

###  Persistence
- **High score** saved to `localStorage` — persists across sessions

###  Controls
| Action | 1 Player Mode | 2 Player Mode |
|---|---|---|
| Player 1 — Move Up | `W` / `↑` / Mouse | `W` |
| Player 1 — Move Down | `S` / `↓` / Mouse | `S` |
| Player 2 — Move Up | 🤖 AI | `↑` |
| Player 2 — Move Down | 🤖 AI | `↓` |
| Pause / Resume | `Escape` | `Escape` |

---

##   Getting Started

### Play Instantly
1. Clone or download this repository
2. Open `index.html` in any modern browser
3. That's it — no install, no build, no server required!

```bash
git clone https://github.com/YOUR_USERNAME/table-tennis-arcade.git
cd table-tennis-arcade
# Open index.html in your browser, or use Live Server
```

### Using VS Code Live Server
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `index.html` → **Open with Live Server**

---

## 📁 Project Structure

```
ping_pong/
├── index.html    → Game structure, screens & overlays
├── style.css     → Dark neon arcade theme & animations
├── index.js      → Complete game engine (~600 lines)
└── README.md     → You are here
```

**No external dependencies.** The only external resource is the Google Fonts CDN for the Orbitron typeface.

---

##   Architecture

The JavaScript engine is organized into clearly separated sections:

```
┌─────────────────────────────────┐
│  DOM References                 │
├─────────────────────────────────┤
│  Game Constants & Difficulty    │
│  Presets (Easy / Medium / Hard) │
├─────────────────────────────────┤
│  Central Game State Object      │
├─────────────────────────────────┤
│  Sound System (Web Audio API)   │
│  No external audio files!       │
├─────────────────────────────────┤
│  localStorage High Scores       │
├─────────────────────────────────┤
│  Game Logic                     │
│  • resetBall() / resetPaddles() │
│  • moveBall() — physics + walls │
│  • checkPaddleCollision() AABB  │
│  • deflectBall() — angle calc   │
│  • movePaddles() — input based  │
│  • moveAI() — difficulty based  │
│  • checkGameOver()              │
├─────────────────────────────────┤
│  Rendering (DOM updates)        │
├─────────────────────────────────┤
│  Game Loop (requestAnimFrame)   │
├─────────────────────────────────┤
│  Screen & UI Management         │
├─────────────────────────────────┤
│  Input (keyboard + mouse)       │
└─────────────────────────────────┘
```

---

##  Difficulty Presets

| Setting | Easy | Medium | Hard |
|---|---|---|---|
| Ball Speed | 7 | 10 | 13 |
| AI Speed | 5 | 8 | 11 |
| AI Reaction | 0.5 | 0.8 | 1.0 |
| Speed Increase / Hit | +0.3 | +0.3 | +0.3 |
| Win Score | 7 | 7 | 7 |

---

##  Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic game structure & overlay screens |
| **CSS3** | Dark neon theme, animations, responsive layout |
| **Vanilla JavaScript** | Game engine, physics, AI, input handling |
| **Web Audio API** | Procedurally generated sound effects |
| **localStorage** | High score persistence |
| **Google Fonts** | Orbitron typeface for arcade aesthetic |

---

##  Key Technical Highlights

- **`requestAnimationFrame`** instead of `setInterval` for buttery smooth 60fps rendering
- **Held-key tracking** (`keydown`/`keyup` map) for smooth continuous paddle movement
- **AABB collision** with angle-based deflection — ball angle changes based on where it hits the paddle
- **Web Audio `OscillatorNode`** for zero-dependency sound — different frequencies for paddle hits, wall bounces, scoring, and game over fanfare
- **Single state object** keeps all game data centralized and easy to debug

---

##  Contributing

This is a learning project, but contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with Love and vanilla JavaScript
</p>
