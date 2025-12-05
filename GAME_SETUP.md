# Game Setup Guide

## Overview

The Code Bot game interface is now built with:
- **Monaco Editor** for code editing
- **Server-side code execution** for security
- **WebSocket support** for real-time robot movement updates
- **Maze visualization** with interactive robot

## Running the Game

### Development Mode

1. **Standard mode (HTTP polling fallback)**:
   ```bash
   npm run dev
   ```
   This runs Next.js with HTTP-based code execution (works everywhere).

2. **With WebSocket server** (for real-time updates):
   ```bash
   npm run dev:ws
   ```
   This runs both Next.js and the WebSocket server on port 3001.

### Access the Game

1. Navigate to `http://localhost:3000/login`
2. Sign in with GitHub
3. You'll be redirected to `/game`

## Architecture

### Components

- **GameInterface**: Main game container
- **MazeArena**: Visual maze with robot and goal
- **CodeEditor**: Monaco Editor with console output
- **GameControls**: Run, Step, Reset, Speed controls
- **GameStats**: Level statistics panel

### Server-Side Execution

Code execution happens server-side via `/api/game/execute`:
- User code is sandboxed
- Robot movements are validated
- Results are returned with execution events

### WebSocket (Optional)

For real-time updates, a WebSocket server runs on port 3001:
- Receives code execution requests
- Sends real-time robot movement updates
- Falls back to HTTP polling if WebSocket unavailable

## Code Execution Flow

1. User writes code in Monaco Editor
2. Clicks "Run Code"
3. Code sent to `/api/game/execute`
4. Server executes code in sandboxed environment
5. Robot movements validated against maze
6. Updates sent back via WebSocket or HTTP response
7. UI updates in real-time showing robot movement

## Robot API

Users can call these functions in their code:

```javascript
robot.moveUp()      // Move robot up
robot.moveDown()    // Move robot down
robot.moveLeft()    // Move robot left
robot.moveRight()   // Move robot right
robot.canMove(direction)  // Check if movement is possible
robot.atGoal()      // Check if robot reached goal
```

## Maze Structure

- **Path**: Walkable cells (light gray)
- **Wall**: Obstacles (dark gray/black)
- **Start**: Robot starting position (green)
- **Goal**: Target position (orange/yellow)

## Production Deployment

For Vercel deployment:
- WebSocket server won't work (use HTTP polling)
- Code execution API works fine
- Consider using Supabase Realtime or Pusher for WebSocket in production

## Troubleshooting

### WebSocket not connecting
- Check if WebSocket server is running (`npm run dev:ws`)
- Check browser console for connection errors
- System falls back to HTTP polling automatically

### Code execution errors
- Check server logs for detailed error messages
- Verify code syntax is valid JavaScript
- Ensure robot API functions are called correctly

### Robot not moving
- Check console output for error messages
- Verify maze boundaries aren't exceeded
- Check that walls aren't blocking movement

