import { redirect } from 'next/navigation';

export default async function GamePage() {
  // Redirect to level 1 by default
  redirect('/game/1');
}
