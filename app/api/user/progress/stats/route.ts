import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateLevelStats, getLevelStats } from '@/lib/db/user-progress';

export async function GET(
  request: NextRequest,
  { params }: { params?: { levelId?: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = parseInt(searchParams.get('level') || '0');

    if (isNaN(level) || level < 1) {
      return NextResponse.json(
        { error: 'Invalid level number' },
        { status: 400 }
      );
    }

    const stats = await getLevelStats(user.id, level);
    return NextResponse.json(stats || { attempts: 0 });
  } catch (error: any) {
    console.error('Error fetching level stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { level, moves, time, incrementAttempts } = body;

    if (
      typeof level !== 'number' ||
      typeof moves !== 'number' ||
      typeof time !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const success = await updateLevelStats(
      user.id,
      level,
      moves,
      time,
      incrementAttempts === true
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating level stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

