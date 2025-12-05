'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import MazeArena from './MazeArena';
import CodeEditor from './CodeEditor';
import GameControls from './GameControls';
import GameStats from './GameStats';
import { GameState, Position } from '@/types/game';

interface GameInterfaceProps {
  user: User;
  initialLevel?: number;
}

interface LevelData {
  order: number;
  objective: string;
  gameboard: string[];
  tip: string;
  availableFunctions: string[];
  hints: string[];
  gameState: GameState;
}

export default function GameInterface({ user, initialLevel }: GameInterfaceProps) {
  const router = useRouter();
  const params = useParams();
  const [level, setLevel] = useState(initialLevel || parseInt(params?.levelId as string) || 1);
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'code' | 'instructions' | 'hints' | 'stats' | 'functions'>('code');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [totalLevels, setTotalLevels] = useState(10);
  const [progress, setProgress] = useState({ current: 1, total: 10 });
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showWinModal, setShowWinModal] = useState(false);
  const [hasShownWinModal, setHasShownWinModal] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch level data
  useEffect(() => {
    const fetchLevel = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/levels/${level}`);
        if (!response.ok) {
          if (response.status === 403) {
            // Level is locked, redirect to max unlocked level
            router.push(`/game/${maxUnlockedLevel}`);
            return;
          }
          throw new Error('Failed to load level');
        }
        const data: LevelData = await response.json();
        setLevelData(data);
        setGameState(data.gameState);
        setCode(`function solveMaze() {
  
}

solveMaze();`);
        setConsoleOutput([]);
        setShowWinModal(false);
        setHasShownWinModal(false);
        setStartTime(null);
      } catch (error) {
        console.error('Error loading level:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLevel();
  }, [level, maxUnlockedLevel, router]);

  // Fetch total levels count and user progress
  useEffect(() => {
    const fetchLevelsAndProgress = async () => {
      try {
        let totalLevelsCount = 10;
        
        // Fetch levels
        const levelsResponse = await fetch('/api/levels');
        if (levelsResponse.ok) {
          const levelsData = await levelsResponse.json();
          totalLevelsCount = levelsData.total;
          setTotalLevels(levelsData.total);
          setProgress((prev) => ({ ...prev, total: levelsData.total }));
        }

        // Fetch user progress
        const progressResponse = await fetch('/api/user/progress');
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          const userCurrentLevel = progressData.current_level || 1;
          setMaxUnlockedLevel(userCurrentLevel);
          
          // Update progress state with current level from URL or initial level
          const currentUrlLevel = parseInt(params?.levelId as string) || initialLevel || 1;
          // Only update if the level is valid (server-side redirect will handle locked levels)
          if (currentUrlLevel >= 1 && currentUrlLevel <= userCurrentLevel) {
            setProgress((prev) => ({ ...prev, current: currentUrlLevel }));
          } else {
            setProgress((prev) => ({ ...prev, current: userCurrentLevel }));
          }
        }
      } catch (error) {
        console.error('Error fetching levels/progress:', error);
      }
    };

    fetchLevelsAndProgress();
  }, [router]);

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
              setGameState((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  robot: {
                    ...prev.robot,
                    position: data.position,
                    hasReachedGoal: data.reachedGoal,
                  },
                  moves: data.moves,
                };
              });
              setConsoleOutput((prev) => [...prev, data.message]);
              // Show win modal when goal is reached
              if (data.reachedGoal && !hasShownWinModal) {
                setShowWinModal(true);
                setHasShownWinModal(true);
                // Save progress when level is completed
                if (gameState && startTime) {
                  const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
                  fetch('/api/user/progress/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      level,
                      moves: gameState.moves,
                      time: timeElapsed,
                    }),
                  }).catch((error) => {
                    console.error('Error saving progress:', error);
                  });
                }
              }
            } else if (data.type === 'execution_complete') {
              setGameState((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  isExecuting: false,
                  robot: {
                    ...prev.robot,
                    hasReachedGoal: data.result?.reachedGoal || false,
                  },
                };
              });
              setConsoleOutput((prev) => [...prev, data.result?.message || 'Execution complete']);
              // Show win modal when execution completes and goal is reached
              if (data.result?.reachedGoal && !hasShownWinModal) {
                setShowWinModal(true);
                setHasShownWinModal(true);
              }
            } else if (data.type === 'error') {
              setGameState((prev) => {
                if (!prev) return prev;
                return { ...prev, isExecuting: false };
              });
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
    if (!gameState) return;

    // Start timer for this attempt
    setStartTime(Date.now());

    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        isExecuting: true,
        robot: { ...prev.robot, position: { ...prev.start }, hasReachedGoal: false },
        moves: 0,
      };
    });
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
            levelId: level.toString(),
            gameState,
            executionMode: 'run',
            speed: gameState.executionSpeed,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          setConsoleOutput((prev) => [...prev, `Error: ${error.message}`]);
          setGameState((prev) => {
            if (!prev) return prev;
            return { ...prev, isExecuting: false };
          });
          return;
        }

        const data = await response.json();
        
        // Process events with delays for visualization (HTTP fallback)
        if (data.events && data.events.length > 0) {
          for (const event of data.events) {
            // Small delay to show movement animation
            await new Promise((resolve) => setTimeout(resolve, gameState?.executionSpeed || 500));
            
            if (event.type === 'robot_move') {
              setGameState((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  robot: {
                    ...prev.robot,
                    position: event.position,
                    hasReachedGoal: event.reachedGoal,
                  },
                  moves: event.moves,
                };
              });
              setConsoleOutput((prev) => [...prev, event.message]);
              // Show win modal when goal is reached
              if (event.reachedGoal && !hasShownWinModal) {
                setShowWinModal(true);
                setHasShownWinModal(true);
              }
            }
          }
        }

        // Show final result
        if (data.result) {
          setConsoleOutput((prev) => [...prev, data.result.message]);
          setGameState((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              isExecuting: false,
              robot: {
                ...prev.robot,
                hasReachedGoal: data.result.reachedGoal,
              },
            };
          });
          // Show win modal when execution completes and goal is reached
          if (data.result.reachedGoal && !hasShownWinModal) {
            setShowWinModal(true);
            setHasShownWinModal(true);
            // Save progress when level is completed
            if (gameState && startTime) {
              const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
              fetch('/api/user/progress/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  level,
                  moves: gameState.moves,
                  time: timeElapsed,
                }),
              }).catch((error) => {
                console.error('Error saving progress:', error);
              });
            }
          }
        } else {
          setGameState((prev) => {
            if (!prev) return prev;
            return { ...prev, isExecuting: false };
          });
        }
      }
    } catch (error: any) {
      setConsoleOutput((prev) => [...prev, `Error: ${error.message}`]);
      setGameState((prev) => {
        if (!prev) return prev;
        return { ...prev, isExecuting: false };
      });
    }
  };

  const handleStep = async () => {
    // Step mode implementation
    setConsoleOutput(['Step mode not yet implemented']);
  };

  const handleReset = () => {
    if (!gameState) return;
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        robot: { ...prev.robot, position: { ...prev.start }, hasReachedGoal: false },
        moves: 0,
        isExecuting: false,
      };
    });
    setConsoleOutput([]);
    setShowWinModal(false);
    setHasShownWinModal(false);
  };

  const handleSpeedChange = (speed: number) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return { ...prev, executionSpeed: speed };
    });
  };

  const handleLevelChange = (newLevel: number) => {
    // Users can only access levels up to their current unlocked level
    if (newLevel >= 1 && newLevel <= totalLevels && newLevel <= maxUnlockedLevel) {
      setLevel(newLevel);
      setProgress((prev) => ({ ...prev, current: newLevel }));
      setShowWinModal(false);
      setHasShownWinModal(false);
      // Update URL without page reload
      router.push(`/game/${newLevel}`);
    } else if (newLevel > maxUnlockedLevel) {
      // Prevent navigation to locked levels
      console.warn(`Level ${newLevel} is not yet unlocked. Complete previous levels first.`);
    }
  };

  const handleNextLevel = async () => {
    if (level < totalLevels) {
      // Save progress before moving to next level
      if (gameState && startTime) {
        const timeElapsed = Math.floor((Date.now() - startTime) / 1000); // in seconds
        try {
          const response = await fetch('/api/user/progress/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              level,
              moves: gameState.moves,
              time: timeElapsed,
            }),
          });
          
          if (response.ok) {
            // Update max unlocked level after completing a level
            const progressData = await fetch('/api/user/progress').then(res => res.json());
            if (progressData.current_level) {
              setMaxUnlockedLevel(progressData.current_level);
            }
          }
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      }
      handleLevelChange(level + 1);
    }
  };

  const handleStayOnLevel = () => {
    setShowWinModal(false);
  };

  // Sync level with URL params when they change (only when URL changes, not when level state changes)
  useEffect(() => {
    const urlLevel = parseInt(params?.levelId as string);
    if (!isNaN(urlLevel) && urlLevel >= 1 && urlLevel !== level) {
      // Only allow syncing to levels that are unlocked
      if (urlLevel <= maxUnlockedLevel) {
        setLevel(urlLevel);
        setProgress((prev) => ({ ...prev, current: urlLevel }));
      } else {
        // Redirect to max unlocked level if trying to access locked level
        router.push(`/game/${maxUnlockedLevel}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.levelId, maxUnlockedLevel]);

  if (loading || !gameState || !levelData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLevelChange(level - 1)}
              disabled={level <= 1}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ←
            </button>
            <div className="rounded-lg border border-gray-200 bg-slate-50 px-4 py-2">
              <span className="text-sm font-semibold text-slate-800">
                Level {level}
              </span>
            </div>
            <button
              onClick={() => handleLevelChange(level + 1)}
              disabled={level >= totalLevels}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              →
            </button>
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
        <div className="w-[640px] overflow-hidden">
          <div className="rounded-t-xl border border-b-0 border-gray-200 bg-white overflow-hidden">
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
                className={`px-6 py-3 text-sm font-semibold ${
                  activeTab === 'hints'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                Hints
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-3 text-sm font-semibold ${
                  activeTab === 'stats'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                Stats
              </button>
              <button
                onClick={() => setActiveTab('functions')}
                className={`rounded-tr-xl px-6 py-3 text-sm font-semibold ${
                  activeTab === 'functions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                Functions
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="rounded-b-xl border border-gray-200 bg-white overflow-hidden">
            {activeTab === 'code' && (
              <CodeEditor code={code} onChange={setCode} consoleOutput={consoleOutput} />
            )}
            {activeTab === 'instructions' && levelData && (
              <div className="p-6">
                <h3 className="mb-4 font-semibold text-slate-800">Challenge Objective:</h3>
                <p className="mb-4 text-sm text-slate-600 whitespace-pre-line">
                  {levelData.objective}
                </p>
                <div className="mt-4 rounded-lg bg-blue-50 p-3">
                  <p className="text-xs font-semibold text-blue-800 mb-1">💡 Tip:</p>
                  <p className="text-xs text-blue-700 whitespace-pre-line">
                    {levelData.tip}
                  </p>
                </div>
              </div>
            )}
            {activeTab === 'hints' && levelData && (
              <div className="p-6">
                <h3 className="mb-4 font-semibold text-slate-800">Hints:</h3>
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                  {levelData.hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'stats' && (
              <div className="p-6">
                <GameStats gameState={gameState} />
              </div>
            )}
            {activeTab === 'functions' && (
              <div className="p-6">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="mb-3 text-center text-sm font-semibold text-slate-800">
                    Available Functions
                  </h3>
                  <div className="space-y-1 font-mono text-xs text-blue-500">
                    {levelData?.availableFunctions && levelData.availableFunctions.length > 0 ? (
                      levelData.availableFunctions.map((func, index) => (
                        <div key={index}>{func}</div>
                      ))
                    ) : (
                      <>
                        <div>robot.moveUp()</div>
                        <div>robot.moveDown()</div>
                        <div>robot.moveLeft()</div>
                        <div>robot.moveRight()</div>
                        <div>robot.canMove(direction)</div>
                        <div>robot.atGoal()</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          {levelData && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-slate-50 p-6">
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-semibold text-slate-800">
                  Challenge Objective:
                </h4>
                <p className="text-xs text-slate-600 whitespace-pre-line">
                  {levelData.objective}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleLevelChange(level - 1)}
                  disabled={level <= 1}
                  className="rounded-lg border-2 border-slate-400 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    const currentHintIndex = activeTab === 'hints' ? 0 : -1;
                    if (currentHintIndex >= 0 && levelData.hints[currentHintIndex]) {
                      setActiveTab('hints');
                    } else {
                      setActiveTab('hints');
                    }
                  }}
                  className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-yellow-500"
                >
                  💡 Get Hint
                </button>
                <button
                  onClick={() => handleLevelChange(level + 1)}
                  disabled={level >= totalLevels || level + 1 > maxUnlockedLevel}
                  className="ml-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                >
                  Next Level →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Win Modal */}
      {showWinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <div className="text-center">
              <div className="mb-4 text-6xl">🎉</div>
              <h2 className="mb-2 text-3xl font-bold text-slate-800">Congratulations!</h2>
              <p className="mb-6 text-slate-600">
                You've completed Level {level}!
              </p>
              {gameState && (
                <div className="mb-6 rounded-lg bg-slate-50 p-4">
                  <div className="text-sm text-slate-600">
                    <div className="mb-2">Moves used: <span className="font-semibold text-blue-600">{gameState.moves}</span></div>
                    <div>Max moves: <span className="font-semibold text-blue-600">{gameState.maxMoves}</span></div>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleStayOnLevel}
                  className="flex-1 rounded-lg border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Stay on Level
                </button>
                {level >= totalLevels ? (
                  <button
                    onClick={handleStayOnLevel}
                    className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    All Levels Complete! 🎊
                  </button>
                ) : level <= maxUnlockedLevel ? (
                  <button
                    onClick={handleNextLevel}
                    className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Next Level →
                  </button>
                ) : (
                  <button
                    onClick={handleStayOnLevel}
                    disabled
                    className="flex-1 rounded-lg bg-gray-400 px-6 py-3 font-semibold text-white opacity-50 cursor-not-allowed"
                  >
                    Next Level Locked
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

