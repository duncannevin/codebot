// WebSocket server setup for development
// This file can be used to create a separate WebSocket server
// For production on Vercel, consider using:
// - Server-Sent Events (SSE)
// - Supabase Realtime
// - Pusher/Ably
// - A separate WebSocket service

import { WebSocketServer } from 'ws';
import { CodeExecutor } from './code-executor';
import type { GameState } from '../../types/game';

export function createWebSocketServer(port: number = 3001) {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    let currentExecutor: CodeExecutor | null = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'execute_code') {
          const { code, gameState, speed, requirements } = data;
          
          // Create executor (this will reset the robot)
          currentExecutor = new CodeExecutor(gameState as GameState, requirements);
          
          // Send updates via WebSocket in real-time
          currentExecutor.onMessage((eventData) => {
            if (ws.readyState === 1) { // WebSocket.OPEN
              try {
                const message = JSON.stringify(eventData);
                ws.send(message);
              } catch (error) {
                // Silently handle send errors
              }
            }
          });

          // Execute code with speed parameter for delays between movements
          // Speed should be in milliseconds (e.g., 100 = fast, 1000 = slow)
          const executionSpeed = speed || gameState?.executionSpeed || 500;
          
          try {
            // Execute code - this will keep sending robot_move frames until complete
            // The execute() method will only return after ALL movements are done
            await currentExecutor.execute(code, executionSpeed);
          } catch (error: any) {
            if (ws.readyState === 1) {
              const errorMessage = {
                type: 'error',
                message: error.message || 'Execution failed',
              };
              ws.send(JSON.stringify(errorMessage));
            }
            currentExecutor = null;
          }
        }
      } catch (error: any) {
        const errorMessage = {
          type: 'error',
          message: error.message,
        };
        ws.send(JSON.stringify(errorMessage));
      }
    });

    ws.on('close', () => {
      // Client disconnected
    });

    ws.on('error', (error) => {
      // Handle error silently
    });
  });

  console.log(`WebSocket server running on ws://localhost:${port}`);
  return wss;
}

