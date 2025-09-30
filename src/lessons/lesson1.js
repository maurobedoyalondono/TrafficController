// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 1: Understanding the Game State
// ═══════════════════════════════════════════════════════════════════════════════
//
// In this lesson, you'll learn what data is available to you and how to access it.
//
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * LESSON 1: Reading the gameState
 *
 * The gameState object contains ALL the information about the current game.
 * Let's explore what's inside!
 */
function controlTraffic(gameState) {
  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 1: Game Statistics
  // ─────────────────────────────────────────────────────────────────────────────

  // You can see how you're doing with these properties:
  console.log('Current score:', gameState.score);              // Your points
  console.log('Time elapsed:', gameState.timeElapsed);         // Seconds since start
  console.log('Total crashes:', gameState.totalCrashes);       // Number of crashes
  console.log('Active crashes?', gameState.hasActiveCrashes);  // Is intersection blocked?

  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 2: Vehicle Queues
  // ─────────────────────────────────────────────────────────────────────────────

  // Each direction has a queue of waiting vehicles
  console.log('North queue length:', gameState.queues.north.length);
  console.log('South queue length:', gameState.queues.south.length);
  console.log('East queue length:', gameState.queues.east.length);
  console.log('West queue length:', gameState.queues.west.length);

  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 3: Traffic Light States
  // ─────────────────────────────────────────────────────────────────────────────

  // You can check the current state of each light (either 'red' or 'green')
  console.log('North light:', gameState.lights.north.state);
  console.log('South light:', gameState.lights.south.state);
  console.log('East light:', gameState.lights.east.state);
  console.log('West light:', gameState.lights.west.state);

  // ─────────────────────────────────────────────────────────────────────────────
  // YOUR TASK: Return which directions should be GREEN
  // ─────────────────────────────────────────────────────────────────────────────

  // For now, let's just make north green
  return ['north'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEY TAKEAWAYS:
// ═══════════════════════════════════════════════════════════════════════════════
//
// 1. gameState.score - Your current points
// 2. gameState.timeElapsed - How long you've been playing
// 3. gameState.hasActiveCrashes - Are there crashed vehicles blocking?
// 4. gameState.queues.north/south/east/west - Arrays of waiting vehicles
// 5. gameState.lights.north/south/east/west.state - Current light color
//
// Next lesson: Inspecting individual vehicles in the queues!
//
// ═══════════════════════════════════════════════════════════════════════════════
