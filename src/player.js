// ═══════════════════════════════════════════════════════════════════════════════
// YOUR TRAFFIC CONTROL CODE
//
// This is where YOU write your algorithm to control the traffic lights!
// Read README.md for full API documentation.
//
// ⚠️  WARNING: Crashes happen! Be careful with your light changes.
//     Ambulance crashes = instant game over!
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Main traffic control function
 * Called 60 times per second to determine which traffic lights should be green
 *
 * @param {Object} gameState - Current game state with all information you need
 * @returns {Array<string>} - Array of directions to set to GREEN
 *                            Valid: ['north'], ['south'], ['east'], ['west']
 *                            Can return empty array [] for all red
 */
function controlTraffic(gameState) {
  // ─────────────────────────────────────────────────────────────────────────
  // AVAILABLE DATA (check README.md for details):
  // ─────────────────────────────────────────────────────────────────────────
  //
  // gameState.score              - Your current points
  // gameState.timeElapsed        - Seconds since game started
  // gameState.totalCrashes       - Total crashes so far
  // gameState.hasActiveCrashes   - true if intersection is blocked
  //
  // gameState.queues.north       - Array of vehicles waiting from north
  // gameState.queues.south       - Array of vehicles waiting from south
  // gameState.queues.east        - Array of vehicles waiting from east
  // gameState.queues.west        - Array of vehicles waiting from west
  //
  // gameState.lights.north.state - 'red' or 'green'
  // gameState.lights.south.state - 'red' or 'green'
  // gameState.lights.east.state  - 'red' or 'green'
  // gameState.lights.west.state  - 'red' or 'green'
  //
  // Each vehicle in queue has:
  //   vehicle.type      - 'regular', 'ambulance', 'police', 'government'
  //   vehicle.waitTime  - Seconds waiting
  //   vehicle.state     - 'queued', 'moving', 'crashed'
  //
  // HELPER FUNCTION:
  //   isIntersectionSafe(directions) - Returns true if safe to change lights
  //
  // ─────────────────────────────────────────────────────────────────────────

  // ═════════════════════════════════════════════════════════════════════════
  // YOUR CODE BELOW - Start simple and improve over time!
  // ═════════════════════════════════════════════════════════════════════════

  // LEVEL 1: Simple round-robin (will crash if you don't wait for intersection!)
  const directions = ['north', 'south', 'east', 'west'];
  const seconds = Math.floor(gameState.timeElapsed / 3);  // Change every 3 seconds
  const index = seconds % 4;
  return [directions[index]];

  // ═════════════════════════════════════════════════════════════════════════
  // TRY THESE IMPROVEMENTS:
  // ═════════════════════════════════════════════════════════════════════════

  // 1. Check for active crashes first!
  //    if (gameState.hasActiveCrashes) return [];

  // 2. Use isIntersectionSafe() before changing lights
  //    if (isIntersectionSafe([direction])) return [direction];

  // 3. Prioritize emergency vehicles
  //    Check if first vehicle in queue is type 'ambulance' or 'police'

  // 4. Consider wait times
  //    Longer wait time = higher urgency

  // 5. Balance between directions
  //    Don't leave one direction waiting forever!

  // ═════════════════════════════════════════════════════════════════════════
  // EXAMPLE: Level 3 - Safe Round Robin (uncomment to use)
  // ═════════════════════════════════════════════════════════════════════════

  /*
  // Safety first!
  if (gameState.hasActiveCrashes) {
    return [];  // Don't change lights if crashed vehicles blocking
  }

  // Round robin through directions
  const directions = ['north', 'south', 'east', 'west'];
  const seconds = Math.floor(gameState.timeElapsed / 3);
  const index = seconds % 4;
  const nextDirection = directions[index];

  // Only change if safe!
  if (isIntersectionSafe([nextDirection])) {
    return [nextDirection];
  }

  return [];  // Wait for intersection to clear
  */

  // ═════════════════════════════════════════════════════════════════════════
  // EXAMPLE: Level 4 - Priority System (uncomment to use)
  // ═════════════════════════════════════════════════════════════════════════

  /*
  // Safety check
  if (gameState.hasActiveCrashes) return [];

  const directions = ['north', 'south', 'east', 'west'];

  // Check for AMBULANCES (highest priority!)
  for (let dir of directions) {
    const queue = gameState.queues[dir];
    if (queue.length > 0 && queue[0].type === 'ambulance') {
      if (isIntersectionSafe([dir])) {
        return [dir];
      }
    }
  }

  // Check for POLICE
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
  */

  // ═════════════════════════════════════════════════════════════════════════
  // EXAMPLE: Level 5 - Advanced Urgency (uncomment to use)
  // ═════════════════════════════════════════════════════════════════════════

  /*
  // Safety first
  if (gameState.hasActiveCrashes) return [];

  const directions = ['north', 'south', 'east', 'west'];
  let mostUrgent = null;
  let highestUrgency = -1;

  // Calculate urgency score for each direction
  for (let dir of directions) {
    const queue = gameState.queues[dir];
    if (queue.length === 0) continue;

    let urgency = 0;

    // Sum urgency for all vehicles in queue
    for (let vehicle of queue) {
      let score = vehicle.waitTime;  // Base: wait time in seconds

      // Multiply by vehicle type importance
      if (vehicle.type === 'ambulance') score *= 10;
      else if (vehicle.type === 'police') score *= 5;
      else if (vehicle.type === 'government') score *= 2;
      // regular = 1x (no multiplier)

      urgency += score;
    }

    // Track most urgent
    if (urgency > highestUrgency) {
      highestUrgency = urgency;
      mostUrgent = dir;
    }
  }

  // Let most urgent direction go
  if (mostUrgent && isIntersectionSafe([mostUrgent])) {
    return [mostUrgent];
  }

  return [];
  */

  // ═════════════════════════════════════════════════════════════════════════
  // YOUR CUSTOM CODE HERE!
  // ═════════════════════════════════════════════════════════════════════════

  // ... write your own algorithm ...
}

// ═══════════════════════════════════════════════════════════════════════════
// TIPS:
// ═══════════════════════════════════════════════════════════════════════════
//
// 1. Start simple! Test with Level 1, see what happens.
// 2. Learn from crashes - they teach you about safety.
// 3. Use console.log() to debug:
//    console.log('North queue:', gameState.queues.north.length);
// 4. Check browser console (F12) for errors and warnings.
// 5. Refresh page after editing this file to test changes.
// 6. Read README.md for complete documentation!
//
// REMEMBER: Ambulance crashes = instant game over! Always prioritize them!
//
// Good luck, Traffic Controller! 🚦
// ═══════════════════════════════════════════════════════════════════════════
