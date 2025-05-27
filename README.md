# Hackout Game - Complete Collection

🎮 **Two versions of the classic Breakout game** - Experience both the original and enhanced versions!

## 🕹️ Available Versions

### 📁 [Original Breakout](./original-breakout/) - Version 1.0.0

The classic implementation with traditional gameplay and vibrant colors.

**Features:**

- 6 rows of colorful bricks
- Classic powerup system
- Traditional arcade aesthetics
- Original collision mechanics

**Authors:** Ana Bermúdez, Cecilia Moreira, Juan Semprún

---

### 📁 [Enhanced Breakout](./enhanced-breakout/) - Version 2.0.0

An improved version with modern collision detection, visual enhancements, and polished gameplay.

**New Features:**

- ✅ **Fixed collision system** - No more stuck balls or multiple brick hits
- 🎨 **Modern color palette** - Harmonious retro colors
- 💫 **PowerUp notification banners** - Beautiful fade-in/fade-out notifications
- 🎯 **4-row brick layout** - Better balanced difficulty
- 🔧 **Numerous bug fixes** - Smoother, more reliable gameplay

**Enhanced by:** Juan Semprun (2025)

---

## 🚀 Quick Start

### Local Development

```bash
# Start a local server
python3 -m http.server 3001

# Access the games:
# Original: http://localhost:3001/original-breakout/
# Enhanced: http://localhost:3001/enhanced-breakout/
```

### 🎮 How to Play

1. **Start/Pause**: Press `Enter`
2. **Move Paddle**: Use left/right arrow keys
3. **Collect PowerUps**: Hit special bricks and catch powerups with your paddle
4. **Goal**: Clear all bricks to win!

## 🎯 PowerUp Types

- 🔴 **Big Paddle** - Increases paddle size
- 🔵 **Small Paddle** - Decreases paddle size
- ⚡ **Fast Ball** - Increases ball speed
- 🌀 **Crazy Keys** - Reverses controls

## 🏗️ Project Structure

```
hackout-game/
├── original-breakout/     # Version 1.0.0 - Original game
├── enhanced-breakout/     # Version 2.0.0 - Enhanced with improvements
├── img/                   # Shared game assets
├── sounds/               # Shared audio files
└── README.md             # This file
```

## 🔄 Version Comparison

| Feature               | Original v1.0.0 | Enhanced v2.0.0                      |
| --------------------- | --------------- | ------------------------------------ |
| Brick Rows            | 6 rows          | 4 rows                               |
| Collision System      | Basic           | Advanced with anti-sticking          |
| PowerUp Notifications | None            | Animated banners                     |
| Color Palette         | Bright neon     | Harmonious retro                     |
| Bug Fixes             | Original state  | Multiple fixes applied               |
| Ball Physics          | Basic           | Enhanced with direction preservation |

## 🌐 Deployment

Both versions can be deployed separately:

- `your-domain.com/original-breakout/` - Classic experience
- `your-domain.com/enhanced-breakout/` - Modern enhanced experience

Perfect for comparing the evolution of the game and showcasing improvements!

## 💻 Built With

- HTML5 Canvas
- CSS3
- JavaScript ES6
- Google Fonts

## 👥 Original Authors

- [Ana Bermúdez Monteagudo](https://github.com/Anabm90)
- [Juan Daniel Semprún Rico](https://github.com/juansemprun)
- [Silvana Cecilia Moreira](https://github.com/scmoreira)

\*First project at **Ironhack Madrid\***

---

**Choose your experience: Classic nostalgia or modern polish! 🚀**
