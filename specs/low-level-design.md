# Traffic Controller Game - Low Level Design

## 1. Architecture Overview

### 1.1 System Components
```
┌─────────────────────────────────────────────────────────┐
│                      index.html                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Canvas Rendering Layer              │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐   │
│  │   engine.js  │  │  player.js   │  │  styles.css│   │
│  │              │  │              │  │            │   │
│  │ Game Engine  │◄─┤ Player Logic │  │    UI      │   │
│  │   Physics    │  │   Strategy   │  │   Design   │   │
│  │   Scoring    │  │              │  │            │   │
│  └──────────────┘  └──────────────┘  └────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 1.2 File Structure
```
TrafficController/
├── src/
│   ├── index.html          # Main game page
│   ├── engine.js           # Game engine and core logic
│   ├── player.js           # Player-editable control code
│   └── styles.css          # UI styling
└── specs/
    ├── requirements.md
    ├── user-stories.md
    └── low-level-design.md
```

## 2. Data Models

### 2.1 Core Data Structures

```javascript
// Direction enum
const Direction = {
  NORTH: 'north',
  SOUTH: 'south',
  EAST: 'east',
  WEST: 'west'
};

// Vehicle Type enum
const VehicleType = {
  REGULAR: 'regular',
  AMBULANCE: 'ambulance',
  POLICE: 'police',
  GOVERNMENT: 'government'
};

// Vehicle object
class Vehicle {
  constructor(id, type, direction, spawnTime) {
    this.id = id;              // Unique identifier
    this.type = type;          // VehicleType
    this.direction = direction; // Direction
    this.x = 0;                // X position (pixels)
    this.y = 0;                // Y position (pixels)
    this.speed = 0;            // Current speed (pixels/frame)
    this.targetSpeed = 0;      // Target speed for acceleration
    this.state = 'queued';     // 'queued', 'moving', 'exited', 'crashed'
    this.spawnTime = spawnTime; // Timestamp when created
    this.waitTime = 0;         // Total wait time in ms
    this.crashed = false;      // Has this vehicle crashed?
    this.crashTime = null;     // When did crash occur?
    this.rotation = 0;         // Rotation angle (changed when crashed)
  }
}

// Traffic Light state
class TrafficLight {
  constructor(direction) {
    this.direction = direction;
    this.state = 'red';        // 'red', 'green'
  }
}

// Game State
class GameState {
  constructor() {
    this.score = 1000;              // Starting points
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.isRunning = true;
    this.vehicles = [];             // All active vehicles
    this.crashedVehicles = [];      // Crashed vehicles (blocking intersection)
    this.totalCrashes = 0;          // Total crashes occurred
    this.crashesByType = {          // Track crashes by vehicle type
      regular: 0,
      ambulance: 0,
      police: 0,
      government: 0
    };
    this.lights = {                 // Traffic lights by direction
      north: new TrafficLight('north'),
      south: new TrafficLight('south'),
      east: new TrafficLight('east'),
      west: new TrafficLight('west')
    };
    this.queues = {                 // Vehicle queues by direction
      north: [],
      south: [],
      east: [],
      west: []
    };
  }
}

