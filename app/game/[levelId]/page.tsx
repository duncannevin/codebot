import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import GameInterface from '@/components/game/GameInterface';
import { getUserProgress } from '@/lib/db/user-progress';

export default async function GamePage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { levelId } = await params;
  const levelNumber = parseInt(levelId);

  // Validate level number
  if (isNaN(levelNumber) || levelNumber < 1) {
    redirect('/game/1');
  }

  // Check user progress to ensure they can access this level
  const progress = await getUserProgress(user.id);
  const currentLevel = progress?.current_level || 1;

  // Users can only access levels up to their current level
  // Allow access to level 1 even if current_level is 1 (they're on level 1)
  if (levelNumber > currentLevel) {
    // Redirect to their current level
    redirect(`/game/${currentLevel}`);
  }

  return <GameInterface user={user} initialLevel={levelNumber} />;
}

