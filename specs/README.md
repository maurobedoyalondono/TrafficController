# Traffic Controller Game - Specification Summary

## Project Overview

A browser-based educational traffic management game designed for 15-year-old students learning programming. Players write JavaScript code to control traffic lights at a 4-way intersection. Poor decisions lead to crashes that block the intersection and cascade into more crashes. Ambulance crashes cause instant game over, teaching consequence-based decision making.

## Documents

1. **[requirements.md](./requirements.md)** - Complete functional and non-functional requirements
2. **[user-stories.md](./user-stories.md)** - User stories organized by epics
3. **[low-level-design.md](./low-level-design.md)** - Detailed technical design with code structures
4. **[architecture-diagram.md](./architecture-diagram.md)** - Visual architecture and flow diagrams

## Quick Summary

### Game Concept
- 4-way intersection with traffic from all directions
- 4 vehicle types: Regular, Ambulance, Police, Government
- Each type has different waiting time penalty weight
- Players start with points, lose points based on wait times
- **CRASHES HAPPEN**: Poor light management causes collisions
- Crashed vehicles block intersection, cascading into more crashes
- Ambulance crash = INSTANT GAME OVER (all points lost!)
- Game teaches safety and consequence-based thinking

### Technical Stack
- **HTML5 Canvas** - For rendering
- **Vanilla JavaScript** - No external dependencies
- **CSS3** - Modern, gradient-based UI
- **No build process** - Just open HTML file

### File Structure
```
src/
├── index.html    # Main game page with canvas
├── engine.js     # Game engine (physics, scoring, rendering)
├── player.js     # Player-editable strategy code
└── styles.css    # UI styling
```

### Player Programming Interface

Players write code in `player.js`:

```javascript
function controlTraffic(gameState) {
  // gameState contains:
  // - score (current points)
  // - elapsedTime (time played in ms)
  // - queues.north/south/east/west (arrays of vehicles)
  // - lights (current traffic light states)

  // Return array of directions to set green:
  return ['north'];  // or ['north', 'south'] for multiple
}
```

### Key Features

1. **Physics Simulation**: Realistic vehicle acceleration, deceleration, movement
2. **Collision Detection**: Vehicles wait for intersection to clear
3. **Dynamic Spawning**: Random vehicles appear from all directions
4. **Hidden Rules**: Scoring mechanics are discovered through gameplay
5. **Visual Feedback**: Clear UI showing score, time, queues, and traffic state

### Scoring System (Hidden from Player)

```
Points deducted every 100ms:
penalty = waitTime × vehicleWeight × baseDeduction

Weights:
- Ambulance: 5.0 (highest priority)
- Police: 4.0
- Government: 2.0
- Regular: 1.0 (baseline)
```

### Game Flow

1. Game starts with initial points (1000)
2. Vehicles spawn randomly from all 4 directions
3. Player's `controlTraffic()` function is called every frame
4. Engine updates traffic lights based on player's decision
5. Vehicles move when green light + clear intersection
6. Points decrease while vehicles wait
7. Game ends when points ≤ 0
8. Display total survival time

### Design Highlights

- **Modern UI**: Purple gradient background, clean white canvas container
- **Clear Visuals**: Distinct colors for each vehicle type
- **Smooth Animation**: 60 FPS physics simulation
- **Easy Iteration**: Edit player.js and refresh to test new strategies

### Implementation Approach

#### Phase 1: Core Engine (engine.js)
- Game state management
- Vehicle spawning and physics
- Traffic light control
- Scoring system
- Collision detection

#### Phase 2: Rendering (engine.js)
- Canvas setup
- Road and intersection drawing
- Vehicle rendering with type differentiation
- Traffic light visualization
- UI overlay (score, time, queues)

#### Phase 3: Player API (player.js)
- Simple example strategy
- Clear API documentation
- Error handling for player code

#### Phase 4: UI Polish (styles.css + index.html)
- Gradient backgrounds
- Responsive layout
- Modern typography
- Game over screen

### Key Technical Decisions

1. **Vanilla JS Only**: No dependencies for maximum portability
2. **Separate Player File**: Clear separation between engine and user code
3. **Simple Data Structures**: Plain objects and arrays for easy manipulation
4. **Frame-based Physics**: Predictable, consistent simulation
5. **Safety-first Traffic**: Intersection must clear before opposing direction goes green

### Extensibility Points

- Easy to add new vehicle types
- Configurable spawn rates and weights
- Adjustable scoring parameters
- Room for additional features (turns, pedestrians, etc.)

### Success Criteria

✅ Game runs in browser without installation
✅ Smooth 60 FPS animation
✅ Clear visual distinction between vehicle types
✅ Intuitive player API
✅ Accurate physics simulation
✅ Fair and challenging scoring system
✅ Professional, modern UI
✅ Safe traffic light transitions (no collisions)

## Next Steps

Once approved, implementation will proceed in `src/` directory with:
1. `index.html` - Main page structure
2. `engine.js` - Complete game engine
3. `player.js` - Example strategy template
4. `styles.css` - Visual styling

Estimated lines of code:
- engine.js: ~800-1000 lines (comprehensive with comments)
- player.js: ~30-50 lines (example with documentation)
- index.html: ~80-100 lines
- styles.css: ~150-200 lines

Total: ~1100-1400 lines of clean, well-documented code.
