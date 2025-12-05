'use client';

import { GameState } from '@/types/game';

interface LevelStats {
  attempts: number;
  best_moves?: number;
  best_time?: number;
}

interface GameStatsProps {
  gameState: GameState;
  levelStats?: LevelStats;
  elapsedTime?: number;
}

function formatTime(seconds: number | undefined): string {
  if (!seconds && seconds !== 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getStarRating(bestMoves: number | undefined, maxMoves: number): string {
  if (!bestMoves) return '---';
  const percentage = (maxMoves - bestMoves) / maxMoves;
  if (percentage >= 0.5) return '⭐⭐⭐';
  if (percentage >= 0.25) return '⭐⭐';
  return '⭐';
}

export default function GameStats({ gameState, levelStats, elapsedTime }: GameStatsProps) {
  const attempts = levelStats?.attempts || 0;
  const bestMoves = levelStats?.best_moves;
  const bestTime = levelStats?.best_time;
  const currentTime = elapsedTime || 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-center text-sm font-semibold text-slate-800">Level Stats</h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-600">Moves:</span>
          <span className="font-semibold text-blue-600">
            {gameState.moves} / {gameState.maxMoves}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Time:</span>
          <span className="font-semibold text-blue-600">
            {formatTime(currentTime)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Attempts:</span>
          <span className="font-semibold text-blue-600">{attempts || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Best Score:</span>
          <span className="font-semibold text-green-600">
            {bestMoves ? (
              <span>
                {getStarRating(bestMoves, gameState.maxMoves)} ({bestMoves} moves, {formatTime(bestTime)})
              </span>
            ) : (
              '---'
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

