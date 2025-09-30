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
  // Safety first
  if (gameState.hasActiveCrashes) {
    return [];
  }

  // Check for ambulances first (highest priority)
  for (let dir of ['north', 'south', 'east', 'west']) {
    for (let vehicle of gameState.queues[dir]) {
      if (vehicle.type === 'ambulance') {
        if (isIntersectionSafe([dir])) {
          return [dir];
        }
      }
    }
  }

  // Count pedestrians in each direction
  const pedestrianCounts = {
    north: 0,
    south: 0,
    east: 0,
    west: 0
  };

  if (gameState.pedestrians) {
    for (let ped of gameState.pedestrians) {
      if (ped.state === 'crossing' || ped.state === 'queued') {
        pedestrianCounts[ped.direction]++;
      }
    }
  }

  // Find direction with most pedestrians
  let maxPedestrians = -1;
  let priorityDir = null;

  for (let dir of ['north', 'south', 'east', 'west']) {
    if (pedestrianCounts[dir] > maxPedestrians) {
      maxPedestrians = pedestrianCounts[dir];
      priorityDir = dir;
    }
  }

  // If pedestrians waiting, give them priority
  if (maxPedestrians > 0 && priorityDir && isIntersectionSafe([priorityDir])) {
    return [priorityDir];
  }

  // Count police cars in each direction
  const policeCounts = {
    north: 0,
    south: 0,
    east: 0,
    west: 0
  };

  for (let dir of ['north', 'south', 'east', 'west']) {
    for (let vehicle of gameState.queues[dir]) {
      if (vehicle.type === 'police') {
        policeCounts[dir]++;
      }
    }
  }

  // Find direction with most police
  let maxPolice = -1;
  priorityDir = null;

  for (let dir of ['north', 'south', 'east', 'west']) {
    if (policeCounts[dir] > maxPolice) {
      maxPolice = policeCounts[dir];
      priorityDir = dir;
    }
  }

  // If no police cars anywhere, use total cars
  if (maxPolice === 0) {
    let maxTotal = -1;
    for (let dir of ['north', 'south', 'east', 'west']) {
      const total = gameState.queues[dir].length;
      if (total > maxTotal) {
        maxTotal = total;
        priorityDir = dir;
      }
    }
  }

  // Give priority direction green light
  if (priorityDir && isIntersectionSafe([priorityDir])) {
    return [priorityDir];
  }

  return [];
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
