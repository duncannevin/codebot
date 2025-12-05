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
    
    // Helper to add delay between movements for real-time visualization
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Create robot API that the user code can call
    const robotAPI = {
      moveUp: async () => {
        const moved = robot.moveUp();
        this.emit('robot_move', {
          position: robot.getPosition(),
          moves: robot.getMoves(),
          reachedGoal: robot.hasReached(),
          message: moved
            ? `→ Robot moved up (${robot.getMoves()}/${this.gameState.maxMoves})`
            : '→ Cannot move up (wall or boundary)',
        });
        // Add delay for real-time visualization
        await delay(speed);
        return moved;
      },
      moveDown: async () => {
        const moved = robot.moveDown();
        this.emit('robot_move', {
          position: robot.getPosition(),
          moves: robot.getMoves(),
          reachedGoal: robot.hasReached(),
          message: moved
            ? `→ Robot moved down (${robot.getMoves()}/${this.gameState.maxMoves})`
            : '→ Cannot move down (wall or boundary)',
        });
        await delay(speed);
        return moved;
      },
      moveLeft: async () => {
        const moved = robot.moveLeft();
        this.emit('robot_move', {
          position: robot.getPosition(),
          moves: robot.getMoves(),
          reachedGoal: robot.hasReached(),
          message: moved
            ? `→ Robot moved left (${robot.getMoves()}/${this.gameState.maxMoves})`
            : '→ Cannot move left (wall or boundary)',
        });
        await delay(speed);
        return moved;
      },
      moveRight: async () => {
        const moved = robot.moveRight();
        this.emit('robot_move', {
          position: robot.getPosition(),
          moves: robot.getMoves(),
          reachedGoal: robot.hasReached(),
          message: moved
            ? `→ Robot moved right (${robot.getMoves()}/${this.gameState.maxMoves})`
            : '→ Cannot move right (wall or boundary)',
        });
        await delay(speed);
        return moved;
      },
      canMove: (direction: 'up' | 'down' | 'left' | 'right') => {
        return robot.canMove(direction);
      },
      atGoal: () => {
        return robot.atGoal();
      },
    };

    try {
      // Wrap user code in async context
      // User code should use await for robot movements to see real-time updates
      // Auto-call solveMaze if it's defined but not called
      let wrappedCode = code.trim();
      
      // Check if code defines solveMaze function
      const hasSolveMazeDef = /(async\s+)?function\s+solveMaze\s*\(/.test(wrappedCode);
      
      // Check if solveMaze is called anywhere (excluding the definition itself)
      // Split by lines and check each line
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
      
      // If solveMaze is defined but not called, add the call
      if (hasSolveMazeDef && !hasSolveMazeCall) {
        wrappedCode = `${wrappedCode}\n\nawait solveMaze();`;
      }
      
      // Wrap in async IIFE to ensure proper async execution
      wrappedCode = `
        (async function() {
          ${wrappedCode}
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
          // Execute and wait for any async operations (like robot movements with delays)
          const result = func(context.robot, context.console);
          // Always wait for the result - it should be a promise from the IIFE
          if (result && typeof result.then === 'function') {
            await result;
          } else {
            // If somehow it's not a promise, wait a bit for async operations
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          // Give a small delay to ensure all WebSocket messages are sent and processed
          await new Promise(resolve => setTimeout(resolve, speed + 100));
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

