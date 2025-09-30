// ═══════════════════════════════════════════════════════════════════════════════
// TRAFFIC CONTROLLER GAME ENGINE
// Educational game for learning programming through traffic management
// ═══════════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ───────────────────────────────────────────────────────────────────────────────

const Config = {
  // Canvas dimensions
  canvasWidth: 800,
  canvasHeight: 800,

  // Intersection layout
  intersectionSize: 200,
  intersectionLeft: 300,
  intersectionRight: 500,
  intersectionTop: 300,
  intersectionBottom: 500,
  roadWidth: 100,

  // Vehicle properties
  vehicleWidth: 30,
  vehicleHeight: 50,
  vehicleMaxSpeed: 1.5,         // Slower max speed for longer intersection time
  vehicleAcceleration: 0.15,    // FAST acceleration so they enter quickly
  vehicleDeceleration: 0.2,
  vehicleSafeDistance: 60,

  // Spawn settings
  spawnInterval: 3000,        // Base spawn interval in ms (slower spawn rate)
  spawnVariance: 2000,        // Random variance
  spawnProbabilities: {
    regular: 0.65,            // 65% regular cars
    ambulance: 0.10,          // 10% ambulances
    police: 0.12,             // 12% police
    government: 0.13          // 13% government
  },

  // Scoring (hidden from player - they discover through gameplay!)
  initialScore: 2000,         // Starting points (increased for longer games!)
  scoreUpdateInterval: 100,   // Update score every 100ms
  baseDeduction: 0.05,        // Base points deduction per vehicle per update (reduced!)
  waitWeights: {              // Multipliers for different vehicle types
    regular: 1,
    ambulance: 5,             // Ambulances cost 5x more when waiting
    police: 4,
    government: 2
  },

  // CRASH PENALTIES (SEVERE - teaches consequences!)
  crashPenalties: {
    ambulance: Infinity,      // INSTANT GAME OVER!
    police: 950,              // Nearly fatal (-95% of starting points)
    government: 400,          // Severe
    regular: 200              // Significant
  },
  crashedVehiclePenalty: 2.0, // Crashed vehicles continue to drain points

  // Crash physics
  crashDetectionRadius: 50,     // Larger radius = easier to detect crashes
  crashRotationRange: 45,

  // Game speed
  fps: 60
};

// ───────────────────────────────────────────────────────────────────────────────
// VEHICLE CLASS
// ───────────────────────────────────────────────────────────────────────────────

class Vehicle {
  constructor(id, type, direction, spawnTime) {
    this.id = id;
    this.type = type;              // 'regular', 'ambulance', 'police', 'government'
    this.direction = direction;    // 'north', 'south', 'east', 'west'
    this.spawnTime = spawnTime;
    this.state = 'queued';         // 'queued', 'moving', 'crashed', 'exited'

    // Position and movement
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.targetSpeed = 0;
    this.angle = 0;

    // Timing
    this.waitTime = 0;             // In seconds

    // Crash state
    this.crashed = false;
    this.crashTime = null;
    this.rotation = 0;             // Additional rotation when crashed

    // Set initial position and angle based on direction
    this.initializePosition();
  }

  initializePosition() {
    const centerX = Config.canvasWidth / 2;
    const centerY = Config.canvasHeight / 2;

    switch (this.direction) {
      case 'north':
        this.x = centerX - 15;     // Offset for lane (left lane)
        this.y = 50;               // Start near top of canvas
        this.angle = Math.PI;      // Point down (180 degrees, front of car points down)
        break;
      case 'south':
        this.x = centerX + 15;     // Offset for lane (right lane)
        this.y = Config.canvasHeight - 50;
        this.angle = 0;            // Point up (0 degrees, front of car points up)
        break;
      case 'east':
        this.x = Config.canvasWidth - 50;
        this.y = centerY + 15;     // Offset for lane (bottom lane)
        this.angle = Math.PI / 2;  // Point left (90 degrees)
        break;
      case 'west':
        this.x = 50;
        this.y = centerY - 15;     // Offset for lane (top lane)
        this.angle = -Math.PI / 2; // Point right (-90 degrees)
        break;
    }
  }

  isInIntersection() {
    return this.x > Config.intersectionLeft &&
           this.x < Config.intersectionRight &&
           this.y > Config.intersectionTop &&
           this.y < Config.intersectionBottom;
  }

  // Check if vehicle is approaching intersection and should stop (at red light)
  shouldStopAtIntersection() {
    const stopDistance = 80;  // Stop this many pixels before intersection

    switch (this.direction) {
      case 'north':  // Moving down, check if approaching from top
        return this.y < Config.intersectionTop &&
               this.y > Config.intersectionTop - stopDistance;
      case 'south':  // Moving up, check if approaching from bottom
        return this.y > Config.intersectionBottom &&
               this.y < Config.intersectionBottom + stopDistance;
      case 'east':   // Moving left, check if approaching from right
        return this.x > Config.intersectionRight &&
               this.x < Config.intersectionRight + stopDistance;
      case 'west':   // Moving right, check if approaching from left
        return this.x < Config.intersectionLeft &&
               this.x > Config.intersectionLeft - stopDistance;
    }
    return false;
  }

