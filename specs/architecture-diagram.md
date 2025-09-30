# Traffic Controller Game - Architecture Diagrams

## 1. System Architecture

### 1.1 High-Level Component View

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser                               │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    index.html                           │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │         HTML Canvas (800x800)                    │  │  │
│  │  │                                                   │  │  │
│  │  │  Renders:                                        │  │  │
│  │  │  • Roads and intersection                        │  │  │
│  │  │  • Vehicles (4 types)                           │  │  │
│  │  │  • Traffic lights                                │  │  │
│  │  │  • UI (score, time, queues)                     │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  engine.js   │  │  player.js   │  │  styles.css  │      │
│  │              │  │              │  │              │      │
│  │  • Game Loop │  │ • Strategy   │  │ • Gradients  │      │
│  │  • Physics   │  │ • Decision   │  │ • Layout     │      │
│  │  • Scoring   │  │   Logic      │  │ • Colors     │      │
│  │  • Rendering │  │ • Returns    │  │ • Typography │      │
│  │  • API       │  │   Directions │  │              │      │
│  └──────┬───────┘  └──────▲───────┘  └──────────────┘      │
│         │                  │                                 │
│         └──────calls───────┘                                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 2. Engine Internal Architecture

### 2.1 Engine Class Structure

```
TrafficGameEngine
│
├── GameState
│   ├── score (number)
│   ├── startTime (timestamp)
│   ├── elapsedTime (ms)
│   ├── isRunning (boolean)
│   ├── vehicles[] (Vehicle objects)
│   ├── lights{} (TrafficLight by direction)
│   └── queues{} (Vehicle arrays by direction)
│
├── VehicleManager
│   ├── spawnVehicle(direction)
│   ├── updateVehicles(deltaTime)
│   ├── getQueueForDirection(dir)
│   └── canVehicleMove(vehicle)
│
├── TrafficLightManager
│   ├── setGreenLights(directions[])
│   ├── isIntersectionClear(direction)
│   └── getConflictingDirections(dir)
│
├── ScoringManager
│   ├── updateScore(gameState, deltaTime)
│   └── calculatePenalty(vehicle)
│
├── PhysicsEngine
│   ├── updatePosition(vehicle, dt)
│   ├── accelerate(vehicle)
│   ├── decelerate(vehicle)
│   └── checkCollision(v1, v2)
│
└── Renderer
    ├── drawRoads(ctx)
    ├── drawIntersection(ctx)
    ├── drawTrafficLight(ctx, dir, state)
    ├── drawVehicle(ctx, vehicle)
    ├── drawUI(ctx, gameState)
    └── drawGameOver(ctx, time)
```

## 3. Data Flow Diagram

### 3.1 Main Game Loop Flow

```
┌─────────────┐
│   START     │
│  Game Loop  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Calculate Delta Time   │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Spawn New Vehicles     │◄────────────────┐
│  (Random intervals)     │                 │
└──────────┬──────────────┘                 │
           │                                 │
           ▼                                 │
┌─────────────────────────┐                 │
│  Build API Object       │                 │
│  {score, time, queues}  │                 │
└──────────┬──────────────┘                 │
           │                                 │
           ▼                                 │
┌─────────────────────────┐                 │
│  Call Player Function   │                 │
│  controlTraffic(state)  │                 │
└──────────┬──────────────┘                 │
           │                                 │
           ▼                                 │
┌─────────────────────────┐                 │
│  Validate & Apply       │                 │
│  Traffic Light Changes  │                 │
└──────────┬──────────────┘                 │
           │                                 │
           ▼                                 │
┌─────────────────────────┐                 │
│  Update Vehicle Physics │                 │
│  • Position             │                 │
│  • Speed                │                 │
│  • State (queued/moving)│                 │
└──────────┬──────────────┘                 │
           │                                 │
           ▼                                 │
┌─────────────────────────┐                 │
│  Update Score           │                 │
│  • Calculate penalties  │                 │
│  • Deduct points        │                 │
└──────────┬──────────────┘                 │
           │                                 │
           ▼                                 │
┌─────────────────────────┐                 │
│  Check Game Over?       │                 │
│  (score <= 0)           │                 │
└──────────┬──────────────┘                 │
           │                                 │
      ┌────┴────┐                           │
      │         │                           │
     NO        YES                          │
      │         │                           │
      │         ▼                           │
      │  ┌─────────────┐                   │
      │  │  Show Game  │                   │
      │  │    Over     │                   │
      │  └─────────────┘                   │
      │                                     │
      ▼                                     │
┌─────────────────────────┐                │
│  Render Frame           │                │
│  • Clear canvas         │                │
│  • Draw all elements    │                │
└──────────┬──────────────┘                │
           │                                 │
           ▼                                 │
┌─────────────────────────┐                │
│  Request Animation      │                │
│  Frame (60 FPS)         │────────────────┘
└─────────────────────────┘
```

