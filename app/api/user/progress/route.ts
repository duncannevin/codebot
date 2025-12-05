import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserProgress, saveUserProgress, UserProgress } from '@/lib/db/user-progress';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const progress = await getUserProgress(user.id);

    if (!progress) {
      // Return default progress for new users
      return NextResponse.json({
        current_level: 1,
        completed_levels: [],
        total_moves: 0,
        total_time: 0,
        best_scores: {},
      });
    }

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error('Error fetching user progress:', error);
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
    const progress: UserProgress = {
      user_id: user.id,
      current_level: body.current_level || 1,
      completed_levels: body.completed_levels || [],
      total_moves: body.total_moves || 0,
      total_time: body.total_time || 0,
      best_scores: body.best_scores || {},
    };

    const success = await saveUserProgress(progress);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving user progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

