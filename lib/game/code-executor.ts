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
    
    // Helper to queue a movement - returns a promise that resolves after visualization
    const queueMovement = async (movementFn: () => boolean, direction: string, functionName: string): Promise<boolean> => {
      // Log server-side only
      console.log(`robot.${functionName}`);
      
      // Wait for previous movements to complete visualization first
      await movementQueue;
      
      // Now execute the movement (position updates here)
      const moved = movementFn();
      
      // Create a promise for this movement's visualization
      const visualizationPromise = (async () => {
        // Emit robot_move event for game state updates (without message)
        this.emit('robot_move', {
          position: robot.getPosition(),
          moves: robot.getMoves(),
          reachedGoal: robot.hasReached(),
        });
        
        // Add delay for real-time visualization - use executionSpeed
        await delay(executionSpeed);
        
        return moved;
      })();
      
      // Update the queue to track this movement's completion
      movementQueue = visualizationPromise;
      
      // Wait for this movement's visualization to complete
      await visualizationPromise;
      
      // Return the actual result of the movement
      return moved;
    };
    
    // Create robot API that the user code can call (async methods that wait for visualization)
    const robotAPI = {
      moveUp: () => queueMovement(() => robot.moveUp(), 'up', 'moveUp()'),
      moveDown: () => queueMovement(() => robot.moveDown(), 'down', 'moveDown()'),
      moveLeft: () => queueMovement(() => robot.moveLeft(), 'left', 'moveLeft()'),
      moveRight: () => queueMovement(() => robot.moveRight(), 'right', 'moveRight()'),
      canMove: (direction: 'up' | 'down' | 'left' | 'right') => {
        console.log(`robot.canMove('${direction}')`);
        return robot.canMove(direction);
      },
      isWall: (direction: 'up' | 'down' | 'left' | 'right') => {
        console.log(`robot.isWall('${direction}')`);
        return robot.isWall(direction);
      },
      atGoal: () => {
        console.log('robot.atGoal()');
        return robot.atGoal();
      },
    };

    try {
      // Auto-call solveMaze if it's defined but not called
      let wrappedCode = code.trim();
      
      // Check if code defines solveMaze function (with or without async)
      const hasSolveMazeDef = /(async\s+)?function\s+solveMaze\s*\(/.test(wrappedCode);
      const isSolveMazeAsync = /async\s+function\s+solveMaze\s*\(/.test(wrappedCode);
      
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
      
      // Make solveMaze async if it's not already (needed for await on robot movements)
      if (hasSolveMazeDef && !isSolveMazeAsync) {
        wrappedCode = wrappedCode.replace(
          /function\s+solveMaze\s*\(/g,
          'async function solveMaze('
        );
      }
      
      // Transform robot movement calls to be awaited automatically
      // This ensures movements are visualized even in loops
      wrappedCode = wrappedCode.replace(
        /robot\.(moveUp|moveDown|moveLeft|moveRight)\(\)/g,
        'await robot.$1()'
      );
      
      // If solveMaze is defined but not called, add the call (with await since it's now async)
      if (hasSolveMazeDef && !hasSolveMazeCall) {
        wrappedCode = `${wrappedCode}\n\nawait solveMaze();`;
      }
      
      // Wrap in async IIFE to handle robot movement promises automatically
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