## 4. Vehicle Lifecycle

### 4.1 Vehicle State Transitions

```
┌─────────────┐
│   SPAWN     │
│  (off-map)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│      QUEUED             │
│  • Waiting at red light │
│  • Accumulating wait    │
│    time                 │
│  • Contributing to      │
│    score penalty        │
└──────────┬──────────────┘
           │
           │ Light turns green
           │ & intersection clear
           ▼
┌─────────────────────────┐
│      MOVING             │
│  • Accelerating         │
│  • Crossing intersection│
│  • Not penalized        │
└──────────┬──────────────┘
           │
           │ Leaves map bounds
           ▼
┌─────────────────────────┐
│      EXITED             │
│  • Removed from game    │
│  • Freed from memory    │
└─────────────────────────┘
```

## 5. Traffic Light State Machine

### 5.1 Light State Per Direction

```
┌─────────────┐
│     RED     │◄────────┐
│  (Default)  │         │
└──────┬──────┘         │
       │                 │
       │ Player selects  │
       │ this direction  │
       │ & safe to go    │
       ▼                 │
┌─────────────┐         │
│    GREEN    │         │
│  (Vehicles  │         │
│   moving)   │         │
└──────┬──────┘         │
       │                 │
       │ Player selects  │
       │ different       │
       │ direction       │
       └─────────────────┘
```

### 5.2 Multi-Direction Logic

```
Player returns: ['north']
┌─────────────────────────────┐
│  North: GREEN               │
│  South: RED                 │
│  East:  RED                 │
│  West:  RED                 │
└─────────────────────────────┘

Player returns: ['north', 'south']
┌─────────────────────────────┐
│  North: GREEN (if safe)     │
│  South: GREEN (if safe)     │
│  East:  RED                 │
│  West:  RED                 │
└─────────────────────────────┘
```

## 6. Coordinate System & Zones

### 6.1 Canvas Layout (800x800px)

```
        NORTH SPAWN (-60y)
              ↓
    0,0 ─────────────────── 800,0
     │    │         │       │
     │    │  NORTH  │       │
     │    │  ROAD   │       │
     │    └─────────┘       │
     │  ┌───────────────┐   │ 300
  W  │  │               │   │
  E  │──┤ INTERSECTION  ├──│ E
  S  │  │               │   │
  T  │  │  300,300 -    │   │
     │  │  500,500      │   │
  R  │  └───────────────┘   │ 500
  O  │    ┌─────────┐       │
  A  │    │  SOUTH  │       │
  D  │    │  ROAD   │       │
     │    │         │       │
     │    ↑         │       │
  0,800 ───────────────── 800,800
         SOUTH SPAWN (860y)

 WEST            EAST
SPAWN          SPAWN
(-60x)         (860x)
```

### 6.2 Intersection Zones

```
┌──────────────────────────────┐
│    APPROACH ZONE             │
│    (Vehicles decelerate      │
│     if red light)            │
│         y: 200-300           │
└────────────┬─────────────────┘
             │
┌────────────▼─────────────────┐
│    INTERSECTION ZONE         │
│    (Must be clear before     │
│     new direction goes green)│
│    x: 300-500, y: 300-500    │
└────────────┬─────────────────┘
             │
┌────────────▼─────────────────┐
│    EXIT ZONE                 │
│    (Vehicles accelerate      │
│     and clear intersection)  │
│         y: 500-600           │
└──────────────────────────────┘
```

## 7. Scoring System Flow

### 7.1 Score Calculation

