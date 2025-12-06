import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HTTPCodeExecutor } from '@/lib/game/http-code-executor';
import { GameState } from '@/types/game';
import { loadLevel } from '@/lib/game/level-parser';

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
    const { code, mazeId, executionMode, levelId, gameState: clientGameState, speed } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Get game state and requirements from level or use provided gameState
    let gameState: GameState;
    let requirements;
    if (clientGameState) {
      // Use gameState provided by client (from level data)
      gameState = clientGameState as GameState;
      // Requirements should be passed from client if available
      requirements = body.requirements;
    } else if (levelId) {
      // Load level and use its gameState and requirements
      try {
        const level = loadLevel(parseInt(levelId));
        gameState = level.gameState;
        requirements = level.requirements;
      } catch (error: any) {
        return NextResponse.json(
          { error: `Failed to load level: ${error.message}` },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Either gameState or levelId must be provided' },
        { status: 400 }
      );
    }

    // Use HTTPCodeExecutor for immediate frame collection
    const executor = new HTTPCodeExecutor(gameState, requirements, user.id, levelId ? parseInt(levelId) : undefined);

    // Execute code and get all events immediately
    const { events, result } = await executor.execute(code);

    return NextResponse.json({
      success: true,
      events,
      result,
    });
  } catch (error: any) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}

