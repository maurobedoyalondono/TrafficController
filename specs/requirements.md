# Traffic Controller Game - Requirements Specification

## 1. Overview
A browser-based traffic intersection management game designed for 15-year-old students learning programming. Players control traffic lights to manage vehicles coming from 4 directions, balancing wait times and vehicle priorities to maximize their score. The game teaches consequence-based decision making: poor traffic management leads to crashes that block the intersection and cascade into more crashes. The framework is intentionally simple to allow progression from basic algorithms to complex strategies.

## 2. Functional Requirements

### 2.1 Game Core Mechanics
- **FR-001**: The game shall feature a 4-way intersection with traffic coming from North, South, East, and West directions
- **FR-002**: Each direction shall maintain a queue of waiting vehicles
- **FR-003**: Vehicles shall only move straight through the intersection (no turns)
- **FR-004**: The game shall start with an initial point value
- **FR-005**: Points shall decrease based on configurable rules (hidden from player)
- **FR-006**: The game shall end when points reach zero
- **FR-007**: Upon game over, the system shall display the total time played
- **FR-008**: The game shall run continuously until game over condition is met

### 2.2 Vehicle Types and Behavior
- **FR-009**: The game shall support four vehicle types:
  - Regular cars (standard priority)
  - Ambulance (high priority)
  - Police (high priority)
  - Government vehicles (medium priority)
- **FR-010**: Each vehicle type shall have a different waiting time weight/multiplier
- **FR-011**: Vehicles shall spawn randomly in all four directions
- **FR-012**: Vehicles shall move through the intersection when their direction has green light and the intersection is clear
- **FR-013**: Vehicles shall crash if conflicting directions have green lights simultaneously
- **FR-014**: Crashed vehicles shall remain in the intersection, blocking it
- **FR-015**: New vehicles entering a blocked intersection shall also crash
- **FR-016**: Crashed vehicles shall create cascading failures as more vehicles arrive
- **FR-017**: Crashes shall significantly penalize the player's score
- **FR-018**: Crashed vehicles shall be visually distinct (e.g., rotated, color changed, smoke effect)

### 2.3 Traffic Light Control
- **FR-019**: The system shall provide an API for controlling traffic lights
- **FR-020**: The player's code shall be able to set one or multiple directions to green simultaneously
- **FR-021**: The system shall NOT automatically prevent unsafe light changes (player must code safety logic)
- **FR-022**: The system shall detect and execute crashes when unsafe conditions occur
- **FR-023**: Players learn safety through trial and error (crashes are teaching moments)

### 2.4 Scoring System
- **FR-024**: Points shall decrease based on vehicle waiting time multiplied by vehicle type weight
- **FR-025**: If any ambulance crashes, ALL points are immediately lost (instant game over)
- **FR-026**: If any police vehicle crashes, points drop to near-zero (severe penalty)
- **FR-027**: Regular and government vehicle crashes shall cause significant point loss
- **FR-028**: Each crashed vehicle shall continue to penalize score while blocking intersection
- **FR-029**: Cascading crashes shall multiply penalties exponentially
- **FR-030**: The scoring rules shall be hidden from the player initially (discovery through gameplay)
- **FR-031**: The game shall track total elapsed time from start
- **FR-032**: The game shall track total crashes occurred by type

### 2.5 Player API (Designed for Beginners)
- **FR-033**: The API shall be extremely simple with intuitive naming for 15-year-olds
- **FR-034**: The game shall provide a programming interface with access to:
  - List of vehicles in each direction queue (with simple properties)
  - Vehicle types (strings: 'ambulance', 'police', 'government', 'regular')
  - Current traffic light states (strings: 'red', 'green')
  - Current score/points (number)
  - Time elapsed (seconds for easy understanding)
  - Crash status (boolean: is intersection blocked?)
  - List of crashed vehicles (for awareness)
