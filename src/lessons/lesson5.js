// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 5: Building a Complete Priority Algorithm
// ═══════════════════════════════════════════════════════════════════════════════
//
// In this final lesson, you'll combine everything to create a smart algorithm!
//
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * LESSON 5: Putting It All Together
 *
 * Now that you understand the API, let's build a complete traffic controller
 * that handles all the different priorities and edge cases.
 */
function controlTraffic(gameState) {
  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1: Safety First - Check for Active Crashes
  // ─────────────────────────────────────────────────────────────────────────────

  // Never change lights if there are crashed vehicles blocking the intersection
  if (gameState.hasActiveCrashes) {
    console.log('Intersection blocked by crashes - keeping all lights red');
    return [];  // All red until crashes clear
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2: Highest Priority - Ambulances
  // ─────────────────────────────────────────────────────────────────────────────

  // Ambulance crashes = instant game over, so they get absolute priority!
  for (let dir of ['north', 'south', 'east', 'west']) {
    const queue = gameState.queues[dir];

    // Check if any vehicle in this queue is an ambulance
    for (let vehicle of queue) {
      if (vehicle.type === 'ambulance') {
        console.log(`AMBULANCE in ${dir} queue - giving priority!`);

        // Only open if safe
        if (isIntersectionSafe([dir])) {
          return [dir];
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 3: High Priority - Pedestrians
  // ─────────────────────────────────────────────────────────────────────────────

  // Hitting pedestrians costs 600 points, so prioritize them
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
  let maxPedestrians = 0;
  let pedDirection = null;

  for (let dir of ['north', 'south', 'east', 'west']) {
    if (pedestrianCounts[dir] > maxPedestrians) {
      maxPedestrians = pedestrianCounts[dir];
      pedDirection = dir;
    }
  }

  if (maxPedestrians > 0 && pedDirection) {
    console.log(`${maxPedestrians} pedestrian(s) in ${pedDirection} - giving priority!`);

    if (isIntersectionSafe([pedDirection])) {
      return [pedDirection];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 4: Medium Priority - Police Cars
  // ─────────────────────────────────────────────────────────────────────────────

  // Police crashes cost 950 points, so give them priority
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
  let maxPolice = 0;
  let policeDirection = null;

  for (let dir of ['north', 'south', 'east', 'west']) {
    if (policeCounts[dir] > maxPolice) {
      maxPolice = policeCounts[dir];
      policeDirection = dir;
    }
  }

  if (maxPolice > 0 && policeDirection) {
    console.log(`${maxPolice} police car(s) in ${policeDirection} - giving priority!`);

    if (isIntersectionSafe([policeDirection])) {
      return [policeDirection];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 5: Default Priority - Longest Queue
  // ─────────────────────────────────────────────────────────────────────────────

  // If no special vehicles, prioritize the direction with the most waiting cars
  let maxQueueLength = 0;
  let busiestDirection = null;

  for (let dir of ['north', 'south', 'east', 'west']) {
    const queueLength = gameState.queues[dir].length;

    if (queueLength > maxQueueLength) {
      maxQueueLength = queueLength;
      busiestDirection = dir;
    }
  }

  if (busiestDirection) {
    console.log(`${busiestDirection} has longest queue (${maxQueueLength}) - giving priority!`);

    if (isIntersectionSafe([busiestDirection])) {
      return [busiestDirection];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 6: Fallback - Rotate Randomly
  // ─────────────────────────────────────────────────────────────────────────────

  // If nothing else works, rotate every 5 seconds
  const directions = ['north', 'south', 'east', 'west'];
  const seconds = Math.floor(gameState.timeElapsed / 5);
  const randomIndex = (seconds * 7) % 4;
  const fallbackDirection = directions[randomIndex];

  console.log(`Using fallback rotation: ${fallbackDirection}`);

  if (isIntersectionSafe([fallbackDirection])) {
    return [fallbackDirection];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 7: Ultimate Fallback - All Red
  // ─────────────────────────────────────────────────────────────────────────────

  // If nothing is safe, keep all lights red
  console.log('Nothing safe - keeping all red');
  return [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEY TAKEAWAYS - Complete Priority System:
// ═══════════════════════════════════════════════════════════════════════════════
//
// PRIORITY ORDER:
// 1. Active crashes - Keep all red (return [])
// 2. Ambulances - Instant game over if they crash
// 3. Pedestrians - 600 point penalty if hit
// 4. Police - 950 point crash penalty
// 5. Longest queue - Minimize total wait time
// 6. Random rotation - Keep traffic moving
// 7. All red - Safety when nothing else works
//
// ALWAYS use isIntersectionSafe() before returning!
//
// SCORING PENALTIES:
// - Ambulance crash: GAME OVER (Infinity points)
// - Police crash: -950 points
// - Government crash: -400 points
// - Regular crash: -200 points
// - Pedestrian hit: -600 points
// - Waiting vehicles: Continuous small point drain
//
// Now you're ready to write your own custom algorithm!
// Try different strategies and see which one gives you the highest score!
//
// ═══════════════════════════════════════════════════════════════════════════════
