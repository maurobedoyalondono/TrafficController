# 🚦 Traffic Controller Game - Player Guide

## Welcome!

You are the traffic controller for a busy 4-way intersection. Your job is to write JavaScript code that controls the traffic lights to keep vehicles moving safely and efficiently.

**⚠️ WARNING:** This game teaches you about consequences! Poor decisions cause CRASHES. Crashed vehicles block the intersection, causing cascading failures. If an ambulance crashes, you lose ALL your points instantly - game over!

---

## 🎮 How to Play

1. Open `index.html` in your web browser
2. Edit `player.js` to write your traffic control logic
3. Refresh the page to test your new code
4. Watch your score - don't let it reach zero!
5. Learn from crashes and improve your algorithm

---

## 📋 Your Mission

You control traffic lights by writing the `controlTraffic()` function in `player.js`. This function is called **60 times per second** and must return which directions should have a GREEN light.

### Your function looks like this:

```javascript
function controlTraffic(gameState) {
  // YOUR CODE HERE

  return ['north'];  // Array of directions to turn green
}
```

---

## 📦 What You Get: The `gameState` Object

Every time your function is called, you receive a `gameState` object with everything you need to know:

### Basic Game Info

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `gameState.score` | number | Your current points | `750` |
| `gameState.timeElapsed` | number | Seconds since game started | `45.2` |
| `gameState.totalCrashes` | number | Total crashes so far | `3` |
| `gameState.hasActiveCrashes` | boolean | Is intersection blocked by crashes? | `false` |

### Vehicle Queues (Most Important!)

Each direction has a queue of waiting vehicles:

| Property | Type | Description |
|----------|------|-------------|
| `gameState.queues.north` | Array | Vehicles waiting from north |
| `gameState.queues.south` | Array | Vehicles waiting from south |
| `gameState.queues.east` | Array | Vehicles waiting from east |
| `gameState.queues.west` | Array | Vehicles waiting from west |

**Example:** Check how many vehicles are waiting from north:
```javascript
const northQueue = gameState.queues.north;
console.log(`${northQueue.length} vehicles waiting from north`);
```

### Traffic Light States

Check current light status for each direction:

| Property | Type | Description |
|----------|------|-------------|
| `gameState.lights.north` | Object | `{state: 'red'}` or `{state: 'green'}` |
| `gameState.lights.south` | Object | `{state: 'red'}` or `{state: 'green'}` |
| `gameState.lights.east` | Object | `{state: 'red'}` or `{state: 'green'}` |
| `gameState.lights.west` | Object | `{state: 'red'}` or `{state: 'green'}` |

**Example:** Check if north light is currently green:
```javascript
if (gameState.lights.north.state === 'green') {
  console.log('North is flowing!');
}
```

---

## 🚗 Vehicle Objects

Each vehicle in a queue has these properties:

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `vehicle.type` | string | `'regular'`, `'ambulance'`, `'police'`, `'government'` | What kind of vehicle |
| `vehicle.waitTime` | number | `0` to `∞` seconds | How long waiting in queue |
| `vehicle.state` | string | `'queued'`, `'moving'`, `'crashed'` | Current state |

### Vehicle Type Examples:

```javascript
// Check if first vehicle in north queue is an ambulance
const northQueue = gameState.queues.north;
if (northQueue.length > 0) {
  const firstVehicle = northQueue[0];

  if (firstVehicle.type === 'ambulance') {
    console.log('⚠️ AMBULANCE WAITING! Priority!');
  }

  console.log(`Waiting for ${firstVehicle.waitTime} seconds`);
}
```

### Vehicle Type Importance:

- 🚑 **Ambulance** - HIGHEST PRIORITY! Crash = instant game over!
- 🚓 **Police** - High priority, big penalty if they crash
- 🏛️ **Government** - Medium priority
- 🚗 **Regular** - Standard cars, lowest priority

---

## ✅ What You Return

Your `controlTraffic()` function must return an **array** of direction strings:

### Valid Return Values:

| Return Value | Effect |
|--------------|--------|
| `['north']` | Only north gets GREEN, all others RED |
| `['south']` | Only south gets GREEN |
| `['east']` | Only east gets GREEN |
| `['west']` | Only west gets GREEN |
| `['north', 'south']` | Both north AND south GREEN (⚠️ DANGER!) |
| `[]` | ALL directions RED (all stop) |

### ⚠️ CRASH WARNING!

```javascript
// This will cause a CRASH!
return ['north', 'east'];  // Vehicles will collide in intersection!

// This will also crash!
return ['south', 'west'];  // Same problem!
```

