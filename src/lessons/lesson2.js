// ═══════════════════════════════════════════════════════════════════════════════
// LESSON 2: Understanding Vehicles
// ═══════════════════════════════════════════════════════════════════════════════
//
// In this lesson, you'll learn how to inspect individual vehicles and their properties.
//
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * LESSON 2: Inspecting Vehicles in Queues
 *
 * Each queue contains an array of vehicle objects.
 * Let's learn what information each vehicle has!
 */
function controlTraffic(gameState) {
  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 1: Accessing Vehicles in a Queue
  // ─────────────────────────────────────────────────────────────────────────────

  // Get the north queue
  const northQueue = gameState.queues.north;

  // Check if there are any vehicles waiting
  if (northQueue.length > 0) {
    // Get the first vehicle in the queue
    const firstVehicle = northQueue[0];

    console.log('First vehicle in north queue:', firstVehicle);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 2: Vehicle Properties
  // ─────────────────────────────────────────────────────────────────────────────

  // Each vehicle has these important properties:
  if (northQueue.length > 0) {
    const vehicle = northQueue[0];

    // TYPE: What kind of vehicle is it?
    console.log('Vehicle type:', vehicle.type);
    // Possible values: 'regular', 'ambulance', 'police', 'government'

    // WAIT TIME: How long has it been waiting?
    console.log('Wait time (seconds):', vehicle.waitTime);
    // The longer they wait, the more points you lose!

    // STATE: What is the vehicle doing?
    console.log('Vehicle state:', vehicle.state);
    // Possible values: 'queued', 'moving', 'crashed'
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 3: Looping Through All Vehicles in a Queue
  // ─────────────────────────────────────────────────────────────────────────────

  // You can check ALL vehicles in a queue using a loop
  console.log('All vehicles in north queue:');
  for (let vehicle of northQueue) {
    console.log(`  - Type: ${vehicle.type}, Wait time: ${vehicle.waitTime}s`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONCEPT 4: Checking for Specific Vehicle Types
  // ─────────────────────────────────────────────────────────────────────────────

  // Let's check if there's an ambulance in the north queue
  let hasAmbulance = false;
  for (let vehicle of northQueue) {
    if (vehicle.type === 'ambulance') {
      hasAmbulance = true;
      console.log('AMBULANCE DETECTED in north queue!');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // YOUR TASK: Make a decision based on vehicle data
  // ─────────────────────────────────────────────────────────────────────────────

  // If there's an ambulance in north, give it green light
  if (hasAmbulance) {
    return ['north'];
  }

  // Otherwise, check south
  return ['south'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEY TAKEAWAYS:
// ═══════════════════════════════════════════════════════════════════════════════
//
// 1. vehicle.type - 'regular', 'ambulance', 'police', 'government'
// 2. vehicle.waitTime - Seconds the vehicle has been waiting
// 3. vehicle.state - 'queued', 'moving', 'crashed'
// 4. Use loops to check all vehicles in a queue
// 5. Different vehicle types have different priorities!
//
// Next lesson: Understanding pedestrians!
//
// ═══════════════════════════════════════════════════════════════════════════════
