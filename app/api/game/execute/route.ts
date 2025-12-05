import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CodeExecutor } from '@/lib/game/code-executor';
import { GameState } from '@/types/game';

// Sample maze - in production, fetch from database
function createGameState(): GameState {
  const size = 8;
  const maze: GameState['maze'] = [];
  
  for (let y = 0; y < size; y++) {
    maze[y] = [];
    for (let x = 0; x < size; x++) {
      maze[y][x] = {
        type: 'path',
        position: { x, y },
      };
    }
  }

  const walls = [
    { x: 2, y: 0 }, { x: 5, y: 0 },
    { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 6, y: 1 },
    { x: 4, y: 2 }, { x: 7, y: 2 },
    { x: 0, y: 3 }, { x: 2, y: 3 }, { x: 5, y: 3 },
    { x: 3, y: 4 }, { x: 7, y: 4 },
    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 4, y: 5 }, { x: 6, y: 5 },
    { x: 2, y: 6 },
  ];

  walls.forEach(({ x, y }) => {
    if (maze[y] && maze[y][x]) {
      maze[y][x].type = 'wall';
    }
  });

  const start = { x: 0, y: 0 };
  const goal = { x: 7, y: 6 };

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
    maxMoves: 10,
    isExecuting: false,
    isPaused: false,
    executionSpeed: 500,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, mazeId, executionMode } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Create game state
    const gameState = createGameState();
    const executor = new CodeExecutor(gameState);

    // Store execution events
    const events: any[] = [];

    executor.onMove((data) => {
      events.push(data);
    });

    // Execute code
    const result = await executor.execute(code, gameState.executionSpeed);

    return NextResponse.json({
      success: true,
      result,
      events,
    });
  } catch (error: any) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}

