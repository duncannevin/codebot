import { GameState, Position, CellType } from '../../types/game';
import fs from 'fs';
import path from 'path';

export interface LevelRequirements {
  maxMoves?: number;
  mustUseLoop?: boolean;
  mustUseFunction?: boolean;
  mustUseConditional?: boolean;
  mustUseWhile?: boolean;
  mustUseFor?: boolean;
}

export interface LevelData {
  order: number;
  title?: string;
  objective: string;
  gameboard: string[];
  tip: string;
  availableFunctions: string[];
  hints: string[];
  boilerplate?: string;
  requirements?: LevelRequirements;
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
    boilerplate: '',
    requirements: {},
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
          case 'Title':
            data.title = content;
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
          case 'Boilerplate':
            data.boilerplate = sectionContent.join('\n').trim();
            break;
          case 'Requirements':
            data.requirements = parseRequirements(sectionContent);
            break;
        }
      }

      // Start new section
      currentSection = trimmed.replace('## ', '').trim();
      sectionContent = [];
    } else if (currentSection) {
      // For Boilerplate section, preserve all lines including empty ones for code formatting
      // For other sections, only add non-empty lines
      if (currentSection === 'Boilerplate') {
        sectionContent.push(line);
      } else if (trimmed.length > 0) {
        sectionContent.push(line);
      }
    }
  }

  // Save last section
  if (currentSection && sectionContent.length > 0) {
    const content = sectionContent.join('\n').trim();
    switch (currentSection) {
      case 'Order':
        data.order = parseInt(content);
        break;
      case 'Title':
        data.title = content;
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
      case 'Boilerplate':
        data.boilerplate = sectionContent.join('\n').trim();
        break;
      case 'Requirements':
        data.requirements = parseRequirements(sectionContent);
        break;
    }
  }

  return data as LevelData;
}

/**
 * Parse requirements from section content
 */
function parseRequirements(sectionContent: string[]): LevelRequirements {
  const requirements: LevelRequirements = {};
  
  for (const line of sectionContent) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Parse key: value format
    const match = trimmed.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const key = match[1];
      const value = match[2].trim();
      
      switch (key) {
        case 'maxMoves':
          requirements.maxMoves = parseInt(value);
          break;
        case 'mustUseLoop':
          requirements.mustUseLoop = value.toLowerCase() === 'true';
          break;
        case 'mustUseFunction':
          requirements.mustUseFunction = value.toLowerCase() === 'true';
          break;
        case 'mustUseConditional':
          requirements.mustUseConditional = value.toLowerCase() === 'true';
          break;
        case 'mustUseWhile':
          requirements.mustUseWhile = value.toLowerCase() === 'true';
          break;
        case 'mustUseFor':
          requirements.mustUseFor = value.toLowerCase() === 'true';
          break;
      }
    }
  }
  
  return requirements;
}

/**
 * Validate code against level requirements
 */
export function validateRequirements(
  code: string,
  requirements: LevelRequirements | undefined,
  moves: number
): { passed: boolean; failures: string[] } {
  if (!requirements) {
    return { passed: true, failures: [] };
  }

  const failures: string[] = [];

  // Check maxMoves
  if (requirements.maxMoves !== undefined && moves > requirements.maxMoves) {
    failures.push(`Used ${moves} moves, but maximum allowed is ${requirements.maxMoves}`);
  }

  // Check mustUseLoop (either for or while)
  if (requirements.mustUseLoop) {
    const hasForLoop = /for\s*\(/.test(code);
    const hasWhileLoop = /while\s*\(/.test(code);
    if (!hasForLoop && !hasWhileLoop) {
      failures.push('Must use a loop (for or while)');
    }
  }

  // Check mustUseWhile
  if (requirements.mustUseWhile) {
    const hasWhileLoop = /while\s*\(/.test(code);
    if (!hasWhileLoop) {
      failures.push('Must use a while loop');
    }
  }

  // Check mustUseFor
  if (requirements.mustUseFor) {
    const hasForLoop = /for\s*\(/.test(code);
    if (!hasForLoop) {
      failures.push('Must use a for loop');
    }
  }

  // Check mustUseFunction (custom function, not solveMaze)
  if (requirements.mustUseFunction) {
    // Count function definitions, excluding solveMaze
    const functionMatches = code.match(/function\s+(\w+)\s*\(/g) || [];
    const customFunctions = functionMatches.filter(
      (match) => !match.includes('solveMaze')
    );
    if (customFunctions.length === 0) {
      failures.push('Must define and use a custom function');
    }
  }

  // Check mustUseConditional
  if (requirements.mustUseConditional) {
    const hasIf = /if\s*\(/.test(code);
    const hasTernary = /\?.*:/.test(code);
    if (!hasIf && !hasTernary) {
      failures.push('Must use conditional logic (if/else)');
    }
  }

  return {
    passed: failures.length === 0,
    failures,
  };
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