// Configuration object
const Config = {
  // Canvas
  canvasWidth: 800,
  canvasHeight: 800,

  // Intersection
  intersectionSize: 200,
  roadWidth: 100,

  // Vehicle properties
  vehicleWidth: 30,
  vehicleHeight: 50,
  vehicleMaxSpeed: 3,
  vehicleAcceleration: 0.1,
  vehicleDeceleration: 0.15,
  vehicleSafeDistance: 60,

  // Spawn settings
  spawnInterval: 2000,        // Base spawn interval in ms
  spawnVariance: 1000,        // Random variance in ms

  // Vehicle type weights (for scoring)
  waitWeights: {
    regular: 1,
    ambulance: 5,
    police: 4,
    government: 2
  },

  // Vehicle type spawn probabilities
  spawnProbabilities: {
    regular: 0.7,
    ambulance: 0.1,
    police: 0.1,
    government: 0.1
  },

  // Scoring
  initialScore: 1000,
  scoreUpdateInterval: 100,   // How often to deduct points (ms)
  baseDeduction: 0.1,         // Base points per update per vehicle

  // Crash penalties (CRITICAL - teaches consequences!)
  crashPenalties: {
    ambulance: Infinity,      // Instant game over - all points lost!
    police: 950,              // Nearly fatal - drops to ~50 points
    government: 400,          // Severe penalty
    regular: 200              // Significant penalty
  },
  crashedVehiclePenalty: 2.0,  // Multiplier for crashed vehicles blocking intersection

  // Crash physics
  crashRotationRange: 45,     // Random rotation degrees when crashed
  crashDetectionRadius: 40,   // Collision detection radius (pixels)

  // Physics
  fps: 60,
  frameTime: 1000 / 60
};
```

## 3. Engine Architecture (engine.js)

### 3.1 Core Engine Class

```javascript
class TrafficGameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.gameState = new GameState();
    this.config = Config;
    this.nextVehicleId = 0;
    this.lastSpawn = {};  // Track last spawn time per direction
    this.lastScoreUpdate = Date.now();

    this.init();
  }

  init() {
    // Setup canvas
    // Initialize spawn timers
    // Start game loop
  }

  // Game loop
  update(deltaTime) {
    // Update elapsed time
    // Spawn new vehicles
    // Call player code to get traffic light decisions
    // Update traffic lights (NO safety checks - player responsibility!)
    // Update vehicle positions
    // DETECT CRASHES (critical for learning!)
    // Handle crash consequences (score penalties, blocking)
    // Update score (wait time + crashes)
    // Check game over (score <= 0)
  }

  render() {
    // Clear canvas
    // Draw roads
    // Draw intersection
    // Draw traffic lights
    // Draw vehicles (normal and crashed with different visuals)
    // Draw smoke/effects for crashed vehicles
    // Draw UI (score, time, crash count)
  }

  gameLoop(timestamp) {
    // Calculate deltaTime
    // Update game state
    // Render frame
    // Request next frame
  }
}
```

### 3.2 Vehicle Management

```javascript
class VehicleManager {
  spawnVehicle(direction) {
    // Determine vehicle type (random weighted)
    // Create vehicle at spawn position
    // Add to gameState.vehicles
    // Add to direction queue
  }

  updateVehicles(deltaTime) {
    // For each vehicle:
    //   - Skip if crashed (stays stationary)
    //   - Calculate wait time if queued
    //   - Update position based on speed
    //   - Handle acceleration/deceleration
    //   - Check if vehicle should stop (red light OR crashed vehicle ahead)
    //   - Check if vehicle can move (clear ahead)
    //   - Remove if exited the map
  }

  getQueueForDirection(direction) {
    // Return sorted array of vehicles in direction queue
  }

  canVehicleMove(vehicle) {
    // Check if light is green
    // Check if intersection is clear
    // Check if vehicle ahead is clear
  }
}
```

### 3.3 Crash Detection Manager (CRITICAL FOR LEARNING!)

```javascript
class CrashDetectionManager {
  checkForCrashes(gameState) {
    // Get all vehicles currently in intersection
    const vehiclesInIntersection = this.getVehiclesInIntersection(gameState.vehicles);

    // Check for collisions between vehicles from different directions
    for (let i = 0; i < vehiclesInIntersection.length; i++) {
      for (let j = i + 1; j < vehiclesInIntersection.length; j++) {
        const v1 = vehiclesInIntersection[i];
        const v2 = vehiclesInIntersection[j];

        // If from different directions and close enough = CRASH!
        if (v1.direction !== v2.direction && this.areVehiclesColliding(v1, v2)) {
          this.executeCrash([v1, v2], gameState);
        }
      }
    }

    // Check if vehicles entering intersection with crashed vehicles
    this.checkCrashesWithBlockedIntersection(gameState);
  }

