import { RobotController } from './robot';
import type { GameState, ExecutionResult } from '../../types/game';
import type { LevelRequirements } from './level-parser';

export class CodeExecutor {
  private robot: RobotController;
  private gameState: GameState;
  private requirements?: LevelRequirements;
  private messageCallbacks: Array<(data: any) => void> = [];

  constructor(gameState: GameState, requirements?: LevelRequirements) {
    this.gameState = gameState;
    this.requirements = requirements;
    // Create a fresh robot controller for each execution
    this.robot = new RobotController(gameState);
  }

  reset() {
    // Reset robot to starting position
    this.robot = new RobotController(this.gameState);
  }

  onMessage(callback: (data: any) => void) {
    this.messageCallbacks.push(callback);
  }

  private emit(event: string, data: any) {
    this.messageCallbacks.forEach((callback) => {
      callback({ type: event, ...data });
    });
  }

  async execute(code: string, speed: number = 500): Promise<void> {
    // Reset robot to starting position before execution
    this.reset();
    const robot = this.robot;
    
    // Ensure speed is a valid number (in milliseconds)
    const executionSpeed = typeof speed === 'number' && speed > 0 ? speed : 500;
    
    // Helper to add delay between movements for real-time visualization
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Queue system to ensure movements execute sequentially with delays
    // This tracks the promise chain of all movements
    let movementQueue: Promise<boolean> = Promise.resolve(true);
    let movementCount = 0; // Track number of movements queued
    let pendingMovements = 0; // Track movements that are in progress
    let codeExecutionComplete = false; // Track if the code execution (IIFE) has completed
    
    // Helper to queue a movement - returns a promise that resolves after visualization
    const queueMovement = async (movementFn: () => boolean, direction: string, functionName: string): Promise<boolean> => {
      // Log server-side only
      console.log(`robot.${functionName}`);
      
      // Increment movement counter and pending movements
      movementCount++;
      pendingMovements++;
      
      // Wait for previous movements to complete visualization first
      await movementQueue;
      
      // Now execute the movement (position updates here)
      const moved = movementFn();
      
      // Emit robot_move event immediately after movement (synchronously)
      // This ensures the event is captured before any async operations
      this.emit('robot_move', {
        position: robot.getPosition(),
        moves: robot.getMoves(),
        reachedGoal: robot.hasReached(),
      });
      
      // Create a promise for this movement's visualization delay
      const visualizationPromise = (async () => {
        // Add delay for real-time visualization - use executionSpeed
        await delay(executionSpeed);
        
        // Decrement pending movements when this one completes
        pendingMovements--;
        
        return moved;
      })();
      
      // Update the queue to track this movement's completion
      // IMPORTANT: We update movementQueue BEFORE awaiting, so the next movement
      // can start waiting, but we still await this one to ensure it completes
      movementQueue = visualizationPromise;
      
      // Wait for this movement's visualization to complete
      // This ensures the IIFE only continues after this movement is fully visualized
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
      } else if (hasSolveMazeDef && hasSolveMazeCall) {
        // If solveMaze is called but not awaited, add await
        // This ensures the IIFE waits for solveMaze to complete
        // Process line by line to avoid matching function definitions
        const lines = wrappedCode.split('\n');
        const processedLines = lines.map((line) => {
          // Skip lines that contain function definitions
          if (/(async\s+)?function\s+solveMaze\s*\(/.test(line)) {
            return line;
          }
          // For other lines, add await before solveMaze() if not already present
          return line.replace(
            /(\s|^)(await\s+)?solveMaze\s*\(/g,
            (match, prefix, awaitKeyword) => {
              return awaitKeyword ? match : `${prefix}await solveMaze(`;
            }
          );
        });
        wrappedCode = processedLines.join('\n');
      }

      // Wrap in async IIFE to handle robot movement promises automatically
      // The IIFE returns a promise that resolves when all code completes
      wrappedCode = `
        (async function() {
          ${wrappedCode};
          await allDone();
        })();
      `;

      const allDone = () => {
        // Check if execution was successful (robot reached the goal)
        // Don't validate requirements here - wait for UI to confirm animations are complete
        const reachedGoal = robot.hasReached();
        
        const result: ExecutionResult = {
          success: reachedGoal, // Will be updated after validation
          message: reachedGoal
            ? '✅ Robot reached the goal!'
            : '❌ Robot did not reach the goal',
          moves: robot.getMoves(),
          reachedGoal: reachedGoal,
          requirements: undefined, // Will be set during validation
        };


        // Log for debugging
        console.log(`[CodeExecutor] All movements complete. Total: ${movementCount}, Final position:`, robot.getPosition(), 'Reached goal:', robot.hasReached());
        this.emit('execution_complete', result);
      };

      // Create execution context with robot API
      const context = {
        robot: robotAPI,
        console: {
          log: (...args: any[]) => {
            this.emit('console_log', { message: args.join(' ') });
          },
        },
        allDone: allDone,
      };
      
      // Execute code with timeout
      // The server will keep sending robot_move frames until this promise resolves
      const executionPromise = (async () => {
        try {
          // Use Function constructor for sandboxing (in production, use vm2 or similar)
          const func = new Function(
            'robot',
            'console',
            'allDone',
            wrappedCode,
          );
          // Execute user code (the IIFE returns a promise)
          const result = func(context.robot, context.console, context.allDone);
          // Wait for the IIFE promise to complete
          // This waits for all await calls in the user code to complete
          if (result && typeof result.then === 'function') {
            await result;
          } else {
            // If result is not a promise, wait a bit for any async operations to start
            await delay(100);
          }
          
          // Mark that code execution (IIFE) has completed
          // This allows us to identify the last frame
          codeExecutionComplete = true;
          
          // CRITICAL: Wait for ALL movements to complete
          // The movementQueue tracks the last movement's visualization promise
          // We must wait for this to ensure all robot_move frames have been sent
          await movementQueue;
          
          // Wait for any pending movements to complete
          // Keep waiting until all movements are done (no early exit)
          while (pendingMovements > 0) {
            await delay(50);
          }
          
          // Additional delay to ensure the last movement's visualization animation is fully complete
          await delay(executionSpeed);
        } catch (error: any) {
          throw error;
        }
      })();
    } catch (error: any) {
      const result: ExecutionResult = {
        success: false,
        message: `Error: ${error.message}`,
        moves: robot.getMoves(),
        reachedGoal: false,
        error: error.message,
      };

      this.emit('error', { message: error.message });
    }
  }

}

