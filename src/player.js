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
  // Rotate lights every 5 seconds randomly
  const directions = ['north', 'south', 'east', 'west'];
  const seconds = Math.floor(gameState.timeElapsed / 5);

  // Use seconds as seed for consistent but "random" rotation
  const randomIndex = (seconds * 7) % 4;
  const currentDirection = directions[randomIndex];

  return [currentDirection];
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