  areVehiclesColliding(v1, v2) {
    // Simple distance-based collision
    const distance = Math.sqrt(
      Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2)
    );
    return distance < Config.crashDetectionRadius;
  }

  executeCrash(vehicles, gameState) {
    // Mark all involved vehicles as crashed
    vehicles.forEach(vehicle => {
      if (!vehicle.crashed) {  // Don't re-crash already crashed vehicles
        vehicle.crashed = true;
        vehicle.state = 'crashed';
        vehicle.speed = 0;
        vehicle.crashTime = Date.now();
        vehicle.rotation = (Math.random() - 0.5) * Config.crashRotationRange;

        // Track crash statistics
        gameState.totalCrashes++;
        gameState.crashesByType[vehicle.type]++;
        gameState.crashedVehicles.push(vehicle);

        // Apply immediate score penalty
        this.applyCrashPenalty(vehicle, gameState);
      }
    });
  }

  applyCrashPenalty(vehicle, gameState) {
    const penalty = Config.crashPenalties[vehicle.type];

    if (penalty === Infinity) {
      // Ambulance crash = INSTANT GAME OVER (harsh but educational!)
      gameState.score = 0;
      console.error('💀 GAME OVER: Ambulance crashed! This is catastrophic!');
    } else {
      gameState.score = Math.max(0, gameState.score - penalty);
      console.warn(`💥 CRASH! ${vehicle.type} crashed. -${penalty} points!`);
    }
  }

  checkCrashesWithBlockedIntersection(gameState) {
    // If intersection has crashed vehicles, new vehicles entering will crash too
    if (gameState.crashedVehicles.length > 0) {
      const movingVehicles = gameState.vehicles.filter(v =>
        v.state === 'moving' && !v.crashed && this.isInIntersection(v)
      );

      movingVehicles.forEach(vehicle => {
        // Check if colliding with any crashed vehicle
        for (let crashed of gameState.crashedVehicles) {
          if (this.areVehiclesColliding(vehicle, crashed)) {
            this.executeCrash([vehicle], gameState);
            break;
          }
        }
      });
    }
  }

  isInIntersection(vehicle) {
    return vehicle.x > IntersectionBounds.left &&
           vehicle.x < IntersectionBounds.right &&
           vehicle.y > IntersectionBounds.top &&
           vehicle.y < IntersectionBounds.bottom;
  }

  getVehiclesInIntersection(vehicles) {
    return vehicles.filter(v => !v.crashed && this.isInIntersection(v));
  }
}
```

### 3.4 Traffic Light Management

```javascript
class TrafficLightManager {
  setGreenLights(directions) {
    // Validate input (array of direction strings)
    // NO SAFETY CHECKS - player must code safety logic themselves!
    // This is intentional for educational purposes

    // Set requested directions to green
    for (let direction of ['north', 'south', 'east', 'west']) {
      if (directions.includes(direction)) {
        gameState.lights[direction].state = 'green';
      } else {
        gameState.lights[direction].state = 'red';
      }
    }
  }

  // Helper function exposed to player API
  isIntersectionSafe(gameState, newDirections) {
    // Check if intersection is clear
    const vehiclesInIntersection = gameState.vehicles.filter(v =>
      v.state === 'moving' && this.isInIntersection(v)
    );

    // Check if any crashed vehicles blocking
    if (gameState.crashedVehicles.length > 0) {
      return false;  // Never safe if crashed vehicles present!
    }

    // Check if conflicting directions
    for (let dir of newDirections) {
      const conflicting = this.getConflictingDirections(dir);
      for (let other of newDirections) {
        if (dir !== other && conflicting.includes(other)) {
          return false;  // Conflicting directions!
        }
      }
    }

    return vehiclesInIntersection.length === 0;
  }

  getConflictingDirections(direction) {
    // In simple model, all directions conflict with each other
    // (Could be enhanced: north/south parallel, east/west parallel)
    const all = ['north', 'south', 'east', 'west'];
    return all.filter(d => d !== direction);
  }

  isInIntersection(vehicle) {
    return vehicle.x > IntersectionBounds.left &&
           vehicle.x < IntersectionBounds.right &&
           vehicle.y > IntersectionBounds.top &&
           vehicle.y < IntersectionBounds.bottom;
  }
}
```

### 3.5 Scoring System

```javascript
class ScoringManager {
  updateScore(gameState, deltaTime) {
    // For each waiting vehicle:
    //   - Calculate wait time
    //   - Apply vehicle type weight
    //   - Deduct points based on formula
    // For each crashed vehicle:
    //   - Apply additional penalty (they block intersection)
    // Update gameState.score
  }

