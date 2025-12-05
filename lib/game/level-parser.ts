import { GameState, Position, CellType } from '../../types/game';
import fs from 'fs';
import path from 'path';

export interface LevelData {
  order: number;
  objective: string;
  gameboard: string[];
  tip: string;
  availableFunctions: string[];
  hints: string[];
}

export interface ParsedLevel extends LevelData {
  gameState: GameState;
}

/**
 * Parse a level markdown file into structured data
 */
export function parseLevelMarkdown(content: string): LevelData {
  const lines = content.split('\n');
  const data: Partial<LevelData> = {
    gameboard: [],
    availableFunctions: [],
    hints: [],
  };

  let currentSection = '';
  let sectionContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect section headers
    if (trimmed.startsWith('## ')) {
      // Save previous section
      if (currentSection && sectionContent.length > 0) {
        const content = sectionContent.join('\n').trim();
        switch (currentSection) {
          case 'Order':
            data.order = parseInt(content);
            break;
          case 'Objective':
            data.objective = content;
            break;
          case 'Gameboard':
            data.gameboard = sectionContent.filter((l) => l.trim().length > 0);
            break;
          case 'Tip':
            data.tip = content;
            break;
          case 'Available Functions':
            data.availableFunctions = sectionContent
              .filter((l) => l.trim().length > 0)
              .map((l) => l.trim());
            break;
          case 'Hints':
            data.hints = sectionContent
              .filter((l) => l.trim().length > 0)
              .map((l) => l.trim().replace(/^\d+\)\s*/, ''));
            break;
        }
      }

      // Start new section
      currentSection = trimmed.replace('## ', '').trim();
      sectionContent = [];
    } else if (currentSection && trimmed.length > 0) {
      sectionContent.push(line);
    }
  }

  // Save last section
  if (currentSection && sectionContent.length > 0) {
    const content = sectionContent.join('\n').trim();
    switch (currentSection) {
      case 'Order':
        data.order = parseInt(content);
        break;
      case 'Objective':
        data.objective = content;
        break;
      case 'Gameboard':
        data.gameboard = sectionContent.filter((l) => l.trim().length > 0);
        break;
      case 'Tip':
        data.tip = content;
        break;
      case 'Available Functions':
        data.availableFunctions = sectionContent
          .filter((l) => l.trim().length > 0)
          .map((l) => l.trim());
        break;
      case 'Hints':
        data.hints = sectionContent
          .filter((l) => l.trim().length > 0)
          .map((l) => l.trim().replace(/^\d+\)\s*/, ''));
        break;
    }
  }

  return data as LevelData;
}

/**
 * Convert gameboard text representation to GameState
 */
export function gameboardToGameState(
  gameboard: string[],
  maxMoves: number = 20
): GameState {
  const height = gameboard.length;
  // Find the maximum width to handle variable-width rows
  const width = Math.max(...gameboard.map((row) => row.length), 0);

  const maze: GameState['maze'] = [];
  let start: Position | null = null;
  let goal: Position | null = null;

  // Initialize maze
  for (let y = 0; y < height; y++) {
    maze[y] = [];
    for (let x = 0; x < width; x++) {
      const char = gameboard[y]?.[x] || '*';
      let cellType: CellType = 'path';

      if (char === 'w') {
        cellType = 'wall';
      } else if (char === 'r') {
        cellType = 'start';
        start = { x, y };
      } else if (char === 'g') {
        cellType = 'goal';
        goal = { x, y };
      }

      maze[y][x] = {
        type: cellType,
        position: { x, y },
      };
    }
  }

  // Default start and goal if not found
  if (!start) start = { x: 0, y: 0 };
  if (!goal) goal = { x: width - 1, y: height - 1 };

  // Ensure start and goal cells are marked correctly
  maze[start.y][start.x].type = 'start';
  maze[goal.y][goal.x].type = 'goal';

  return {
    maze,
    robot: {
      position: { ...start },
      hasReachedGoal: false,
    },
    goal,
    start,
    moves: 0,
    maxMoves,
    isExecuting: false,
    isPaused: false,
    executionSpeed: 500,
  };
}

/**
 * Load and parse a level file
 */
export function loadLevel(levelNumber: number): ParsedLevel {
  const levelPath = path.join(
    process.cwd(),
    'data',
    'levels',
    `level-${levelNumber}.md`
  );

  try {
    const content = fs.readFileSync(levelPath, 'utf-8');
    const levelData = parseLevelMarkdown(content);
    const gameState = gameboardToGameState(levelData.gameboard);

    return {
      ...levelData,
      gameState,
    };
  } catch (error) {
    throw new Error(`Failed to load level ${levelNumber}: ${error}`);
  }
}

/**
 * Get list of available levels
 */
export function getAvailableLevels(): number[] {
  const levelsDir = path.join(process.cwd(), 'data', 'levels');
  try {
    const files = fs.readdirSync(levelsDir);
    return files
      .filter((file) => file.startsWith('level-') && file.endsWith('.md'))
      .map((file) => {
        const match = file.match(/level-(\d+)\.md/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter((num) => num > 0)
      .sort((a, b) => a - b);
  } catch (error) {
    return [];
  }
}

