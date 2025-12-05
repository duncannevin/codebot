import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserProgress } from '@/lib/db/user-progress';

export default async function GamePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's current level and redirect to it
  const progress = await getUserProgress(user.id);
  const currentLevel = progress?.current_level || 1;
  
  redirect(`/game/${currentLevel}`);
}