  calculatePenalty(vehicle) {
    let penalty = vehicle.waitTime *
           Config.waitWeights[vehicle.type] *
           Config.baseDeduction;

    // Crashed vehicles continue to penalize (teach urgency!)
    if (vehicle.crashed) {
      penalty *= Config.crashedVehiclePenalty;
    }

    return penalty;
  }
}
```

### 3.6 Physics Engine

```javascript
class PhysicsEngine {
  updatePosition(vehicle, deltaTime) {
    // Update speed based on acceleration
    // Update position based on speed
    // Apply physics constraints
  }

  accelerate(vehicle) {
    // Increase speed toward target speed
    vehicle.speed = Math.min(
      vehicle.speed + Config.vehicleAcceleration,
      vehicle.targetSpeed
    );
  }

  decelerate(vehicle) {
    // Decrease speed
    vehicle.speed = Math.max(
      vehicle.speed - Config.vehicleDeceleration,
      0
    );
  }

  checkCollision(vehicle1, vehicle2) {
    // Simple bounding box collision
  }
}
```

### 3.7 Rendering System

```javascript
class Renderer {
  drawRoads(ctx) {
    // Draw 4 roads (rectangles)
    // North: top center vertical
    // South: bottom center vertical
    // East: right center horizontal
    // West: left center horizontal
  }

  drawIntersection(ctx) {
    // Draw central intersection square
    // Add lane markings
    // Add visual details
  }

  drawTrafficLight(ctx, direction, state) {
    // Position based on direction
    // Draw light box
    // Draw colored circle (red/green)
  }

  drawVehicle(ctx, vehicle) {
    // Position and rotate based on direction (or crash rotation!)
    // Draw rectangle for vehicle body
    // Color based on vehicle type:
    //   - Ambulance: red with cross
    //   - Police: blue with lights
    //   - Government: black
    //   - Regular: gray/various colors
    // If crashed:
    //   - Apply rotation
    //   - Darken color / add smoke effect
    //   - Add warning visual (explosion marks, etc.)
  }

  drawUI(ctx, gameState) {
    // Draw score display (prominent!)
    // Draw time display
    // Draw queue counts per direction
    // Draw crash count (educational feedback)
    // If crashed vehicles present, show WARNING indicator
  }

  drawGameOver(ctx, finalTime, crashStats) {
    // Draw game over overlay
    // Display final time survived
    // Display total crashes by type
    // Show reason for game over (ambulance crash? score=0?)
    // Show restart instruction
  }
}
```

## 4. Player API (player.js) - Designed for 15-year-olds!

### 4.1 API Interface (Simple and Educational)

```javascript
/**
 * ═══════════════════════════════════════════════════════════════
 *  YOUR TRAFFIC CONTROL FUNCTION
 *
 *  This function is called 60 times per second!
 *  You decide which directions get a GREEN light.
 *
 *  ⚠️  WARNING: If you set conflicting directions to green,
 *      vehicles WILL CRASH! Ambulance crashes = instant game over!
 * ═══════════════════════════════════════════════════════════════
 */
