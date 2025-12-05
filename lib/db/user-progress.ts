import { createClient } from '@/lib/supabase/server';

export interface UserProgress {
  id?: string;
  user_id: string;
  current_level: number;
  completed_levels: number[];
  total_moves: number;
  total_time: number;
  best_scores: Record<number, {
    moves: number;
    time: number;
    completed_at: string;
  }>;
  updated_at?: string;
  created_at?: string;
}

export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user hasn't started yet
        return null;
      }
      console.error('Error fetching user progress:', error);
      return null;
    }

    return data as UserProgress;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return null;
  }
}

export async function saveUserProgress(progress: UserProgress): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Check if progress exists
    const existing = await getUserProgress(progress.user_id);
    
    if (existing) {
      // Update existing progress
      const { error } = await supabase
        .from('user_progress')
        .update({
          current_level: progress.current_level,
          completed_levels: progress.completed_levels,
          total_moves: progress.total_moves,
          total_time: progress.total_time,
          best_scores: progress.best_scores,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', progress.user_id);

      if (error) {
        console.error('Error updating user progress:', error);
        return false;
      }
    } else {
      // Insert new progress
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: progress.user_id,
          current_level: progress.current_level,
          completed_levels: progress.completed_levels,
          total_moves: progress.total_moves,
          total_time: progress.total_time,
          best_scores: progress.best_scores,
        });

      if (error) {
        console.error('Error creating user progress:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error saving user progress:', error);
    return false;
  }
}

export async function updateLevelCompletion(
  userId: string,
  level: number,
  moves: number,
  time: number
): Promise<boolean> {
  try {
    const currentProgress = await getUserProgress(userId);
    
    if (!currentProgress) {
      // Create new progress starting from this level
      const newProgress: UserProgress = {
        user_id: userId,
        current_level: level + 1,
        completed_levels: [level],
        total_moves: moves,
        total_time: time,
        best_scores: {
          [level]: {
            moves,
            time,
            completed_at: new Date().toISOString(),
          },
        },
      };
      return await saveUserProgress(newProgress);
    }

    // Update existing progress
    const completedLevels = [...new Set([...currentProgress.completed_levels, level])];
    const bestScores = { ...currentProgress.best_scores };
    
    // Update best score if this is better or first completion
    if (!bestScores[level] || moves < bestScores[level].moves) {
      bestScores[level] = {
        moves,
        time,
        completed_at: new Date().toISOString(),
      };
    }

    const updatedProgress: UserProgress = {
      ...currentProgress,
      current_level: Math.max(currentProgress.current_level, level + 1),
      completed_levels: completedLevels,
      total_moves: currentProgress.total_moves + moves,
      total_time: currentProgress.total_time + time,
      best_scores: bestScores,
    };

    return await saveUserProgress(updatedProgress);
  } catch (error) {
    console.error('Error updating level completion:', error);
    return false;
  }
}

