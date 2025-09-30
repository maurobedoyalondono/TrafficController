# Traffic Controller Game - User Stories

## Epic 1: Game Setup and Initialization

### US-1.1: Launch Game
**As a** player
**I want to** open the game in my browser without any installation
**So that** I can start playing immediately

**Acceptance Criteria:**
- Given a player has the HTML file
- When they open it in a modern browser
- Then the game loads and displays the intersection
- And the game starts automatically or with a clear start button

### US-1.2: View Game State
**As a** player
**I want to** see the current game state (score, time, queues)
**So that** I can understand how well I'm doing

**Acceptance Criteria:**
- Current points/score is displayed prominently
- Elapsed time is shown in a readable format (MM:SS)
- Vehicle queues are visible for all 4 directions
- Traffic light states are clearly indicated

## Epic 2: Vehicle Management

### US-2.1: See Incoming Vehicles
**As a** player
**I want to** see vehicles approaching from all 4 directions
**So that** I can plan my traffic light strategy

**Acceptance Criteria:**
- Vehicles appear randomly from North, South, East, West
- Each vehicle type is visually distinct (ambulance, police, government, regular)
- Vehicles queue up when reaching the intersection with red light
- Vehicle positions are updated smoothly (physics-based)

### US-2.2: Identify Vehicle Priority
**As a** player
**I want to** easily distinguish between vehicle types
**So that** I can prioritize high-importance vehicles

**Acceptance Criteria:**
- Ambulances have distinct visual appearance (e.g., red cross or red color)
- Police vehicles have distinct appearance (e.g., lights or blue color)
- Government vehicles have distinct appearance (e.g., flag or black color)
- Regular cars have standard appearance
- Visual differences are clear even at smaller sizes

### US-2.3: Observe Vehicle Behavior
**As a** player
**I want to** see vehicles move realistically through the intersection
**So that** the game feels natural and predictable

**Acceptance Criteria:**
- Vehicles accelerate smoothly when light turns green
- Vehicles decelerate smoothly when approaching red lights
- Vehicles maintain safe distances from each other
- Vehicles clear the intersection before opposing traffic can enter

## Epic 3: Traffic Light Control

### US-3.1: Control Traffic Lights via Code
**As a** player
**I want to** write JavaScript code to control traffic lights
**So that** I can implement my traffic management strategy

**Acceptance Criteria:**
- Player can edit player.js file with their control logic
- Code has access to current game state via API
- Code can return single direction or multiple directions to set green
- Changes to player.js are reflected when page is refreshed

### US-3.2: Access Game State in Code
**As a** player
**I want to** query the current state of the game in my code
**So that** I can make informed decisions

**Acceptance Criteria:**
- API provides list of vehicles per direction
- API provides vehicle types for each vehicle
- API provides current traffic light states
- API provides current score
- API provides elapsed time
- API provides queue lengths

### US-3.3: Safe Light Transitions
**As a** player
**I want to** the system to prevent collisions when I change lights
**So that** my strategy doesn't cause accidents

**Acceptance Criteria:**
- Lights only turn green when intersection is clear
- Vehicles from previous green light fully exit before new direction starts
- System validates player's light change requests
- Multiple directions can be green simultaneously if safe (parallel lanes)

## Epic 4: Scoring and Game Over

### US-4.1: Lose Points Over Time
**As a** player
**I want to** see my points decrease based on my decisions
**So that** I understand the consequences of my actions

**Acceptance Criteria:**
- Points decrease when vehicles wait too long
- Higher priority vehicles cause faster point loss when waiting
- Current score is always visible
- Point changes are reflected in real-time

### US-4.2: Discover Scoring Rules
**As a** player
**I want to** learn the scoring rules through gameplay
**So that** I can improve my strategy iteratively

**Acceptance Criteria:**
- Scoring rules are not explicitly shown at start
- Player discovers that different vehicle types affect score differently
- Player learns through experimentation which strategies work best
- Game provides feedback through score changes

### US-4.3: Game Over and Results
**As a** player
**I want to** see my results when the game ends
**So that** I can evaluate my performance

**Acceptance Criteria:**
- Game ends when points reach zero
- Game over screen displays total time survived
- Game over screen is clear and prominent
- Player can restart the game easily

## Epic 5: Visual Experience

### US-5.1: Attractive Interface
**As a** player
**I want to** enjoy a visually appealing game interface
**So that** the game is pleasant to play

**Acceptance Criteria:**
- Clean, modern design aesthetic
- Color scheme is pleasing and provides good contrast
- Layout is well-organized and uncluttered
- Animations are smooth and professional

### US-5.2: Clear Intersection View
**As a** player
**I want to** clearly see the intersection and all its components
**So that** I can understand what's happening at a glance

**Acceptance Criteria:**
- 4-way intersection is centered and prominent
- Roads are clearly drawn for all 4 directions
- Traffic lights are positioned logically (at each lane entry)
- Intersection boundaries are clear
- Scale is appropriate for viewing vehicles

### US-5.3: Responsive Animations
**As a** player
**I want to** see smooth vehicle and light animations
**So that** the game feels responsive and real

**Acceptance Criteria:**
- Vehicles move at realistic speeds
- Traffic lights change with clear visual transitions
- Frame rate is consistent (30+ FPS)
- No visual glitches or stuttering

## Epic 6: Player Code Development

### US-6.1: Simple API Structure
**As a** developer/player
**I want to** have a simple, well-documented API
**So that** I can quickly start coding my strategy

**Acceptance Criteria:**
- API methods are clearly named and intuitive
- Example player.js file is provided with comments
- Return format for light control is straightforward
- Data structures are simple JavaScript objects/arrays

### US-6.2: Test Code Changes
**As a** developer/player
**I want to** quickly test my code changes
**So that** I can iterate on my strategy

**Acceptance Criteria:**
- Refreshing the page loads new player code
- No build process required
- Errors in player code are caught and displayed
- Game continues running even if player code has issues

### US-6.3: Debug Game State
**As a** developer/player
**I want to** console.log or debug game state
**So that** I can understand what's happening

**Acceptance Criteria:**
- Player code can use console.log
- Browser dev tools work normally
- Game state is inspectable
- Error messages are helpful

## Epic 7: Game Configuration (Internal)

### US-7.1: Configure Game Parameters
**As a** game designer
**I want to** easily adjust game parameters
**So that** I can tune difficulty and balance

**Acceptance Criteria:**
- Configuration object is centralized and clear
- Vehicle spawn rates are adjustable
- Wait time weights per vehicle type are adjustable
- Initial points are adjustable
- Point deduction rates are adjustable

### US-7.2: Balance Difficulty
**As a** game designer
**I want to** hidden scoring rules to create discovery gameplay
**So that** players learn through experimentation

**Acceptance Criteria:**
- Scoring formula is not displayed in UI
- Configuration is in code (not exposed to player)
- Weights create meaningful strategic decisions
- Game difficulty is challenging but fair