function controlTraffic(gameState) {
  // YOUR CODE GOES HERE!

  // WHAT YOU GET (gameState object):
  // ────────────────────────────────────────────────────────────
  // gameState.score          - Your current points (number)
  // gameState.timeElapsed    - Seconds since game started (number)
  // gameState.totalCrashes   - Total crashes so far (number)
  // gameState.hasActiveCrashes - true if intersection blocked (boolean)
  //
  // gameState.queues.north   - Array of vehicles waiting from north
  // gameState.queues.south   - Array of vehicles waiting from south
  // gameState.queues.east    - Array of vehicles waiting from east
  // gameState.queues.west    - Array of vehicles waiting from west
  //
  // gameState.lights.north   - {state: 'red' or 'green'}
  // gameState.lights.south   - {state: 'red' or 'green'}
  // gameState.lights.east    - {state: 'red' or 'green'}
  // gameState.lights.west    - {state: 'red' or 'green'}
  //
  // EACH VEHICLE IN QUEUE HAS:
  // ────────────────────────────────────────────────────────────
  // vehicle.type       - 'regular', 'ambulance', 'police', 'government'
  // vehicle.waitTime   - How long waiting in seconds (number)
  // vehicle.state      - 'queued', 'moving', 'crashed'
  //
  // HELPER FUNCTION AVAILABLE:
  // ────────────────────────────────────────────────────────────
  // isIntersectionSafe(directions) - Returns true if safe to go green
  //   Example: if (isIntersectionSafe(['north'])) { ... }
  //
  // WHAT YOU RETURN:
  // ────────────────────────────────────────────────────────────
  // Return an array of direction strings:
  //   ['north']              - Only north gets green light
  //   ['north', 'south']     - Both north and south (BE CAREFUL!)
  //   []                     - All red (no one moves)
  //
  // SCORING HINTS (figure out the rest!):
  // ────────────────────────────────────────────────────────────
  // ⚠️  Different vehicle types lose you points at different rates
  // ⚠️  Crashed vehicles = HUGE point loss
  // ⚠️  Ambulance crash = INSTANT GAME OVER (all points lost!)

  return ['north'];  // Replace this with your logic!
}
```

### 4.2 Example Player Implementations (Progression from Simple to Complex)

```javascript
// ═══════════════════════════════════════════════════════════════
// LEVEL 1: SUPER SIMPLE - Always let north go
// (Students start here - will crash immediately!)
// ═══════════════════════════════════════════════════════════════
function controlTraffic_Level1(gameState) {
  return ['north'];  // What could go wrong? 😅
}

// ═══════════════════════════════════════════════════════════════
// LEVEL 2: ROUND ROBIN - Take turns
// (Better, but still crashes! Why?)
// ═══════════════════════════════════════════════════════════════
function controlTraffic_Level2(gameState) {
  const directions = ['north', 'south', 'east', 'west'];
  const seconds = Math.floor(gameState.timeElapsed / 3);  // Change every 3 seconds
  const index = seconds % 4;
  return [directions[index]];
}

// ═══════════════════════════════════════════════════════════════
// LEVEL 3: SAFE ROUND ROBIN - Wait for intersection to clear!
// (Now we're learning! Much safer.)
// ═══════════════════════════════════════════════════════════════
function controlTraffic_Level3(gameState) {
  // If there are crashed vehicles, don't change lights!
  if (gameState.hasActiveCrashes) {
    return [];  // All red - stop everything
  }

  const directions = ['north', 'south', 'east', 'west'];
  const seconds = Math.floor(gameState.timeElapsed / 3);
  const index = seconds % 4;
  const nextDirection = directions[index];

  // Only go green if safe!
  if (isIntersectionSafe([nextDirection])) {
    return [nextDirection];
  }

  return [];  // Wait for intersection to clear
}

// ═══════════════════════════════════════════════════════════════
// LEVEL 4: PRIORITY SYSTEM - Emergency vehicles first!
// (Smart! Ambulances are important.)
// ═══════════════════════════════════════════════════════════════
function controlTraffic_Level4(gameState) {
  if (gameState.hasActiveCrashes) return [];

  const directions = ['north', 'south', 'east', 'west'];

  // Check each direction for emergency vehicles
  for (let dir of directions) {
    const queue = gameState.queues[dir];
    if (queue.length > 0 && queue[0].type === 'ambulance') {
      // AMBULANCE! Let it through immediately (if safe)
      if (isIntersectionSafe([dir])) {
        return [dir];
      }
    }
  }

  // Check for police
  for (let dir of directions) {
    const queue = gameState.queues[dir];
    if (queue.length > 0 && queue[0].type === 'police') {
      if (isIntersectionSafe([dir])) {
        return [dir];
      }
    }
  }

  // No emergencies - use round robin
  const seconds = Math.floor(gameState.timeElapsed / 3);
  const index = seconds % 4;
  const nextDirection = directions[index];

  if (isIntersectionSafe([nextDirection])) {
    return [nextDirection];
  }

  return [];
}

