'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import MazeArena from './MazeArena';
import CodeEditor from './CodeEditor';
import GameControls from './GameControls';
import GameStats from './GameStats';
import { GameState, Position } from '@/types/game';

interface GameInterfaceProps {
  user: User;
}

// Sample maze data - in production, this would come from a database
const createSampleMaze = (): GameState => {
  const size = 8;
  const maze: GameState['maze'] = [];
  
  // Create empty maze
  for (let y = 0; y < size; y++) {
    maze[y] = [];
    for (let x = 0; x < size; x++) {
      maze[y][x] = {
        type: 'path',
        position: { x, y },
      };
    }
  }

  // Add walls based on wireframe pattern
  const walls = [
    { x: 2, y: 0 }, { x: 5, y: 0 },
    { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 6, y: 1 },
    { x: 4, y: 2 }, { x: 7, y: 2 },
    { x: 0, y: 3 }, { x: 2, y: 3 }, { x: 5, y: 3 },
    { x: 3, y: 4 }, { x: 7, y: 4 },
    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 4, y: 5 }, { x: 6, y: 5 },
    { x: 2, y: 6 },
  ];

  walls.forEach(({ x, y }) => {
    if (maze[y] && maze[y][x]) {
      maze[y][x].type = 'wall';
    }
  });

  const start: Position = { x: 0, y: 0 };
  const goal: Position = { x: 7, y: 6 };

  maze[start.y][start.x].type = 'start';
  maze[goal.y][goal.x].type = 'goal';

  return {
    maze,
    robot: {
      position: { ...start },
      hasReachedGoal: false,
    },
    goal,
    start,
    moves: 0,
    maxMoves: 10,
    isExecuting: false,
    isPaused: false,
    executionSpeed: 500,
  };
};