**Why?** Vehicles from perpendicular directions (north/south vs east/west) will collide in the intersection!

---

## 🛡️ Helper Function: `isIntersectionSafe()`

The game provides a helper function to check if it's safe to change lights:

```javascript
isIntersectionSafe(directions)
```

### Parameters:
- `directions` - Array of direction strings you want to turn green

### Returns:
- `true` - Safe! No vehicles will crash
- `false` - DANGER! Vehicles are in intersection or directions conflict

### Example Usage:

```javascript
function controlTraffic(gameState) {
  // I want to let north go green
  const myChoice = ['north'];

  // But is it safe?
  if (isIntersectionSafe(myChoice)) {
    return myChoice;  // ✅ Safe, go ahead!
  } else {
    return [];  // ⚠️ Not safe, keep all red
  }
}
```

---

## 💥 Understanding Crashes

### How Crashes Happen:

1. You set conflicting directions to green (e.g., north and east)
2. Vehicles from both directions enter intersection
3. **CRASH!** They collide
4. Crashed vehicles stop and BLOCK the intersection
5. More vehicles coming crash into the blocked intersection
6. **Cascading failure!** Points drain rapidly

### Crash Penalties:

| Vehicle Type | Penalty | Effect |
|--------------|---------|--------|
| 🚑 Ambulance | **ALL POINTS** | INSTANT GAME OVER! |
| 🚓 Police | -950 points | Nearly fatal |
| 🏛️ Government | -400 points | Severe |
| 🚗 Regular | -200 points | Significant |

### Checking for Crashes:

```javascript
function controlTraffic(gameState) {
  // ALWAYS check for active crashes first!
  if (gameState.hasActiveCrashes) {
    return [];  // Don't change lights! Wait for it to clear!
  }

  // ... rest of your logic
}
```

---

## 📊 Scoring System (Hidden Mechanics - Discover Through Play!)

Your score starts at **1000 points** and decreases based on:

1. **Wait Time** - Vehicles waiting in queues lose you points
2. **Vehicle Type** - Some vehicles are more "expensive" to keep waiting
3. **Crashes** - HUGE penalties (see table above)
4. **Blocked Intersection** - Crashed vehicles continue to drain points

### Pro Tips:

- 🚑 **Never let an ambulance crash!** Game over!
- ⏱️ **Don't make vehicles wait too long** - Points drain faster over time
- 🎯 **Prioritize emergency vehicles** - They cost more when waiting
- 🔄 **Keep traffic flowing** - Empty queues = happy score

---

## 🎓 Learning Path: 5 Levels of Code

### Level 1: Super Simple (Will Crash!)

```javascript
function controlTraffic(gameState) {
  return ['north'];  // Always north - will crash when east/west/south try to move!
}
```

**What you'll learn:** Crashes happen FAST! You need to change lights.

---

### Level 2: Round Robin (Still Crashes!)

```javascript
function controlTraffic(gameState) {
  const directions = ['north', 'south', 'east', 'west'];
  const seconds = Math.floor(gameState.timeElapsed / 3);  // Change every 3 seconds
  const index = seconds % 4;  // 0, 1, 2, 3, 0, 1, 2, 3...
  return [directions[index]];
}
```

**What you'll learn:** Taking turns is good, but if you change too fast, vehicles still in intersection will get hit!

---

### Level 3: Safe Round Robin (Much Better!)

```javascript
function controlTraffic(gameState) {
  // Rule 1: If crashed vehicles blocking, don't change anything!
  if (gameState.hasActiveCrashes) {
    return [];
  }

  // Rule 2: Take turns every 3 seconds
  const directions = ['north', 'south', 'east', 'west'];
  const seconds = Math.floor(gameState.timeElapsed / 3);
  const index = seconds % 4;
  const nextDirection = directions[index];

  // Rule 3: Only change if intersection is clear!
  if (isIntersectionSafe([nextDirection])) {
    return [nextDirection];
  }

  return [];  // Wait...
}
```

**What you'll learn:** Safety checks prevent most crashes! But is this optimal?

---

### Level 4: Priority System (Smart!)

```javascript
function controlTraffic(gameState) {
  // Safety first!
  if (gameState.hasActiveCrashes) return [];

  const directions = ['north', 'south', 'east', 'west'];

  // Check for AMBULANCES first!
  for (let dir of directions) {
    const queue = gameState.queues[dir];
    if (queue.length > 0 && queue[0].type === 'ambulance') {
      if (isIntersectionSafe([dir])) {
        return [dir];  // Let ambulance through ASAP!
      }
    }
  }

  // Check for POLICE second
  for (let dir of directions) {
    const queue = gameState.queues[dir];
    if (queue.length > 0 && queue[0].type === 'police') {
      if (isIntersectionSafe([dir])) {
        return [dir];
      }
    }
  }

  // No emergencies? Use round robin
  const seconds = Math.floor(gameState.timeElapsed / 3);
  const index = seconds % 4;
  const nextDirection = directions[index];

  if (isIntersectionSafe([nextDirection])) {
    return [nextDirection];
  }

  return [];
}
```