// ═══════════════════════════════════════════════════════════════
// LEVEL 5: ADVANCED - Smart waiting time management
// (This is getting sophisticated!)
// ═══════════════════════════════════════════════════════════════
function controlTraffic_Level5(gameState) {
  if (gameState.hasActiveCrashes) return [];

  const directions = ['north', 'south', 'east', 'west'];

  // Calculate "urgency score" for each direction
  let best = null;
  let bestScore = -1;

  for (let dir of directions) {
    const queue = gameState.queues[dir];
    if (queue.length === 0) continue;

    let urgencyScore = 0;

    // Score each vehicle in queue
    for (let vehicle of queue) {
      // Base score = wait time
      let score = vehicle.waitTime;

      // Multiply by importance
      if (vehicle.type === 'ambulance') score *= 10;      // Highest priority!
      else if (vehicle.type === 'police') score *= 5;
      else if (vehicle.type === 'government') score *= 2;
      // regular = 1x

      urgencyScore += score;
    }

    if (urgencyScore > bestScore) {
      bestScore = urgencyScore;
      best = dir;
    }
  }

  // Let the most urgent direction go (if safe)
  if (best && isIntersectionSafe([best])) {
    return [best];
  }

  return [];
}
```

## 5. UI Design (styles.css)

### 5.1 Layout Structure

```css
/* Main container */
body {
  margin: 0;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

/* Game title */
#title {
  color: white;
  font-size: 48px;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

/* Canvas container */
#game-container {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

/* Canvas */
#game-canvas {
  border: 2px solid #333;
  border-radius: 10px;
  display: block;
}

/* Stats panel */
#stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  color: white;
  font-size: 24px;
}

