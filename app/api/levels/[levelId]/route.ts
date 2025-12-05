import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loadLevel, getAvailableLevels } from '@/lib/game/level-parser';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ levelId: string }> }
) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { levelId } = await params;
    const levelNumber = parseInt(levelId);

    if (isNaN(levelNumber) || levelNumber < 1) {
      return NextResponse.json(
        { error: 'Invalid level number' },
        { status: 400 }
      );
    }

    try {
      const level = loadLevel(levelNumber);
      return NextResponse.json(level);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Level not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Error loading level:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

