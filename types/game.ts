export type Direction = 'up' | 'down' | 'left' | 'right';

export type CellType = 'path' | 'wall' | 'start' | 'goal';

export interface Position {
  x: number;
  y: number;
}

export interface MazeCell {
  type: CellType;
  position: Position;
}

export interface RobotState {
  position: Position;
  direction?: Direction;
  hasReachedGoal: boolean;
}

export interface GameState {
  maze: MazeCell[][];
  robot: RobotState;
  goal: Position;
  start: Position;
  moves: number;
  maxMoves: number;
  isExecuting: boolean;
  isPaused: boolean;
  executionSpeed: number;
}

export interface RequirementValidation {
  passed: boolean;
  failures: string[];
}

export interface ExecutionResult {
  success: boolean;
  message: string;
  moves: number;
  reachedGoal: boolean;
  error?: string;
  requirements?: RequirementValidation;
}

export interface CodeExecutionRequest {
  code: string;
  mazeId: string;
  executionMode: 'run' | 'step';
}