.stat-item {
  background: rgba(255,255,255,0.2);
  padding: 10px 20px;
  border-radius: 10px;
}
```

### 5.2 Color Scheme

```
Primary Background: Purple gradient (#667eea to #764ba2)
Canvas Background: White (#ffffff)
Road Color: Dark gray (#333333)
Intersection: Light gray (#cccccc)
Lane Markings: Yellow (#ffcc00)

Vehicle Colors:
- Ambulance: Red (#ff0000) with white cross
- Police: Blue (#0044ff) with light blue details
- Government: Black (#000000) with flag icon
- Regular: Various (gray, blue, red, green)

Traffic Lights:
- Red: #ff0000
- Green: #00ff00
- Light housing: #333333
```

## 6. Coordinate System

### 6.1 Canvas Layout (800x800)

```
(0,0) ──────────────────────────── (800,0)
  │                                    │
  │        North Road (350-450)       │
  │              ↓ ↓ ↓                │
  │    ┌─────────────────────┐       │
  │    │                     │       │
  │────┤   Intersection      ├────   │ (300)
  │    │   (300-500, 300-500)│       │
  │    └─────────────────────┘       │
  │              ↑ ↑ ↑                │
  │        South Road (350-450)      │
  │                                    │
(0,800)───────────────────────── (800,800)

West Road (0-300)  ←←←  ║  →→→  East Road (500-800)
```

### 6.2 Vehicle Spawn Positions

```javascript
const SpawnPositions = {
  north: { x: 375, y: -60 },      // Top, moving down
  south: { x: 425, y: 860 },      // Bottom, moving up
  east: { x: 860, y: 375 },       // Right, moving left
  west: { x: -60, y: 425 }        // Left, moving right
};

const IntersectionBounds = {
  left: 300,
  right: 500,
  top: 300,
  bottom: 500
};
```

## 7. Game Flow

### 7.1 Initialization Sequence

1. Load HTML page
2. Initialize canvas and context
3. Create GameState with initial values
4. Set up event listeners (if needed)
5. Start game loop
6. Begin spawning vehicles

### 7.2 Game Loop Sequence (60 FPS)

```
┌─────────────────────────────────┐
│     Calculate Delta Time        │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│     Update Elapsed Time         │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│   Spawn Random Vehicles         │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  Call Player controlTraffic()   │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│    Update Traffic Lights        │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│    Update Vehicle Physics       │
│  - Position                      │
│  - Speed                         │
│  - State                         │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│      Update Score               │
│  - Calculate penalties          │
│  - Deduct points                │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│    Check Game Over              │
│  (score <= 0)                   │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│      Render Frame               │
│  - Clear canvas                 │
│  - Draw all elements            │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  Request Next Animation Frame   │
└─────────────────────────────────┘
```

## 8. Physics Calculations

### 8.1 Vehicle Movement

```javascript
// Update position each frame
vehicle.x += vehicle.speed * Math.cos(vehicle.angle);
vehicle.y += vehicle.speed * Math.sin(vehicle.angle);

// Angles by direction
const Angles = {
  north: Math.PI / 2,    // 90° (down)
  south: -Math.PI / 2,   // -90° (up)
  east: Math.PI,         // 180° (left)
  west: 0                // 0° (right)
};
```

### 8.2 Speed Control

```javascript
// Determine target speed
if (shouldStop(vehicle)) {
  vehicle.targetSpeed = 0;
} else if (canMove(vehicle)) {
  vehicle.targetSpeed = Config.vehicleMaxSpeed;
}

// Smooth acceleration/deceleration
if (vehicle.speed < vehicle.targetSpeed) {
  vehicle.speed += Config.vehicleAcceleration;
} else if (vehicle.speed > vehicle.targetSpeed) {
  vehicle.speed -= Config.vehicleDeceleration;
}
```

### 8.3 Collision Detection

```javascript
function isInIntersection(vehicle) {
  return vehicle.x > IntersectionBounds.left &&
         vehicle.x < IntersectionBounds.right &&
         vehicle.y > IntersectionBounds.top &&
         vehicle.y < IntersectionBounds.bottom;
}

function vehiclesOverlap(v1, v2) {
  const distance = Math.sqrt(
    Math.pow(v1.x - v2.x, 2) +
    Math.pow(v1.y - v2.y, 2)
  );
  return distance < Config.vehicleSafeDistance;
}
```

## 9. Error Handling

### 9.1 Player Code Errors

```javascript
function safeCallPlayerCode(gameState) {
  try {
    const result = controlTraffic(gameState);

    // Validate result
    if (!Array.isArray(result)) {
      console.error('Player code must return array');
      return [];
    }

    // Validate directions
    const validDirections = result.filter(dir =>
      ['north', 'south', 'east', 'west'].includes(dir)
    );

    return validDirections;
  } catch (error) {
    console.error('Player code error:', error);
    return [];  // Failsafe: all red
  }
}
```

## 10. Performance Considerations

### 10.1 Optimization Strategies

1. **Object Pooling**: Reuse vehicle objects instead of creating new ones
2. **Culling**: Don't render vehicles far outside viewport
3. **Efficient Collision**: Only check vehicles near intersection
4. **Throttled Updates**: Score updates every 100ms, not every frame
5. **Canvas Optimization**: Use layering for static elements

### 10.2 Memory Management

```javascript
// Remove exited vehicles periodically
function cleanupVehicles() {
  gameState.vehicles = gameState.vehicles.filter(v =>
    v.state !== 'exited' || v.removeTime > Date.now() - 1000
  );
}
```

## 11. Testing Strategy

### 11.1 Unit Tests (Manual)

- Vehicle spawning logic
- Score calculation formula
- Collision detection
- Traffic light state management

### 11.2 Integration Tests

- Full game loop execution
- Player API integration
- Score deduction over time
- Game over condition

### 11.3 Visual Tests

- Vehicle rendering at all positions
- Traffic light states
- UI element positioning
- Animation smoothness

## 12. Future Enhancement Hooks

### 12.1 Extensibility Points

- Additional vehicle types (easy to add to enum)
- Multiple intersections (extend game state)
- Power-ups/bonuses (add to config)
- Difficulty levels (adjust spawn rates)
- Sound effects (add audio manager)
- Leaderboard (add persistence layer)
