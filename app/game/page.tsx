import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import GameInterface from '@/components/game/GameInterface';

export default async function GamePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <GameInterface user={user} />;
}