  hasExitedMap() {
    return this.x < -100 || this.x > Config.canvasWidth + 100 ||
           this.y < -100 || this.y > Config.canvasHeight + 100;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// GAME STATE CLASS
// ───────────────────────────────────────────────────────────────────────────────

class GameState {
  constructor() {
    this.score = Config.initialScore;
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.timeElapsed = 0;          // For player API (in seconds)
    this.isRunning = true;

    // Vehicles
    this.vehicles = [];
    this.crashedVehicles = [];
    this.totalCrashes = 0;
    this.crashesByType = {
      regular: 0,
      ambulance: 0,
      police: 0,
      government: 0
    };

    // Traffic lights
    this.lights = {
      north: { state: 'red' },
      south: { state: 'red' },
      east: { state: 'red' },
      west: { state: 'red' }
    };

    // Queues (for player API)
    this.queues = {
      north: [],
      south: [],
      east: [],
      west: []
    };

    // Convenience property for player
    this.hasActiveCrashes = false;
  }

  updateQueues() {
    // Clear queues
    this.queues.north = [];
    this.queues.south = [];
    this.queues.east = [];
    this.queues.west = [];

    // Rebuild queues from vehicles
    for (let vehicle of this.vehicles) {
      if (vehicle.state === 'queued' || vehicle.state === 'moving') {
        this.queues[vehicle.direction].push({
          type: vehicle.type,
          waitTime: vehicle.waitTime,
          state: vehicle.state
        });
      }
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// CRASH DETECTION MANAGER (CORE EDUCATIONAL MECHANIC!)
// ───────────────────────────────────────────────────────────────────────────────

class CrashDetectionManager {
  checkForCrashes(gameState) {
    // Get vehicles currently in intersection
    const vehiclesInIntersection = gameState.vehicles.filter(v =>
      !v.crashed &&
      v.state === 'moving' &&
      v.isInIntersection()
    );

    // Check for collisions between vehicles from CONFLICTING directions
    for (let i = 0; i < vehiclesInIntersection.length; i++) {
      for (let j = i + 1; j < vehiclesInIntersection.length; j++) {
        const v1 = vehiclesInIntersection[i];
        const v2 = vehiclesInIntersection[j];

        // Only crash if directions are conflicting (perpendicular)
        // North/South are parallel (don't crash)
        // East/West are parallel (don't crash)
        // North+East, North+West, South+East, South+West = CRASH!
        if (this.areDirectionsConflicting(v1.direction, v2.direction) && this.areColliding(v1, v2)) {
          this.executeCrash([v1, v2], gameState);
        }
      }
    }

    // Check for vehicles entering blocked intersection
    this.checkCrashesWithBlockedIntersection(gameState);
  }

  areDirectionsConflicting(dir1, dir2) {
    // North and South are parallel (same axis) - don't conflict
    if ((dir1 === 'north' && dir2 === 'south') || (dir1 === 'south' && dir2 === 'north')) {
      return false;
    }
    // East and West are parallel (same axis) - don't conflict
    if ((dir1 === 'east' && dir2 === 'west') || (dir1 === 'west' && dir2 === 'east')) {
      return false;
    }
    // All perpendicular combinations conflict
    return true;
  }

  areColliding(v1, v2) {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < Config.crashDetectionRadius;
  }

  executeCrash(vehicles, gameState) {
    console.error('💥 CRASH DETECTED!', vehicles.map(v => v.type));

    for (let vehicle of vehicles) {
      if (vehicle.crashed) continue;  // Already crashed

      // Mark as crashed
      vehicle.crashed = true;
      vehicle.state = 'crashed';
      vehicle.speed = 0;
      vehicle.crashTime = Date.now();
      vehicle.rotation = (Math.random() - 0.5) * Config.crashRotationRange * (Math.PI / 180);

      // Add to crashed vehicles list
      gameState.crashedVehicles.push(vehicle);
      gameState.totalCrashes++;
      gameState.crashesByType[vehicle.type]++;

      // Apply penalty
      this.applyCrashPenalty(vehicle, gameState);
    }

    gameState.hasActiveCrashes = gameState.crashedVehicles.length > 0;
  }

  applyCrashPenalty(vehicle, gameState) {
    const penalty = Config.crashPenalties[vehicle.type];

    if (penalty === Infinity) {
      // Ambulance crash = INSTANT GAME OVER (harsh but educational!)
      gameState.score = 0;
      gameState.isRunning = false;
      console.error('💀 GAME OVER: Ambulance crashed! This is CATASTROPHIC!');
    } else {
      gameState.score = Math.max(0, gameState.score - penalty);
      console.warn(`⚠️  CRASH: ${vehicle.type} crashed! -${penalty} points. Score: ${Math.round(gameState.score)}`);

      if (gameState.score <= 0) {
        gameState.isRunning = false;
      }
    }
  }

  checkCrashesWithBlockedIntersection(gameState) {
    if (gameState.crashedVehicles.length === 0) return;

    // Check vehicles entering intersection
    const enteringVehicles = gameState.vehicles.filter(v =>
      !v.crashed &&
      v.state === 'moving' &&
      v.isInIntersection()
    );

    for (let vehicle of enteringVehicles) {
      // Check if colliding with any crashed vehicle
      for (let crashed of gameState.crashedVehicles) {
        if (this.areColliding(vehicle, crashed)) {
          console.warn('💥 Cascading crash! Vehicle hit blocked intersection.');
          this.executeCrash([vehicle], gameState);
          break;
        }
      }
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// VEHICLE MANAGER
// ───────────────────────────────────────────────────────────────────────────────

class VehicleManager {
  constructor() {
    this.nextVehicleId = 0;
    // Start with negative time so vehicles spawn immediately
    const now = Date.now();
    this.lastSpawnTime = {
      north: now - 3000,   // Spawn immediately
      south: now - 3000,
      east: now - 3000,
      west: now - 3000
    };
  }

  spawnVehicle(direction, currentTime, gameState) {
    // Check if enough time has passed since last spawn
    const timeSinceLastSpawn = currentTime - this.lastSpawnTime[direction];
    const spawnDelay = Config.spawnInterval + (Math.random() * Config.spawnVariance);

    if (timeSinceLastSpawn < spawnDelay) return;

    // Determine vehicle type (weighted random)
    const type = this.getRandomVehicleType();

    // Create vehicle
    const vehicle = new Vehicle(this.nextVehicleId++, type, direction, currentTime);
    gameState.vehicles.push(vehicle);

    this.lastSpawnTime[direction] = currentTime;
  }

  getRandomVehicleType() {
    const rand = Math.random();
    const probs = Config.spawnProbabilities;

    if (rand < probs.regular) return 'regular';
    if (rand < probs.regular + probs.ambulance) return 'ambulance';
    if (rand < probs.regular + probs.ambulance + probs.police) return 'police';
    return 'government';
  }

  updateVehicles(deltaTime, gameState) {
    const toRemove = [];

    for (let vehicle of gameState.vehicles) {
      // Skip crashed vehicles (they stay stationary)
      if (vehicle.crashed) continue;

      // Skip exited vehicles
      if (vehicle.state === 'exited') {
        toRemove.push(vehicle);
        continue;
      }

      // Update wait time for queued vehicles
      if (vehicle.state === 'queued') {
        vehicle.waitTime += deltaTime / 1000;  // Convert to seconds
      }

      // Determine if vehicle should move
      const lightState = gameState.lights[vehicle.direction].state;
      const pathClear = this.isPathClear(vehicle, gameState);
      const atIntersection = vehicle.shouldStopAtIntersection();
      const inIntersection = vehicle.isInIntersection();

      // Vehicle state machine
      if (vehicle.state === 'queued') {
        // Waiting at intersection - start IMMEDIATELY when green (no safety check!)
        // This makes crashes happen when player doesn't wait for intersection to clear
        if (lightState === 'green') {
          vehicle.state = 'moving';
          vehicle.targetSpeed = Config.vehicleMaxSpeed;
          this.accelerate(vehicle);
        } else {
          // Stay stopped
          vehicle.targetSpeed = 0;
          this.decelerate(vehicle);
        }
      } else if (vehicle.state === 'moving') {
        // Already moving
        if (inIntersection || !atIntersection) {
          // Inside intersection OR past the stop zone - keep moving regardless of light
          if (pathClear) {
            vehicle.targetSpeed = Config.vehicleMaxSpeed;
            this.accelerate(vehicle);
          } else {
            // Obstacle ahead
            vehicle.targetSpeed = 0;
            this.decelerate(vehicle);
          }
        } else if (atIntersection) {
          // Approaching intersection - check light
          if (lightState === 'green' && pathClear) {
            // Green light - go!
            vehicle.targetSpeed = Config.vehicleMaxSpeed;
            this.accelerate(vehicle);
          } else {
            // Red light or blocked - stop and change state
            vehicle.state = 'queued';
            vehicle.targetSpeed = 0;
            this.decelerate(vehicle);
          }
        }
      }

      // Update position
      this.updatePosition(vehicle, deltaTime);

      // Check if exited map
      if (vehicle.hasExitedMap()) {
        vehicle.state = 'exited';
        toRemove.push(vehicle);
      }
    }

    // Remove exited vehicles
    for (let vehicle of toRemove) {
      const index = gameState.vehicles.indexOf(vehicle);
      if (index !== -1) {
        gameState.vehicles.splice(index, 1);
      }
    }
  }

  isPathClear(vehicle, gameState) {
    // Check if crashed vehicles blocking path
    if (gameState.crashedVehicles.length > 0) {
      for (let crashed of gameState.crashedVehicles) {
        if (this.isVehicleAhead(vehicle, crashed)) {
          return false;  // Blocked!
        }
      }
    }

    // Check if other vehicles ahead in same direction
    for (let other of gameState.vehicles) {
      if (other.id === vehicle.id) continue;
      if (other.direction !== vehicle.direction) continue;
      if (other.crashed) continue;

      if (this.isVehicleAhead(vehicle, other)) {
        return false;  // Vehicle ahead
      }
    }

    return true;
  }

  isVehicleAhead(vehicle, other) {
    const distance = this.getDistanceInDirection(vehicle, other);
    return distance > 0 && distance < Config.vehicleSafeDistance;
  }

  getDistanceInDirection(vehicle, other) {
    // Calculate distance in direction of travel
    switch (vehicle.direction) {
      case 'north':  // Moving down (positive y)
        return other.y - vehicle.y;
      case 'south':  // Moving up (negative y)
        return vehicle.y - other.y;
      case 'east':   // Moving left (negative x)
        return vehicle.x - other.x;
      case 'west':   // Moving right (positive x)
        return other.x - vehicle.x;
    }
    return Infinity;
  }

  accelerate(vehicle) {
    vehicle.speed = Math.min(
      vehicle.speed + Config.vehicleAcceleration,
      vehicle.targetSpeed
    );
  }

  decelerate(vehicle) {
    vehicle.speed = Math.max(
      vehicle.speed - Config.vehicleDeceleration,
      0
    );
  }

  updatePosition(vehicle, deltaTime) {
    const frameSpeed = vehicle.speed * (deltaTime / 16.67);  // Normalize to 60fps

    switch (vehicle.direction) {
      case 'north':
        vehicle.y += frameSpeed;
        break;
      case 'south':
        vehicle.y -= frameSpeed;
        break;
      case 'east':
        vehicle.x -= frameSpeed;
        break;
      case 'west':
        vehicle.x += frameSpeed;
        break;
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// TRAFFIC LIGHT MANAGER
// ───────────────────────────────────────────────────────────────────────────────

class TrafficLightManager {
  setGreenLights(directions, gameState) {
    // Validate input
    if (!Array.isArray(directions)) {
      console.error('TrafficLightManager: directions must be an array');
      directions = [];
    }

    // NO AUTOMATIC SAFETY CHECKS!
    // Player must implement their own safety logic
    // This is intentional for educational purposes

    // Set lights
    const validDirections = ['north', 'south', 'east', 'west'];
    for (let dir of validDirections) {
      if (directions.includes(dir)) {
        gameState.lights[dir].state = 'green';
      } else {
        gameState.lights[dir].state = 'red';
      }
    }
  }

  // Helper function exposed to player via global scope
  isIntersectionSafe(gameState, directions) {
    // Check if any crashed vehicles blocking
    if (gameState.crashedVehicles.length > 0) {
      return false;
    }

    // Check if vehicles from other directions in intersection
    for (let vehicle of gameState.vehicles) {
      if (vehicle.crashed) continue;
      if (vehicle.state !== 'moving') continue;
      if (!vehicle.isInIntersection()) continue;

      // If this vehicle's direction is not in new directions, unsafe
      if (!directions.includes(vehicle.direction)) {
        return false;
      }
    }

    // Check for conflicting directions
    // North/South are parallel - can both be green safely!
    // East/West are parallel - can both be green safely!
    // But North+East, North+West, South+East, South+West = CONFLICT
    for (let i = 0; i < directions.length; i++) {
      for (let j = i + 1; j < directions.length; j++) {
        const dir1 = directions[i];
        const dir2 = directions[j];

        // Parallel directions are OK
        if ((dir1 === 'north' && dir2 === 'south') || (dir1 === 'south' && dir2 === 'north')) {
          continue;  // OK - parallel
        }
        if ((dir1 === 'east' && dir2 === 'west') || (dir1 === 'west' && dir2 === 'east')) {
          continue;  // OK - parallel
        }

        // Any other combination = conflict
        return false;
      }
    }

    return true;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// SCORING MANAGER
// ───────────────────────────────────────────────────────────────────────────────

class ScoringManager {
  constructor() {
    this.lastScoreUpdate = Date.now();
  }

  updateScore(gameState) {
    const now = Date.now();
    const timeSinceUpdate = now - this.lastScoreUpdate;

    if (timeSinceUpdate < Config.scoreUpdateInterval) return;

    let totalDeduction = 0;

    // Penalize waiting vehicles
    for (let vehicle of gameState.vehicles) {
      if (vehicle.state === 'queued' || vehicle.crashed) {
        const penalty = this.calculatePenalty(vehicle);
        totalDeduction += penalty;
      }
    }

    gameState.score = Math.max(0, gameState.score - totalDeduction);

    if (gameState.score <= 0 && gameState.isRunning) {
      gameState.isRunning = false;
      console.log('💀 GAME OVER: Score reached zero!');
    }

    this.lastScoreUpdate = now;
  }

  calculatePenalty(vehicle) {
    const baseWeight = Config.waitWeights[vehicle.type];
    let penalty = baseWeight * Config.baseDeduction;

    // Crashed vehicles are extra expensive (they block everything!)
    if (vehicle.crashed) {
      penalty *= Config.crashedVehiclePenalty;
    }

    return penalty;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// RENDERER
// ───────────────────────────────────────────────────────────────────────────────

class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  render(gameState) {
    this.clear();
    this.drawRoads();
    this.drawIntersection();
    this.drawTrafficLights(gameState);
    this.drawVehicles(gameState);
    this.drawUI(gameState);

    if (!gameState.isRunning) {
      this.drawGameOver(gameState);
    }
  }

  clear() {
    this.ctx.fillStyle = '#2a2a2a';  // Dark background
    this.ctx.fillRect(0, 0, Config.canvasWidth, Config.canvasHeight);
  }

  drawRoads() {
    const ctx = this.ctx;
    const centerX = Config.canvasWidth / 2;
    const centerY = Config.canvasHeight / 2;
    const roadWidth = Config.roadWidth;

    // Road color
    ctx.fillStyle = '#444';

    // Vertical road (north-south)
    ctx.fillRect(centerX - roadWidth / 2, 0, roadWidth, Config.canvasHeight);

    // Horizontal road (east-west)
    ctx.fillRect(0, centerY - roadWidth / 2, Config.canvasWidth, roadWidth);

    // Lane markings
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 10]);

    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, Config.canvasHeight);
    ctx.stroke();

    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(Config.canvasWidth, centerY);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  drawIntersection() {
    const ctx = this.ctx;

    // Intersection square
    ctx.fillStyle = '#555';
    ctx.fillRect(
      Config.intersectionLeft,
      Config.intersectionTop,
      Config.intersectionSize,
      Config.intersectionSize
    );

    // Intersection border
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      Config.intersectionLeft,
      Config.intersectionTop,
      Config.intersectionSize,
      Config.intersectionSize
    );
  }

  drawTrafficLights(gameState) {
    const ctx = this.ctx;
    const size = 20;
    // Position traffic lights OUTSIDE intersection, before stop line
    const positions = {
      north: { x: 360, y: 270 },   // Left side of north lane
      south: { x: 440, y: 530 },   // Right side of south lane
      east: { x: 530, y: 440 },    // Bottom of east lane
      west: { x: 270, y: 360 }     // Top of west lane
    };

    for (let dir of ['north', 'south', 'east', 'west']) {
      const pos = positions[dir];
      const state = gameState.lights[dir].state;

      // Light housing
      ctx.fillStyle = '#222';
      ctx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.strokeRect(pos.x - size / 2, pos.y - size / 2, size, size);

      // Light color
      ctx.fillStyle = state === 'green' ? '#00ff00' : '#ff0000';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size / 3, 0, Math.PI * 2);
      ctx.fill();

      // Glow effect
      if (state === 'green') {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff00';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  drawVehicles(gameState) {
    const ctx = this.ctx;

    for (let vehicle of gameState.vehicles) {
      if (vehicle.state === 'exited') continue;

      ctx.save();
      ctx.translate(vehicle.x, vehicle.y);

      // Vehicle dimensions
      const width = Config.vehicleWidth;
      const height = Config.vehicleHeight;

      if (vehicle.crashed) {
        // Crashed vehicle - darker, rotated
        ctx.rotate(vehicle.angle + vehicle.rotation);
        this.drawCarForDirection(ctx, vehicle.direction, width, height, this.getVehicleColor(vehicle.type, true), true, vehicle.type);

        // Crash indicator (X mark)
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-width / 4, -height / 4);
        ctx.lineTo(width / 4, height / 4);
        ctx.moveTo(width / 4, -height / 4);
        ctx.lineTo(-width / 4, height / 4);
        ctx.stroke();
      } else {
        // Normal vehicle - NO ROTATION, draw specific to direction
        this.drawCarForDirection(ctx, vehicle.direction, width, height, this.getVehicleColor(vehicle.type, false), false, vehicle.type);
      }

      ctx.restore();
    }
  }

  drawCarForDirection(ctx, direction, width, height, color, crashed, type) {
    // Draw car specific to each direction - NO ROTATION
    if (direction === 'north') {
      this.drawCarNorth(ctx, width, height, color, crashed, type);
    } else if (direction === 'south') {
      this.drawCarSouth(ctx, width, height, color, crashed, type);
    } else if (direction === 'east') {
      this.drawCarEast(ctx, width, height, color, crashed, type);
    } else if (direction === 'west') {
      this.drawCarWest(ctx, width, height, color, crashed, type);
    }
  }

  // NORTH: Moving DOWN (front at bottom, back at top)
  drawCarNorth(ctx, width, height, color, crashed, type) {
    ctx.fillStyle = color;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeStyle = crashed ? '#333' : '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    if (!crashed) {
      // Front windshield (moving down, so front is at BOTTOM)
      ctx.fillStyle = 'rgba(100, 150, 200, 0.6)';
      ctx.fillRect(-width / 2 + 4, height / 2 - height / 3 + 1, width - 8, height / 3 - 3);
      // Rear windshield (back at TOP)
      ctx.fillStyle = 'rgba(80, 120, 180, 0.4)';
      ctx.fillRect(-width / 2 + 4, -height / 2 + 4, width - 8, height / 3 - 3);
      // Headlights (BOTTOM)
      ctx.fillStyle = '#ffff66';
      ctx.fillRect(-width / 2 + 6, height / 2 - 4, 6, 3);
      ctx.fillRect(width / 2 - 12, height / 2 - 4, 6, 3);
      // Tail lights (TOP)
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(-width / 2 + 6, -height / 2 + 1, 6, 3);
      ctx.fillRect(width / 2 - 12, -height / 2 + 1, 6, 3);
      // Type indicator
      this.drawTypeIndicator(ctx, type, 0, -8);
    }
  }

  // SOUTH: Moving UP (front at top, back at bottom)
  drawCarSouth(ctx, width, height, color, crashed, type) {
    ctx.fillStyle = color;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeStyle = crashed ? '#333' : '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    if (!crashed) {
      // Front windshield (moving up, so front is at TOP)
      ctx.fillStyle = 'rgba(100, 150, 200, 0.6)';
      ctx.fillRect(-width / 2 + 4, -height / 2 + 4, width - 8, height / 3 - 3);
      // Rear windshield (back at BOTTOM)
      ctx.fillStyle = 'rgba(80, 120, 180, 0.4)';
      ctx.fillRect(-width / 2 + 4, height / 2 - height / 3 + 1, width - 8, height / 3 - 3);
      // Headlights (TOP)
      ctx.fillStyle = '#ffff66';
      ctx.fillRect(-width / 2 + 6, -height / 2 + 1, 6, 3);
      ctx.fillRect(width / 2 - 12, -height / 2 + 1, 6, 3);
      // Tail lights (BOTTOM)
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(-width / 2 + 6, height / 2 - 4, 6, 3);
      ctx.fillRect(width / 2 - 12, height / 2 - 4, 6, 3);
      // Type indicator
      this.drawTypeIndicator(ctx, type, 0, -8);
    }
  }

  // EAST: Moving LEFT (front at left, back at right)
  drawCarEast(ctx, width, height, color, crashed, type) {
    ctx.fillStyle = color;
    ctx.fillRect(-height / 2, -width / 2, height, width);
    ctx.strokeStyle = crashed ? '#333' : '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-height / 2, -width / 2, height, width);

    if (!crashed) {
      // Front windshield (moving left, so front is at LEFT)
      ctx.fillStyle = 'rgba(100, 150, 200, 0.6)';
      ctx.fillRect(-height / 2 + 4, -width / 2 + 4, height / 3 - 3, width - 8);
      // Rear windshield (back at RIGHT)
      ctx.fillStyle = 'rgba(80, 120, 180, 0.4)';
      ctx.fillRect(height / 2 - height / 3 + 1, -width / 2 + 4, height / 3 - 3, width - 8);
      // Headlights (LEFT)
      ctx.fillStyle = '#ffff66';
      ctx.fillRect(-height / 2 + 1, -width / 2 + 6, 3, 6);
      ctx.fillRect(-height / 2 + 1, width / 2 - 12, 3, 6);
      // Tail lights (RIGHT)
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(height / 2 - 4, -width / 2 + 6, 3, 6);
      ctx.fillRect(height / 2 - 4, width / 2 - 12, 3, 6);
      // Type indicator
      this.drawTypeIndicator(ctx, type, -8, 0);
    }
  }

  // WEST: Moving RIGHT (front at right, back at left)
  drawCarWest(ctx, width, height, color, crashed, type) {
    ctx.fillStyle = color;
    ctx.fillRect(-height / 2, -width / 2, height, width);
    ctx.strokeStyle = crashed ? '#333' : '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-height / 2, -width / 2, height, width);

    if (!crashed) {
      // Front windshield (moving right, so front is at RIGHT)
      ctx.fillStyle = 'rgba(100, 150, 200, 0.6)';
      ctx.fillRect(height / 2 - height / 3 + 1, -width / 2 + 4, height / 3 - 3, width - 8);
      // Rear windshield (back at LEFT)
      ctx.fillStyle = 'rgba(80, 120, 180, 0.4)';
      ctx.fillRect(-height / 2 + 4, -width / 2 + 4, height / 3 - 3, width - 8);
      // Headlights (RIGHT)
      ctx.fillStyle = '#ffff66';
      ctx.fillRect(height / 2 - 4, -width / 2 + 6, 3, 6);
      ctx.fillRect(height / 2 - 4, width / 2 - 12, 3, 6);
      // Tail lights (LEFT)
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(-height / 2 + 1, -width / 2 + 6, 3, 6);
      ctx.fillRect(-height / 2 + 1, width / 2 - 12, 3, 6);
      // Type indicator
      this.drawTypeIndicator(ctx, type, 8, 0);
    }
  }

  drawTypeIndicator(ctx, type, offsetX, offsetY) {
    if (type === 'ambulance') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(offsetX - 3, offsetY - 8, 6, 16);
      ctx.fillRect(offsetX - 8, offsetY - 3, 16, 6);
    } else if (type === 'police') {
      ctx.fillStyle = '#00f';
      ctx.fillRect(offsetX - 8, offsetY - 12, 6, 4);
      ctx.fillStyle = '#f00';
      ctx.fillRect(offsetX + 2, offsetY - 12, 6, 4);
    } else if (type === 'government') {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(offsetX - 6, offsetY - 12, 10, 6);
    }
  }

  getVehicleColor(type, crashed) {
    const colors = {
      regular: crashed ? '#555' : '#888',
      ambulance: crashed ? '#660000' : '#ff0000',
      police: crashed ? '#000044' : '#0044ff',
      government: crashed ? '#111' : '#000'
    };
    return colors[type] || colors.regular;
  }

  drawUI(gameState) {
    const ctx = this.ctx;

    // Background panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, Config.canvasWidth, 60);

    // Score
    ctx.fillStyle = gameState.score > 500 ? '#00ff00' : (gameState.score > 200 ? '#ffaa00' : '#ff0000');
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${Math.round(gameState.score)}`, 20, 35);

    // Time
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    const minutes = Math.floor(gameState.timeElapsed / 60);
    const seconds = Math.floor(gameState.timeElapsed % 60);
    ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, 250, 35);

    // Crashes
    if (gameState.totalCrashes > 0) {
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`💥 Crashes: ${gameState.totalCrashes}`, 450, 35);
    }

    // Warning if intersection blocked
    if (gameState.hasActiveCrashes) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('⚠️ INTERSECTION BLOCKED ⚠️', 250, 750);
    }

    // Detailed queue indicators with vehicle type breakdown (positioned in BLACK areas, NOT on roads)
    // Roads are x=200-600, y=200-600. Stay OUTSIDE these ranges!
    this.drawQueueIndicator(ctx, gameState, 'north', 250, 70);   // North - move left
    this.drawQueueIndicator(ctx, gameState, 'south', 410, 650);  // South - move right
    this.drawQueueIndicator(ctx, gameState, 'east', 640, 320);   // East - move north (up)
    this.drawQueueIndicator(ctx, gameState, 'west', 20, 480);    // West - move south (down)
  }

  drawQueueIndicator(ctx, gameState, direction, x, y) {
    const queue = gameState.queues[direction];

    // Count by type
    const counts = {
      ambulance: 0,
      police: 0,
      government: 0,
      regular: 0
    };

    let totalPenalty = 0;
    for (let vehicle of queue) {
      counts[vehicle.type]++;
      // Calculate penalty this queue is costing
      const weight = Config.waitWeights[vehicle.type];
      totalPenalty += weight * Config.baseDeduction * 10; // per second
    }

    // Calculate penalty for all vehicles in this direction (including moving)
    for (let vehicle of gameState.vehicles) {
      if (vehicle.direction === direction && vehicle.state === 'queued') {
        const weight = Config.waitWeights[vehicle.type];
        totalPenalty += weight * Config.baseDeduction * 10;
      }
    }

    // Determine urgency level (visual indicator without giving rules)
    const urgency = totalPenalty > 5 ? 'critical' : totalPenalty > 2 ? 'high' : totalPenalty > 0.5 ? 'medium' : 'low';

    // Background box with urgency color
    const boxWidth = 140;
    const boxHeight = 70;

    // Color based on urgency (visual feedback!)
    let bgColor;
    if (urgency === 'critical') {
      bgColor = 'rgba(255, 0, 0, 0.7)';  // Red - critical!
    } else if (urgency === 'high') {
      bgColor = 'rgba(255, 140, 0, 0.7)'; // Orange - urgent
    } else if (urgency === 'medium') {
      bgColor = 'rgba(255, 255, 0, 0.6)'; // Yellow - attention
    } else {
      bgColor = 'rgba(0, 100, 0, 0.5)';   // Green - ok
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, boxWidth, boxHeight);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    // Direction label
    const dirLabel = {
      north: '↓ NORTH',
      south: '↑ SOUTH',
      east: '← EAST',
      west: '→ WEST'
    };
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(dirLabel[direction], x + 5, y + 16);

    // Total count
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Total: ${queue.length}`, x + 5, y + 35);

    // Vehicle type breakdown (small icons/text)
    ctx.font = '11px Arial';
    let yOffset = y + 50;

    if (counts.ambulance > 0) {
      ctx.fillStyle = '#ff0000';
      ctx.fillText(`🚑 ${counts.ambulance}`, x + 5, yOffset);
    }
    if (counts.police > 0) {
      ctx.fillStyle = '#4444ff';
      ctx.fillText(`🚓 ${counts.police}`, x + 45, yOffset);
    }
    if (counts.government > 0) {
      ctx.fillStyle = '#ffdd00';
      ctx.fillText(`🏛️ ${counts.government}`, x + 85, yOffset);
    }
    yOffset += 14;
    if (counts.regular > 0) {
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText(`🚗 ${counts.regular}`, x + 5, yOffset);
    }

    ctx.textAlign = 'left';
  }

  drawGameOver(gameState) {
    const ctx = this.ctx;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, Config.canvasWidth, Config.canvasHeight);

    // Game over text
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', Config.canvasWidth / 2, 200);

    // Stats
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    const minutes = Math.floor(gameState.timeElapsed / 60);
    const seconds = Math.floor(gameState.timeElapsed % 60);
    ctx.fillText(`Time Survived: ${minutes}:${seconds.toString().padStart(2, '0')}`, Config.canvasWidth / 2, 280);
    ctx.fillText(`Total Crashes: ${gameState.totalCrashes}`, Config.canvasWidth / 2, 320);

    // Crash breakdown
    ctx.font = '18px Arial';
    let y = 370;
    if (gameState.crashesByType.ambulance > 0) {
      ctx.fillStyle = '#ff0000';
      ctx.fillText(`🚑 Ambulance crashes: ${gameState.crashesByType.ambulance} (FATAL!)`, Config.canvasWidth / 2, y);
      y += 30;
    }
    ctx.fillStyle = '#fff';
    if (gameState.crashesByType.police > 0) {
      ctx.fillText(`🚓 Police crashes: ${gameState.crashesByType.police}`, Config.canvasWidth / 2, y);
      y += 30;
    }
    if (gameState.crashesByType.government > 0) {
      ctx.fillText(`🏛️ Government crashes: ${gameState.crashesByType.government}`, Config.canvasWidth / 2, y);
      y += 30;
    }
    if (gameState.crashesByType.regular > 0) {
      ctx.fillText(`🚗 Regular crashes: ${gameState.crashesByType.regular}`, Config.canvasWidth / 2, y);
      y += 30;
    }

    // Restart instruction
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Refresh page to try again', Config.canvasWidth / 2, Config.canvasHeight - 80);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Edit player.js to improve your algorithm!', Config.canvasWidth / 2, Config.canvasHeight - 50);

    ctx.textAlign = 'left';
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// MAIN GAME ENGINE
// ───────────────────────────────────────────────────────────────────────────────

class TrafficGameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    this.canvas.width = Config.canvasWidth;
    this.canvas.height = Config.canvasHeight;

    this.gameState = new GameState();
    this.crashDetector = new CrashDetectionManager();
    this.vehicleManager = new VehicleManager();
    this.lightManager = new TrafficLightManager();
    this.scoringManager = new ScoringManager();
    this.renderer = new Renderer(this.ctx);

    this.lastFrameTime = Date.now();

    // Expose helper function to global scope for player
    window.isIntersectionSafe = (directions) => {
      return this.lightManager.isIntersectionSafe(this.gameState, directions);
    };

    this.start();
  }

  start() {
    console.log('🚦 Traffic Controller Game Started!');
    console.log('Edit player.js to control the traffic lights.');
    console.log('WARNING: Ambulance crashes = instant game over!');
    this.gameLoop();
  }

  gameLoop() {
    const now = Date.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    if (this.gameState.isRunning) {
      this.update(deltaTime);
    }

    this.renderer.render(this.gameState);

    requestAnimationFrame(() => this.gameLoop());
  }

  update(deltaTime) {
    // Update elapsed time
    this.gameState.elapsedTime = (Date.now() - this.gameState.startTime);
    this.gameState.timeElapsed = this.gameState.elapsedTime / 1000;  // For player API

    // Spawn vehicles
    const currentTime = Date.now();
    this.vehicleManager.spawnVehicle('north', currentTime, this.gameState);
    this.vehicleManager.spawnVehicle('south', currentTime, this.gameState);
    this.vehicleManager.spawnVehicle('east', currentTime, this.gameState);
    this.vehicleManager.spawnVehicle('west', currentTime, this.gameState);

    // Update queues (for player API)
    this.gameState.updateQueues();

    // Call player code
    try {
      const playerDirections = controlTraffic(this.gameState);
      this.lightManager.setGreenLights(playerDirections, this.gameState);
    } catch (error) {
      console.error('Player code error:', error);
      // Fail-safe: all red
      this.lightManager.setGreenLights([], this.gameState);
    }

    // Update vehicles
    this.vehicleManager.updateVehicles(deltaTime, this.gameState);

    // CRASH DETECTION (critical!)
    this.crashDetector.checkForCrashes(this.gameState);

    // Update score
    this.scoringManager.updateScore(this.gameState);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// INITIALIZE GAME ON LOAD
// ───────────────────────────────────────────────────────────────────────────────

window.addEventListener('load', () => {
  new TrafficGameEngine('gameCanvas');
});