- **FR-035**: The player's code shall return an array of direction(s) to set to green
- **FR-036**: The player's code shall be executed in a separate JavaScript file (player.js)
- **FR-037**: API shall include helper functions (e.g., `isIntersectionSafe()` that players can use)
- **FR-038**: Example code shall show progression from simple (always north) to complex (priority-based with safety checks)
- **FR-039**: API shall clearly expose crash status so students learn to check before changing lights

## 3. Non-Functional Requirements

### 3.1 Technical Constraints
- **NFR-001**: The game shall be implemented as a standalone HTML file with embedded/linked CSS and JavaScript
- **NFR-002**: No installation or build process shall be required
- **NFR-003**: The game shall run entirely in the browser (no server required)
- **NFR-004**: The game engine shall be implemented in a separate file (engine.js)
- **NFR-005**: Player code shall be in a separate file (player.js)

### 3.2 Performance
- **NFR-006**: The game shall maintain at least 30 FPS for smooth animation
- **NFR-007**: Physics simulation shall calculate vehicle positions in real-time
- **NFR-008**: The game shall respond to player code decisions within 100ms

### 3.3 User Interface
- **NFR-009**: The UI shall feature a visually appealing design
- **NFR-010**: The intersection shall be clearly visible with all 4 directions
- **NFR-011**: Traffic lights shall be visually represented for each direction
- **NFR-012**: Vehicles shall be distinguishable by type (visual differentiation)
- **NFR-013**: The current score/points shall be displayed
- **NFR-014**: The elapsed time shall be displayed
- **NFR-015**: Vehicle queues shall be visible for each direction

### 3.4 Physics Simulation
- **NFR-016**: Vehicles shall have realistic acceleration and deceleration
- **NFR-017**: Vehicle movement shall follow basic physics (speed, position updates)
- **NFR-018**: Collision detection shall be implemented for the intersection area
- **NFR-019**: Vehicles shall maintain safe following distances in queues
- **NFR-020**: Crash physics shall rotate/position vehicles realistically
- **NFR-021**: Crashed vehicles shall remain stationary and block movement

### 3.5 Educational Design (for 15-year-olds)
- **NFR-022**: Code examples shall progress from very simple to complex
- **NFR-023**: API naming shall use plain English (no jargon)
- **NFR-024**: Comments in example code shall explain "why" not just "what"
- **NFR-025**: Error messages shall be helpful and educational
- **NFR-026**: Game shall provide immediate visual feedback for all actions
- **NFR-027**: Failure (crashes) shall be a teaching tool, not just punishment

## 4. Configuration Requirements

### 4.1 Game Configuration
- **CFG-001**: Vehicle spawn rates shall be configurable
- **CFG-002**: Initial point value shall be configurable
- **CFG-003**: Vehicle type weights shall be configurable:
  - Ambulance: highest weight
  - Police: high weight
  - Government: medium weight
  - Regular car: base weight
- **CFG-004**: Point deduction rules shall be configurable
- **CFG-005**: Vehicle speed parameters shall be configurable
- **CFG-006**: Intersection dimensions shall be configurable
- **CFG-007**: Crash penalty multiplier shall be configurable (high value to teach consequences)
- **CFG-008**: Crash visual effects shall be configurable (rotation angle, color change)

## 5. Constraints and Assumptions

### 5.1 Constraints
- Browser-based only (HTML5 + JavaScript + CSS)
- No external libraries required (vanilla JavaScript)
- Single-player game
- No persistent storage required

### 5.2 Assumptions
- Players have basic programming knowledge (JavaScript)
- Modern browser with HTML5 Canvas support
- Players will iterate and improve their code based on gameplay results
- The challenge is in discovering optimal traffic management strategies

## 6. Future Enhancements (Out of Scope for v1)
- Multiplayer support
- Leaderboard system
- Multiple intersection configurations
- Additional vehicle types
- Turn lanes
- Pedestrian crossings
- Day/night cycles
- Weather effects
