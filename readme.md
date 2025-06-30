# Dungeon Crawler Game

A retro-style pixel art dungeon crawler game built with the HTML Canvas and JavaScript. Players can customize their character and navigate through randomly generated dungeons guarded by enemies. Their goal is to reach the golden tile at the other side of the map.

## Features

- **Character Customization**: Choose from different skin tones, clothing colors, and accessories (hats, crowns, capes)
- **Difficulty Levels**: Easy, Medium, and Hard modes with different enemy speeds
- **Pixel Art Graphics**: Custom coded sprites which are javascript exported
- **Procedural Dungeons**: Randomly generated dungeons, no dungeon is the same
- **Customization Screen**: Choose your character by cycling through skin tone, clothing, and accessories

## Game Mechanics

- **Movement**: Use arrow keys to navigate through the dungeon
- **Objective**: Reach the gold tile while avoiding the enemies
- **Health System**: Start with 3 HP, lose 1 HP when hit by enemies

## Project Structure

```
dungeon-crawler/
├── public/
│   ├── assets/                 
│   ├── customization.html      # Character customization screen
│   ├── customization.js        # Customization logic
│   ├── game.html               # Main game screen
│   ├── game.js                 # Core game logic
│   ├── map.js                  # Map generation logic
│   ├── player.js               # Player class and mechanics
│   ├── enemy.js                # Enemy pathfinding behavior
│   └── sprites.js              # Sprites cycling logic
├── export-sprites.js           # Sprites exported
├── index.cjs                   # Express server
└── package.json                
```

## Prerequisites

- Node.js 
- npm cli

## Installation and Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/saisrikar8/dungeon-crawler.git
   cd dungeon-crawler
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local server**:
   ```bash
   node index.cjs
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## Technical Notes

- The game runs entirely in the browser using vanilla JavaScript
- No external APIs or databases required
- All assets are generated locally or served statically
- Responsive design adapts to different screen sizes (WIP, use ctrl plus and ctrl minus for now)