export default function GameInterface({ user }: GameInterfaceProps) {
  const [gameState, setGameState] = useState<GameState>(createSampleMaze());
  const [code, setCode] = useState(`async function solveMaze() {
  // Navigate to the goal
  for (let i = 0; i < 3; i++) {
    await robot.moveRight();
  }
  await robot.moveDown();
}

solveMaze();`);
  const [activeTab, setActiveTab] = useState<'code' | 'instructions' | 'hints'>('code');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [level, setLevel] = useState(5);
  const [progress, setProgress] = useState({ current: 12, total: 20 });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection (optional - falls back to HTTP if not available)
    let ws: WebSocket | null = null;
    let connectionTimeout: NodeJS.Timeout;
    
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Try connecting to a separate WebSocket server on port 3001 for development
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? 'ws://localhost:3001'
        : `${protocol}//${window.location.host}/api/game/ws`;
      
      try {
        console.log('[WebSocket Client] Attempting to connect to:', wsUrl);
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        // Set a timeout for connection
        connectionTimeout = setTimeout(() => {
          if (ws && ws.readyState !== WebSocket.OPEN) {
            console.warn('[WebSocket Client] Connection timeout, will use HTTP fallback');
            ws.close();
            wsRef.current = null;
          }
        }, 3000); // 3 second timeout

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('[WebSocket Client] Connected to WebSocket server');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[WebSocket Client] Received message:', JSON.stringify(data, null, 2));
            
            if (data.type === 'robot_move') {
              setGameState((prev) => ({
                ...prev,
                robot: {
                  ...prev.robot,
                  position: data.position,
                  hasReachedGoal: data.reachedGoal,
                },
                moves: data.moves,
              }));
              setConsoleOutput((prev) => [...prev, data.message]);
            } else if (data.type === 'execution_complete') {
              setGameState((prev) => ({
                ...prev,
                isExecuting: false,
                robot: {
                  ...prev.robot,
                  hasReachedGoal: data.result?.reachedGoal || false,
                },
              }));
              setConsoleOutput((prev) => [...prev, data.result?.message || 'Execution complete']);
            } else if (data.type === 'error') {
              setGameState((prev) => ({
                ...prev,
                isExecuting: false,
              }));
              setConsoleOutput((prev) => [...prev, `Error: ${data.message}`]);
            } else if (data.type === 'console_log') {
              setConsoleOutput((prev) => [...prev, data.message]);
            }
          } catch (error) {
            console.error('[WebSocket Client] Error parsing message:', error);
          }
        };

        ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.warn('[WebSocket Client] Connection error, will use HTTP fallback');
          wsRef.current = null;
        };

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('[WebSocket Client] Disconnected', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          wsRef.current = null;
        };
      } catch (error) {
        clearTimeout(connectionTimeout);
        console.warn('[WebSocket Client] Failed to create WebSocket, will use HTTP fallback:', error);
        wsRef.current = null;
      }
    };

    // Only try to connect in development if explicitly running with WebSocket server
    // In production or if WebSocket server isn't running, it will gracefully fall back
    connectWebSocket();

    return () => {
      clearTimeout(connectionTimeout);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, []);

  const handleRunCode = async () => {
    setGameState((prev) => ({
      ...prev,
      isExecuting: true,
      robot: { ...prev.robot, position: { ...prev.start }, hasReachedGoal: false },
      moves: 0,
    }));
    setConsoleOutput(['▶ Executing code...']);

    try {
      // Try WebSocket first, fallback to HTTP polling
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const message = {
          type: 'execute_code',
          code,
          gameState,
          speed: gameState.executionSpeed,
        };
        console.log('[WebSocket Client] Sending execute_code:', JSON.stringify(message, null, 2));
        wsRef.current.send(JSON.stringify(message));
        return; // Exit early if using WebSocket
      } else {
        console.log('[WebSocket Client] WebSocket not available, using HTTP fallback');
        // Fallback to HTTP API with polling
        const response = await fetch('/api/game/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            mazeId: 'level-5',
            executionMode: 'run',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          setConsoleOutput((prev) => [...prev, `Error: ${error.message}`]);
          setGameState((prev) => ({ ...prev, isExecuting: false }));
          return;
        }

        const data = await response.json();
        
        // Process events with delays for visualization (HTTP fallback)
        if (data.events && data.events.length > 0) {
          for (const event of data.events) {
            // Small delay to show movement animation
            await new Promise((resolve) => setTimeout(resolve, gameState.executionSpeed));
            
            if (event.type === 'robot_move') {
              setGameState((prev) => ({
                ...prev,
                robot: {
                  ...prev.robot,
                  position: event.position,
                  hasReachedGoal: event.reachedGoal,
                },
                moves: event.moves,
              }));
              setConsoleOutput((prev) => [...prev, event.message]);
            }
          }
        }

        // Show final result
        if (data.result) {
          setConsoleOutput((prev) => [...prev, data.result.message]);
          setGameState((prev) => ({
            ...prev,
            isExecuting: false,
            robot: {
              ...prev.robot,
              hasReachedGoal: data.result.reachedGoal,
            },
          }));
        } else {
          setGameState((prev) => ({ ...prev, isExecuting: false }));
        }
      }
    } catch (error: any) {
      setConsoleOutput((prev) => [...prev, `Error: ${error.message}`]);
      setGameState((prev) => ({ ...prev, isExecuting: false }));
    }
  };

  const handleStep = async () => {
    // Step mode implementation
    setConsoleOutput(['Step mode not yet implemented']);
  };

  const handleReset = () => {
    setGameState((prev) => ({
      ...prev,
      robot: { ...prev.robot, position: { ...prev.start }, hasReachedGoal: false },
      moves: 0,
      isExecuting: false,
    }));
    setConsoleOutput([]);
  };

  const handleSpeedChange = (speed: number) => {
    setGameState((prev) => ({ ...prev, executionSpeed: speed }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/codebot-assets/logo-icon.svg"
              alt="Code Bot Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-blue-600">Code Bot</span>
          </Link>

          {/* Level Info */}
          <div className="rounded-lg border border-gray-200 bg-slate-50 px-4 py-2">
            <span className="text-sm font-semibold text-slate-800">
              Level {level}: Loop Challenge
            </span>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="h-5 w-48 rounded-full bg-gray-200">
              <div
                className="h-5 rounded-full bg-green-500"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-800">
              {progress.current}/{progress.total} Levels
            </span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
              <span className="text-sm font-bold text-white">
                {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm text-slate-600">
              {user.user_metadata?.full_name || user.email}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative mx-auto flex max-w-[1400px] gap-6 p-6">
        {/* Left Panel - Maze Arena */}
        <div className="flex-1">
          <MazeArena gameState={gameState} />
          <GameControls
            onRun={handleRunCode}
            onStep={handleStep}
            onReset={handleReset}
            onSpeedChange={handleSpeedChange}
            isExecuting={gameState.isExecuting}
            speed={gameState.executionSpeed}
          />
        </div>

        {/* Right Panel - Code Editor & Info */}
        <div className="w-[640px]">
          <div className="rounded-t-xl border border-b-0 border-gray-200 bg-white">
            {/* Tabs */}
            <div className="flex">
              <button
                onClick={() => setActiveTab('code')}
                className={`rounded-tl-xl px-6 py-3 text-sm font-semibold ${
                  activeTab === 'code'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`px-6 py-3 text-sm font-semibold ${
                  activeTab === 'instructions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                Instructions
              </button>
              <button
                onClick={() => setActiveTab('hints')}
                className={`rounded-tr-xl px-6 py-3 text-sm font-semibold ${
                  activeTab === 'hints'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                Hints
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="rounded-b-xl border border-gray-200 bg-white">
            {activeTab === 'code' && (
              <CodeEditor code={code} onChange={setCode} consoleOutput={consoleOutput} />
            )}
            {activeTab === 'instructions' && (
              <div className="p-6">
                <h3 className="mb-4 font-semibold text-slate-800">Challenge Objective:</h3>
                <p className="mb-2 text-sm text-slate-600">
                  Use a loop to move the robot to the goal position (🎯)
                </p>
                <p className="mb-4 text-sm text-slate-600">Bonus: Complete in under 10 moves!</p>
                <div className="mt-4 rounded-lg bg-blue-50 p-3">
                  <p className="text-xs font-semibold text-blue-800 mb-1">💡 Tip:</p>
                  <p className="text-xs text-blue-700">
                    Use <code className="bg-blue-100 px-1 rounded">await</code> with robot movements to see them in real-time!
                    <br />
                    Example: <code className="bg-blue-100 px-1 rounded">await robot.moveRight()</code>
                  </p>
                </div>
              </div>
            )}
            {activeTab === 'hints' && (
              <div className="p-6">
                <h3 className="mb-4 font-semibold text-slate-800">Hints:</h3>
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                  <li>Use a for loop to repeat movements</li>
                  <li>Remember: <code>await robot.moveRight()</code> moves one cell</li>
                  <li>You need to move right 3 times, then down</li>
                  <li>Make your function async and use await for each movement</li>
                </ul>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-slate-50 p-6">
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-semibold text-slate-800">
                Challenge Objective:
              </h4>
              <p className="text-xs text-slate-600">
                Use a loop to move the robot to the goal position (🎯)
              </p>
              <p className="text-xs text-slate-600">Bonus: Complete in under 10 moves!</p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-lg border-2 border-slate-400 px-4 py-2 text-sm font-semibold text-slate-600">
                ← Previous
              </button>
              <button className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-800">
                💡 Get Hint
              </button>
              <button className="ml-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                Submit →
              </button>
            </div>
          </div>
        </div>

        {/* Floating Stats Panel */}
        <GameStats gameState={gameState} />
      </div>
    </div>
  );
}

