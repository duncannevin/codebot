import type { Position, Direction, GameState } from '../../types/game';

export class RobotController {
  private position: Position;
  private maze: GameState['maze'];
  private goal: Position;
  private moves: number = 0;
  private maxMoves: number;
  private hasReachedGoal: boolean = false;

  constructor(gameState: GameState) {
    this.position = { ...gameState.start };
    this.maze = gameState.maze;
    this.goal = gameState.goal;
    this.maxMoves = gameState.maxMoves;
  }

  moveUp(): boolean {
    return this.move({ x: 0, y: -1 }, 'up');
  }

  moveDown(): boolean {
    return this.move({ x: 0, y: 1 }, 'down');
  }

  moveLeft(): boolean {
    return this.move({ x: -1, y: 0 }, 'left');
  }

  moveRight(): boolean {
    return this.move({ x: 1, y: 0 }, 'right');
  }

  private move(delta: Position, direction: Direction): boolean {
    const newX = this.position.x + delta.x;
    const newY = this.position.y + delta.y;

    // Check bounds
    if (newX < 0 || newY < 0 || newY >= this.maze.length || newX >= this.maze[0].length) {
      return false;
    }

    // Check if cell is a wall
    const cell = this.maze[newY][newX];
    if (cell.type === 'wall') {
      return false;
    }

    // Move robot
    this.position = { x: newX, y: newY };
    this.moves++;

    // Check if reached goal
    if (newX === this.goal.x && newY === this.goal.y) {
      this.hasReachedGoal = true;
    }

    return true;
  }

  canMove(direction: Direction): boolean {
    let delta: Position;
    switch (direction) {
      case 'up':
        delta = { x: 0, y: -1 };
        break;
      case 'down':
        delta = { x: 0, y: 1 };
        break;
      case 'left':
        delta = { x: -1, y: 0 };
        break;
      case 'right':
        delta = { x: 1, y: 0 };
        break;
    }

    const newX = this.position.x + delta.x;
    const newY = this.position.y + delta.y;

    if (newX < 0 || newY < 0 || newY >= this.maze.length || newX >= this.maze[0].length) {
      return false;
    }

    const cell = this.maze[newY][newX];
    return cell.type !== 'wall';
  }

  isWall(direction: Direction): boolean {
    let delta: Position;
    switch (direction) {
      case 'up':
        delta = { x: 0, y: -1 };
        break;
      case 'down':
        delta = { x: 0, y: 1 };
        break;
      case 'left':
        delta = { x: -1, y: 0 };
        break;
      case 'right':
        delta = { x: 1, y: 0 };
        break;
    }

    const newX = this.position.x + delta.x;
    const newY = this.position.y + delta.y;

    // Check bounds - if out of bounds, treat as wall
    if (newX < 0 || newY < 0 || newY >= this.maze.length || newX >= this.maze[0].length) {
      return true;
    }

    const cell = this.maze[newY][newX];
    return cell.type === 'wall';
  }

  atGoal(): boolean {
    return this.hasReachedGoal;
  }

  getPosition(): Position {
    return { ...this.position };
  }

  getMoves(): number {
    return this.moves;
  }

  hasReached(): boolean {
    return this.hasReachedGoal;
  }
}

