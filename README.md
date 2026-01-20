# 🎈 Balloon Shooter Game

A fun and addictive carnival-style balloon shooter game where you pop falling balloons with your cannon! Built with vanilla JavaScript and HTML5 Canvas.

![Balloon Shooter](https://img.shields.io/badge/Status-Live-success) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)

## 🎮 How to Play

- **Arrow Keys (← →)**: Move your cannon left and right
- **Spacebar**: Shoot bullets at the balloons
- **ESC**: Pause the game

### Objective
Pop as many balloons as you can before they reach the bottom! Each missed balloon costs you a life. Get combo multipliers by popping balloons consecutively!

## 🎯 Game Features

### Balloon Types
- **Red Balloon** 🔴 - Basic balloon (100 points)
- **Blue Balloon** 🔵 - Fast moving (150 points)
- **Yellow Balloon** 🟡 - Takes 2 hits (200 points)
- **Green Balloon** 🟢 - Drops life powerup (250 points)
- **Purple Balloon** 🟣 - Zig-zag pattern (300 points)
- **Rainbow Balloon** 🌈 - Multi-colored, takes 3 hits (500 points)

### Game Mechanics
- ✨ **Combo System**: Chain hits together for up to 10x multiplier!
- 📈 **Progressive Difficulty**: Balloons spawn faster and move quicker as you level up
- 💥 **Particle Effects**: Satisfying pop animations when you hit balloons
- 🎵 **Sound Effects**: Audio feedback for shooting and popping (Web Audio API)
- ❤️ **Lives System**: Start with 3 lives, lose one for each missed balloon
- 🏆 **Level Progression**: Reach new levels every 1000 points

## 🚀 Play Online

**Live Demo**: [Your Vercel URL will be here after deployment]

## 💻 Local Development

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 or Node.js (for local server)

### Running Locally

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd ballon-game
   ```

2. **Start a local server**

   Using Python:
   ```bash
   python3 -m http.server 8000
   ```

   Or using npx:
   ```bash
   npx serve
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

## 🛠️ Technology Stack

- **HTML5** - Semantic markup and Canvas API
- **CSS3** - Modern styling with animations and gradients
- **JavaScript (ES6+)** - Game logic with classes and modules
- **Web Audio API** - Dynamic sound generation
- **Canvas API** - 2D rendering and animations

**No external libraries or frameworks!** Pure vanilla JavaScript for maximum performance and minimal load time.

## 📁 Project Structure

```
ballon-game/
├── index.html       # Game HTML structure with UI overlays
├── game.js          # Core game logic and classes
├── styles.css       # Carnival theme styling and animations
├── vercel.json      # Vercel deployment configuration
├── .gitignore       # Git ignore file
└── README.md        # This file
```

## 🎨 Code Architecture

### Main Classes
- **BalloonGame** - Main game controller, handles game loop and state management
- **Cannon** - Player's cannon with movement controls
- **Balloon** - Balloon entities with different types and behaviors
- **Bullet** - Projectiles shot from the cannon
- **Particle** - Visual effects for explosions and impacts
- **SoundManager** - Audio playback using Web Audio API

### Game Loop
The game uses `requestAnimationFrame` for smooth 60 FPS animation with delta-time calculations for consistent gameplay across different devices.

## 🚢 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd ballon-game
   vercel
   ```

3. **Production Deployment**
   ```bash
   vercel --prod
   ```

### Deploy to GitHub Pages

1. Push to GitHub repository
2. Go to Settings → Pages
3. Select branch and `/` (root) folder
4. Save and wait for deployment

## 🎯 Game Tips

1. **Master the Combo**: Keep your combo alive for maximum points!
2. **Prioritize Rainbow Balloons**: They're worth the most points
3. **Watch for Purple Balloons**: Their zig-zag pattern makes them tricky
4. **Green Balloons Save Lives**: Prioritize them when low on health
5. **Move Constantly**: Keep repositioning to line up shots

## 🔧 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires ES6 support and Canvas API.

## 📝 Future Enhancements

- [ ] Boss battles every 5 levels
- [ ] Leaderboard with high scores
- [ ] Additional power-ups (multi-shot, freeze time)
- [ ] Mobile touch controls
- [ ] Progressive Web App (PWA) support
- [ ] Background music
- [ ] Different visual themes

## 👨‍💻 Development

### Adding New Balloon Types

Edit the `BALLOON_TYPES` object in `game.js`:

```javascript
const BALLOON_TYPES = {
    newType: {
        color: '#HEXCOLOR',
        speed: 25,
        health: 1,
        score: 100,
        // optional special properties
    }
};
```

### Adjusting Difficulty

Modify the `updateDifficulty()` method in the `BalloonGame` class to change spawn rates, speeds, and fire rates.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built with ❤️ using vanilla JavaScript, HTML5 Canvas, and pure CSS.

---

**Happy Balloon Popping!** 🎈✨