```
Every 100ms:
┌────────────────────────────────┐
│  For each QUEUED vehicle:      │
│                                 │
│  penalty =                      │
│    waitTime (ms)                │
│    × vehicleWeight              │
│    × baseDeduction (0.1)        │
│                                 │
│  Weights:                       │
│  • Ambulance:  5.0              │
│  • Police:     4.0              │
│  • Government: 2.0              │
│  • Regular:    1.0              │
│                                 │
│  score = score - penalty        │
└────────────────────────────────┘

Example:
Ambulance waiting 5 seconds:
  penalty = 5000ms × 5.0 × 0.1
          = 2500 points!

Regular car waiting 5 seconds:
  penalty = 5000ms × 1.0 × 0.1
          = 500 points
```

## 8. Player API Interface

### 8.1 API Object Structure

```javascript
// Passed to controlTraffic() function
{
  score: 750,              // Current points
  elapsedTime: 45000,      // 45 seconds in ms

  queues: {
    north: [
      {
        id: 12,
        type: 'ambulance',
        waitTime: 3500,    // 3.5 seconds
        state: 'queued'
      },
      {
        id: 15,
        type: 'regular',
        waitTime: 2100,
        state: 'queued'
      }
    ],
    south: [],
    east: [
      {
        id: 18,
        type: 'police',
        waitTime: 1200,
        state: 'queued'
      }
    ],
    west: [
      {
        id: 20,
        type: 'government',
        waitTime: 4500,
        state: 'queued'
      },
      {
        id: 21,
        type: 'regular',
        waitTime: 1500,
        state: 'queued'
      }
    ]
  },

  lights: {
    north: { state: 'green' },
    south: { state: 'red' },
    east: { state: 'red' },
    west: { state: 'red' }
  }
}

// Player returns:
['north']  // Single direction
// or
['north', 'south']  // Multiple (parallel lanes)
// or
[]  // All red (emergency stop)
```

## 9. File Dependencies

### 9.1 Loading Order

```
index.html
    │
    ├──> styles.css (loaded in <head>)
    │
    ├──> engine.js (loaded before body close)
    │       │
    │       └──> Defines all engine classes
    │
    ├──> player.js (loaded after engine.js)
    │       │
    │       └──> Defines controlTraffic()
    │
    └──> <script> (inline in index.html)
            │
            └──> Initializes game:
                 new TrafficGameEngine('game-canvas')
```

## 10. Rendering Pipeline

### 10.1 Draw Order (Front to Back)

```
1. Clear canvas (white background)
   │
   ▼
2. Draw roads (gray rectangles)
   │
   ▼
3. Draw lane markings (yellow dashes)
   │
   ▼
4. Draw intersection (light gray square)
   │
   ▼
5. Draw traffic lights (colored circles)
   │
   ▼
6. Draw vehicles (sorted by Y position)
   │  • Regular cars (gray)
   │  • Government (black)
   │  • Police (blue)
   │  • Ambulance (red with cross)
   │
   ▼
7. Draw UI overlay
   │  • Score (top-left)
   │  • Time (top-right)
   │  • Queue counts (corners)
   │
   ▼
8. [If game over] Draw overlay
      • Semi-transparent background
      • "GAME OVER" text
      • Final time
      • Restart instruction
```

## 11. Performance Optimization Points

### 11.1 Optimization Strategy

```
┌─────────────────────────────┐
│  Spawn Rate Limiting        │
│  • Max 1 vehicle per        │
│    direction per 2 seconds  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Vehicle Cap                │
│  • Max 50 vehicles total    │
│  • Remove old exited ones   │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Culling                    │
│  • Don't draw vehicles      │
│    far off-canvas           │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Collision Optimization     │
│  • Only check vehicles      │
│    near intersection        │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Score Update Throttling    │
│  • Calculate every 100ms    │
│    not every frame (16ms)   │
└─────────────────────────────┘
```

## 12. Error Handling Architecture

### 12.1 Safety Layers

```
┌──────────────────────────────┐
│  Player Code Execution       │
└────────────┬─────────────────┘
             │
        ┌────▼────┐
        │  try {  │
        └────┬────┘
             │
             ▼
┌──────────────────────────────┐
│  Call controlTraffic()       │
└────────────┬─────────────────┘
             │
        ┌────▼────┐
        │ } catch │
        └────┬────┘
             │
             ▼
┌──────────────────────────────┐
│  Log error to console        │
│  Return safe default: []     │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│  Validate return value       │
│  • Is array?                 │
│  • Valid directions?         │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│  Apply safety checks         │
│  • Intersection clear?       │
│  • Conflicting directions?   │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│  Update traffic lights       │
└──────────────────────────────┘
```

This architecture ensures the game remains playable even if player code has bugs.
