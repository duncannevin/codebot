import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import GameInterface from '@/components/game/GameInterface';

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

  return <GameInterface user={user} initialLevel={levelNumber} />;
}

