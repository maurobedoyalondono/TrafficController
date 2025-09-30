// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 3: Working with Pedestrians
// ═══════════════════════════════════════════════════════════════════════════════
//
// In this lesson, you'll learn how to handle pedestrians crossing the intersection.
//
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * LESSON 3: Understanding Pedestrians
 *
 * Pedestrians need to cross too! Hitting them costs you 600 points.
 * Let's learn how to detect and prioritize them.
 */
function controlTraffic(gameState) {
  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 1: Accessing Pedestrians
  // ─────────────────────────────────────────────────────────────────────────────

  // The pedestrians array contains all active pedestrians
  if (gameState.pedestrians) {
    console.log('Number of pedestrians:', gameState.pedestrians.length);

    // Loop through all pedestrians
    for (let pedestrian of gameState.pedestrians) {
      console.log('Pedestrian direction:', pedestrian.direction);
      console.log('Pedestrian state:', pedestrian.state);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 2: Pedestrian Properties
  // ─────────────────────────────────────────────────────────────────────────────

  // Each pedestrian has:
  // - direction: 'north', 'south', 'east', or 'west'
  // - state: 'queued', 'crossing', 'hit', or 'exited'
  // - type: pedestrian type (different types for variety)

  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 3: Counting Pedestrians by Direction
  // ─────────────────────────────────────────────────────────────────────────────

  const pedestrianCounts = {
    north: 0,
    south: 0,
    east: 0,
    west: 0
  };

  if (gameState.pedestrians) {
    for (let ped of gameState.pedestrians) {
      // Only count pedestrians that are crossing or waiting
      if (ped.state === 'crossing' || ped.state === 'queued') {
        pedestrianCounts[ped.direction]++;
      }
    }
  }

  console.log('Pedestrians waiting/crossing from north:', pedestrianCounts.north);
  console.log('Pedestrians waiting/crossing from south:', pedestrianCounts.south);
  console.log('Pedestrians waiting/crossing from east:', pedestrianCounts.east);
  console.log('Pedestrians waiting/crossing from west:', pedestrianCounts.west);

  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 4: Prioritizing Pedestrians
  // ─────────────────────────────────────────────────────────────────────────────

  // Find which direction has the most pedestrians
  let maxPedestrians = 0;
  let pedestrianDirection = null;

  for (let dir of ['north', 'south', 'east', 'west']) {
    if (pedestrianCounts[dir] > maxPedestrians) {
      maxPedestrians = pedestrianCounts[dir];
      pedestrianDirection = dir;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // YOUR TASK: Give priority to pedestrians
  // ─────────────────────────────────────────────────────────────────────────────

  // If there are pedestrians waiting, let them cross
  if (pedestrianDirection) {
    console.log(`Giving green light to ${pedestrianDirection} for pedestrians`);
    return [pedestrianDirection];
  }

  // No pedestrians, default to north
  return ['north'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEY TAKEAWAYS:
// ═══════════════════════════════════════════════════════════════════════════════
//
// 1. gameState.pedestrians - Array of all active pedestrians
// 2. pedestrian.direction - Which way they're crossing
// 3. pedestrian.state - 'queued', 'crossing', 'hit', 'exited'
// 4. Hitting pedestrians costs 600 points!
// 5. Count pedestrians by direction to prioritize them
//
// Next lesson: Using the isIntersectionSafe() helper function!
//
// ═══════════════════════════════════════════════════════════════════════════════
