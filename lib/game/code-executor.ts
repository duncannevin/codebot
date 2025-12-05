import { RobotController } from './robot';
import type { GameState, ExecutionResult } from '../../types/game';

export class CodeExecutor {
  private robot: RobotController;
  private gameState: GameState;
  private executionCallbacks: Array<(data: any) => void> = [];

  constructor(gameState: GameState) {
    this.gameState = gameState;
    // Create a fresh robot controller for each execution
    this.robot = new RobotController(gameState);
  }

  reset() {
    // Reset robot to starting position
    this.robot = new RobotController(this.gameState);
  }

  onMove(callback: (data: any) => void) {
    this.executionCallbacks.push(callback);
  }

  private emit(event: string, data: any) {
    this.executionCallbacks.forEach((callback) => {
      callback({ type: event, ...data });
    });
  }

  async execute(code: string, speed: number = 500): Promise<ExecutionResult> {
    // Reset robot to starting position before execution
    this.reset();
    const robot = this.robot;
    
    // Ensure speed is a valid number (in milliseconds)
    const executionSpeed = typeof speed === 'number' && speed > 0 ? speed : 500;
    
    // Helper to add delay between movements for real-time visualization
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Queue system to ensure movements execute sequentially with delays
    let movementQueue: Promise<boolean> = Promise.resolve(true);
    
    // Helper to queue a movement
    const queueMovement = (movementFn: () => boolean, direction: string): boolean => {
      movementQueue = movementQueue.then(async () => {
        const moved = movementFn();
        this.emit('robot_move', {
          position: robot.getPosition(),
          moves: robot.getMoves(),
          reachedGoal: robot.hasReached(),
          message: moved
            ? `→ Robot moved ${direction} (${robot.getMoves()}/${this.gameState.maxMoves})`
            : `→ Cannot move ${direction} (wall or boundary)`,
        });
        // Add delay for real-time visualization - use executionSpeed
        await delay(executionSpeed);
        return moved;
      });
      // Return immediately (synchronous from user's perspective)
      return true;
    };
    
    // Create robot API that the user code can call (synchronous methods with automatic delays)
    const robotAPI = {
      moveUp: () => queueMovement(() => robot.moveUp(), 'up'),
      moveDown: () => queueMovement(() => robot.moveDown(), 'down'),
      moveLeft: () => queueMovement(() => robot.moveLeft(), 'left'),
      moveRight: () => queueMovement(() => robot.moveRight(), 'right'),
      canMove: (direction: 'up' | 'down' | 'left' | 'right') => {
        return robot.canMove(direction);
      },
      atGoal: () => {
        return robot.atGoal();
      },
    };

    try {
      // Auto-call solveMaze if it's defined but not called
      let wrappedCode = code.trim();
      
      // Check if code defines solveMaze function (with or without async)
      const hasSolveMazeDef = /(async\s+)?function\s+solveMaze\s*\(/.test(wrappedCode);
      
      // Check if solveMaze is called anywhere (excluding the definition itself)
      const lines = wrappedCode.split('\n');
      let hasSolveMazeCall = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip lines that contain the function definition
        if (/(async\s+)?function\s+solveMaze\s*\(/.test(line)) {
          continue;
        }
        // Check if this line calls solveMaze
        if (/solveMaze\s*\(/.test(line)) {
          hasSolveMazeCall = true;
          break;
        }
      }
      
      // If solveMaze is defined but not called, add the call (without await)
      if (hasSolveMazeDef && !hasSolveMazeCall) {
        wrappedCode = `${wrappedCode}\n\nsolveMaze();`;
      }
      
      // Wrap in async IIFE to handle robot movement promises automatically
      wrappedCode = `
        (async function() {
          ${wrappedCode}
          // Wait for all pending robot movements to complete
          await new Promise(resolve => setTimeout(resolve, ${executionSpeed + 100}));
        })();
      `;

      // Create execution context with robot API
      const context = {
        robot: robotAPI,
        console: {
          log: (...args: any[]) => {
            this.emit('console_log', { message: args.join(' ') });
          },
        },
      };

      // Execute code with timeout
      const executionPromise = (async () => {
        try {
          // Use Function constructor for sandboxing (in production, use vm2 or similar)
          const func = new Function(
            'robot',
            'console',
            wrappedCode
          );
          // Execute user code (synchronously, but movements are queued)
          const result = func(context.robot, context.console);
          // Wait for the IIFE promise to complete
          if (result && typeof result.then === 'function') {
            await result;
          }
          // Wait for all queued movements to complete
          await movementQueue;
          // Small delay to ensure all messages are sent
          await delay(100);
        } catch (error: any) {
          throw error;
        }
      })();

      await Promise.race([
        executionPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Execution timeout')), 30000)
        ),
      ]);

      const result: ExecutionResult = {
        success: robot.hasReached(),
        message: robot.hasReached()
          ? '✅ Success! Robot reached the goal!'
          : '❌ Robot did not reach the goal',
        moves: robot.getMoves(),
        reachedGoal: robot.hasReached(),
      };

      this.emit('execution_complete', result);

      return result;
    } catch (error: any) {
      const result: ExecutionResult = {
        success: false,
        message: `Error: ${error.message}`,
        moves: robot.getMoves(),
        reachedGoal: false,
        error: error.message,
      };

      this.emit('error', { message: error.message });
      return result;
    }
  }
}

