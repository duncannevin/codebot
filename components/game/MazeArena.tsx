'use client';

import Image from 'next/image';
import { GameState } from '@/types/game';

interface MazeArenaProps {
  gameState: GameState;
  title?: string;
}

export default function MazeArena({ gameState, title }: MazeArenaProps) {
  const { maze, robot, goal } = gameState;
  const cellSize = 70;

  const getCellImage = (cell: GameState['maze'][0][0], x: number, y: number) => {
    if (cell.type === 'wall') {
      return '/codebot-assets/wall.svg';
    }
    if (cell.type === 'start') {
      return '/codebot-assets/start.svg';
    }
    if (cell.type === 'goal') {
      return '/codebot-assets/goal.svg';
    }
    return '/codebot-assets/path.svg';
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-center text-lg font-bold text-slate-800">{title || 'Maze Arena'}</h2>
      
      <div className="mx-auto rounded-lg border border-gray-200 bg-slate-50 p-4">
        <div className="relative" style={{ width: maze[0].length * cellSize, height: maze.length * cellSize }}>
          {/* Maze Grid */}
          {maze.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className="absolute border-2 border-white"
                style={{
                  left: x * cellSize,
                  top: y * cellSize,
                  width: cellSize,
                  height: cellSize,
                }}
              >
                <Image
                  src={getCellImage(cell, x, y)}
                  alt={cell.type}
                  width={cellSize}
                  height={cellSize}
                  className="h-full w-full"
                />
              </div>
            ))
          )}

          {/* Robot */}
          <div
            className="absolute z-10 flex items-center justify-center"
            style={{
              left: robot.position.x * cellSize,
              top: robot.position.y * cellSize,
              width: cellSize,
              height: cellSize,
              transition: gameState.isExecuting ? 'all 0.3s ease-in-out' : 'none',
            }}
          >
            <Image
              src={
                robot.hasReachedGoal
                  ? '/codebot-assets/robot-success.svg'
                  : '/codebot-assets/robot-default.svg'
              }
              alt="Robot"
              width={48}
              height={48}
              className="h-12 w-12"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

