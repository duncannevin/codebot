'use client';

import { GameState } from '@/types/game';

interface GameStatsProps {
  gameState: GameState;
}

export default function GameStats({ gameState }: GameStatsProps) {
  return (
    <div className="absolute right-6 top-32 w-64 space-y-3">
      {/* Level Stats */}
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
            <span className="font-semibold text-blue-600">0:00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Attempts:</span>
            <span className="font-semibold text-blue-600">1</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Best Score:</span>
            <span className="font-semibold text-green-600">⭐⭐⭐</span>
          </div>
        </div>
      </div>

      {/* Available Functions */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-center text-sm font-semibold text-slate-800">
          Available Functions
        </h3>
        <div className="space-y-1 font-mono text-xs text-blue-500">
          <div>robot.moveUp()</div>
          <div>robot.moveDown()</div>
          <div>robot.moveLeft()</div>
          <div>robot.moveRight()</div>
          <div>robot.canMove(direction)</div>
          <div>robot.atGoal()</div>
        </div>
      </div>
    </div>
  );
}