**What you'll learn:** Prioritizing emergency vehicles keeps your score higher!

---

### Level 5: Advanced Urgency Score (Expert!)

```javascript
function controlTraffic(gameState) {
  if (gameState.hasActiveCrashes) return [];

  const directions = ['north', 'south', 'east', 'west'];

  // Calculate "urgency" for each direction
  let mostUrgent = null;
  let highestUrgency = -1;

  for (let dir of directions) {
    const queue = gameState.queues[dir];
    if (queue.length === 0) continue;

    let urgency = 0;

    // Add up urgency for all vehicles in this direction
    for (let vehicle of queue) {
      let score = vehicle.waitTime;  // Base: how long waiting

      // Multiply by vehicle importance
      if (vehicle.type === 'ambulance') {
        score *= 10;  // SUPER urgent!
      } else if (vehicle.type === 'police') {
        score *= 5;
      } else if (vehicle.type === 'government') {
        score *= 2;
      }
      // regular = 1x (no multiplier)

      urgency += score;
    }

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
}
```

**What you'll learn:** Balancing wait times and priorities gives best results!

---

## 🔧 Debugging Tips

### Use Console Logging:

```javascript
function controlTraffic(gameState) {
  // See what's happening!
  console.log('Score:', gameState.score);
  console.log('Crashes:', gameState.totalCrashes);
  console.log('North queue:', gameState.queues.north.length);

  // Check for urgent situations
  if (gameState.queues.north.length > 0) {
    console.log('First north vehicle:', gameState.queues.north[0].type);
  }

  // Your logic here...
}
```

### Watch the Browser Console:

Press `F12` in your browser to open Developer Tools and see:
- Your console.log messages
- Error messages if your code has bugs
- Crash warnings from the game

---

## ❓ Common Questions

### Q: Can I make north and south green at the same time?

**A:** In this simple version, NO! All directions conflict with each other. Any two green directions will crash. (Future versions might allow parallel traffic!)

### Q: What if ALL directions have vehicles waiting?

**A:** You have to pick one! Use priority (emergencies first) and wait times to decide.

### Q: How do I know when intersection is clear?

**A:** Use `isIntersectionSafe([direction])` - it returns `true` when safe!

### Q: My score is dropping fast even without crashes!

**A:** Vehicles waiting too long drain points. Don't make emergency vehicles wait! Keep traffic flowing.

### Q: Can I restart after game over?

**A:** Refresh the page! Then improve your code to survive longer.

---

## 🏆 Challenge Goals

1. **Beginner:** Survive 30 seconds without crashing
2. **Intermediate:** Survive 60 seconds with score > 500
3. **Advanced:** Survive 2 minutes with score > 700
4. **Expert:** Survive 5 minutes with no ambulance/police waiting > 5 seconds

---

## 🚀 Ready to Code?

1. Open `player.js`
2. Start with Level 1 or Level 3 example
3. Test it (refresh browser)
4. Learn from what happens
5. Improve your algorithm
6. Repeat!

**Remember:** Crashes are not failures - they're learning opportunities! The game teaches you to think about safety, priorities, and consequences.

Good luck, Traffic Controller! 🚦

---

## 📚 Quick Reference Card

```javascript
// Template
function controlTraffic(gameState) {
  // 1. Check for crashes
  if (gameState.hasActiveCrashes) return [];

  // 2. Check queues
  const northQueue = gameState.queues.north;
  const southQueue = gameState.queues.south;
  const eastQueue = gameState.queues.east;
  const westQueue = gameState.queues.west;

  // 3. Decide direction
  let choice = ['north'];

  // 4. Safety check
  if (isIntersectionSafe(choice)) {
    return choice;
  }

  return [];
}

// Available data:
// - gameState.score
// - gameState.timeElapsed
// - gameState.totalCrashes
// - gameState.hasActiveCrashes
// - gameState.queues.{north|south|east|west}
// - gameState.lights.{north|south|east|west}.state
// - vehicle.type ('regular'|'ambulance'|'police'|'government')
// - vehicle.waitTime (seconds)
// - vehicle.state ('queued'|'moving'|'crashed')

// Helper function:
// - isIntersectionSafe(directions) -> true/false
```
