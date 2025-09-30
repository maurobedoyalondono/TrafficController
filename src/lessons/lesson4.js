// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 4: Using the isIntersectionSafe() Helper
// ═══════════════════════════════════════════════════════════════════════════════
//
// In this lesson, you'll learn how to prevent crashes using the built-in safety helper.
//
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * LESSON 4: Crash Prevention with isIntersectionSafe()
 *
 * The game provides a helper function to check if it's safe to change lights.
 * This is CRITICAL to avoid crashes!
 */
function controlTraffic(gameState) {
  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 1: Why Do Crashes Happen?
  // ─────────────────────────────────────────────────────────────────────────────

  // Crashes happen when:
  // 1. Vehicles from perpendicular directions enter the intersection at the same time
  // 2. You change lights while vehicles are still in the intersection
  // 3. Crashed vehicles are blocking the intersection

  // IMPORTANT: Ambulance crashes = INSTANT GAME OVER!

  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 2: The isIntersectionSafe() Function
  // ─────────────────────────────────────────────────────────────────────────────

  // This function checks if it's safe to set specific directions to green
  // Usage: isIntersectionSafe(arrayOfDirections)

  // Example 1: Check if safe to open north
  const safeForNorth = isIntersectionSafe(['north']);
  console.log('Safe to open north?', safeForNorth);

  // Example 2: Check if safe to open both north and south (parallel lanes)
  const safeForNorthSouth = isIntersectionSafe(['north', 'south']);
  console.log('Safe to open north AND south?', safeForNorthSouth);

  // Example 3: Check if safe to open both east and west (parallel lanes)
  const safeForEastWest = isIntersectionSafe(['east', 'west']);
  console.log('Safe to open east AND west?', safeForEastWest);

  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 3: What Does isIntersectionSafe() Check?
  // ─────────────────────────────────────────────────────────────────────────────

  // The function returns FALSE if:
  // 1. There are crashed vehicles blocking the intersection
  // 2. Vehicles from other directions are still in the intersection
  // 3. You're trying to open perpendicular directions (north + east, south + west, etc.)

  // The function returns TRUE if:
  // 1. No crashed vehicles blocking
  // 2. No vehicles from other directions in the intersection
  // 3. Directions are compatible (north+south, east+west, or single direction)

  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 4: Parallel vs Perpendicular Lanes
  // ─────────────────────────────────────────────────────────────────────────────

  // SAFE (parallel lanes - no collision):
  // - North + South (both can be green at the same time)
  // - East + West (both can be green at the same time)

  // UNSAFE (perpendicular lanes - will crash!):
  // - North + East
  // - North + West
  // - South + East
  // - South + West

  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 5: Always Check Before Returning
  // ─────────────────────────────────────────────────────────────────────────────

  // WRONG WAY (will cause crashes):
  // return ['north'];

  // RIGHT WAY (check first):
  if (isIntersectionSafe(['north'])) {
    return ['north'];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // YOUR TASK: Safe Light Switching
  // ─────────────────────────────────────────────────────────────────────────────

  // Let's rotate through directions safely
  const directions = ['north', 'south', 'east', 'west'];
  const seconds = Math.floor(gameState.timeElapsed / 5);
  const index = seconds % 4;
  const chosenDirection = directions[index];

  // ALWAYS check if it's safe first!
  if (isIntersectionSafe([chosenDirection])) {
    console.log(`Opening ${chosenDirection} (safe)`);
    return [chosenDirection];
  } else {
    console.log(`Cannot open ${chosenDirection} (not safe yet)`);
    return [];  // Keep all lights red until safe
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEY TAKEAWAYS:
// ═══════════════════════════════════════════════════════════════════════════════
//
// 1. isIntersectionSafe(directions) - Returns true if safe to change lights
// 2. ALWAYS check safety before returning directions
// 3. Parallel lanes (north+south, east+west) are safe together
// 4. Perpendicular lanes (north+east, etc.) will crash
// 5. Return [] (empty array) to keep all lights red when unsafe
//
// Next lesson: Building a complete priority-based algorithm!
//
// ═══════════════════════════════════════════════════════════════════════════════
