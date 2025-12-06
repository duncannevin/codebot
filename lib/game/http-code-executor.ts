import { RobotController } from './robot';
import type { GameState, ExecutionResult } from '../../types/game';
import type { LevelRequirements } from './level-parser';

/**
 * HTTPCodeExecutor - A simplified executor for HTTP requests
 * Executes code synchronously and collects all frames immediately
 * No async delays needed since we return all events at once
 */
export class HTTPCodeExecutor {
  private robot: RobotController;
  private gameState: GameState;
  private requirements?: LevelRequirements;
  private events: any[] = [];

  constructor(gameState: GameState, requirements?: LevelRequirements) {
    this.gameState = gameState;
    this.requirements = requirements;
    this.robot = new RobotController(gameState);
  }

  /**
   * Execute code and return all events immediately
   */
  execute(code: string): { events: any[]; result: ExecutionResult } {
    // Reset robot to starting position
    this.robot = new RobotController(this.gameState);
    this.events = [];

    const robot = this.robot;

    // Create robot API that executes movements synchronously and emits events immediately
    const robotAPI = {
      moveUp: () => {
        const moved = robot.moveUp();
        this.emitFrame();
        return moved;
      },
      moveDown: () => {
        const moved = robot.moveDown();
        this.emitFrame();
        return moved;
      },
      moveLeft: () => {
        const moved = robot.moveLeft();
        this.emitFrame();
        return moved;
      },
      moveRight: () => {
        const moved = robot.moveRight();
        this.emitFrame();
        return moved;
      },
      canMove: (direction: 'up' | 'down' | 'left' | 'right') => {
        return robot.canMove(direction);
      },
      isWall: (direction: 'up' | 'down' | 'left' | 'right') => {
        return robot.isWall(direction);
      },
      atGoal: () => {
        return robot.atGoal();
      },
    };

    // Create console API
    const consoleAPI = {
      log: (...args: any[]) => {
        this.events.push({
          type: 'console_log',
          message: args.join(' '),
        });
      },
    };

    try {
      // For HTTP mode, execute synchronously - no async/await needed
      // Movements happen immediately and frames are emitted right away
      this.executeSync(robotAPI, consoleAPI, code);

      // Create final result
      const reachedGoal = robot.hasReached();
      const executionResult: ExecutionResult = {
        success: reachedGoal,
        message: reachedGoal
          ? '✅ Robot reached the goal!'
          : '❌ Robot did not reach the goal',
        moves: robot.getMoves(),
        reachedGoal: reachedGoal,
        requirements: undefined,
      };

      // Emit execution_complete event
      this.events.push({
        type: 'execution_complete',
        ...executionResult,
      });

      return {
        events: this.events,
        result: executionResult,
      };
    } catch (error: any) {
      const executionResult: ExecutionResult = {
        success: false,
        message: `Error: ${error.message}`,
        moves: robot.getMoves(),
        reachedGoal: false,
        error: error.message,
      };

      this.events.push({
        type: 'error',
        message: error.message,
      });

      this.events.push({
        type: 'execution_complete',
        ...executionResult,
      });

      return {
        events: this.events,
        result: executionResult,
      };
    }
  }

  /**
   * Execute code synchronously (for HTTP mode)
   * This version doesn't use async/await for movements - executes immediately
   */
  private executeSync(
    robotAPI: any,
    consoleAPI: any,
    originalCode: string
  ): void {
    // Transform code to remove async/await since we execute synchronously
    let syncCode = originalCode.trim();

    // Make solveMaze a regular function (not async)
    syncCode = syncCode.replace(
      /async\s+function\s+solveMaze\s*\(/g,
      'function solveMaze('
    );

    // Remove await from robot movements - they execute immediately
    syncCode = syncCode.replace(
      /await\s+robot\.(moveUp|moveDown|moveLeft|moveRight)\(\)/g,
      'robot.$1()'
    );

    // Remove await from solveMaze calls
    syncCode = syncCode.replace(/await\s+solveMaze\s*\(/g, 'solveMaze(');

    // Remove any remaining await keywords that might be in the code
    // (but be careful not to break the code structure)
    syncCode = syncCode.replace(/await\s+/g, '');

    // Check if solveMaze is defined but not called
    const hasSolveMazeDef = /function\s+solveMaze\s*\(/.test(syncCode);
    if (hasSolveMazeDef) {
      const hasSolveMazeCall = /solveMaze\s*\(/.test(syncCode);
      if (!hasSolveMazeCall) {
        syncCode = `${syncCode}\n\nsolveMaze();`;
      }
    }

    // Execute synchronously - movements happen immediately and emit frames
    try {
      const func = new Function('robot', 'console', syncCode);
      func(robotAPI, consoleAPI);
    } catch (error: any) {
      // Re-throw to be caught by outer try-catch
      throw error;
    }
  }

  /**
   * Emit a robot_move frame immediately after a movement
   */
  private emitFrame(): void {
    this.events.push({
      type: 'robot_move',
      position: this.robot.getPosition(),
      moves: this.robot.getMoves(),
      reachedGoal: this.robot.hasReached(),
    });
  }
}

