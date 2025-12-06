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
    console.log('[WebSocket Server] Client connected');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('[WebSocket Server] Received message:', JSON.stringify(data, null, 2));
        
        if (data.type === 'execute_code') {
          const { code, gameState, speed, requirements } = data;
          
          // Create executor (this will reset the robot)
          const executor = new CodeExecutor(gameState as GameState, requirements);
          
          // Send updates via WebSocket in real-time
          executor.onMove((eventData) => {
            if (ws.readyState === 1) { // WebSocket.OPEN
              try {
                const message = JSON.stringify(eventData);
                console.log('[WebSocket Server] Sending robot_move:', JSON.stringify(eventData, null, 2));
                ws.send(message);
              } catch (error) {
                console.error('[WebSocket Server] Error sending WebSocket message:', error);
              }
            }
          });

          // Execute code with speed parameter for delays between movements
          // Speed should be in milliseconds (e.g., 100 = fast, 1000 = slow)
          const executionSpeed = speed || gameState?.executionSpeed || 500;
          
          try {
            const result = await executor.execute(code, executionSpeed);
            
            // Send completion
            if (ws.readyState === 1) {
              const completionMessage = {
                type: 'execution_complete',
                result,
              };
              console.log('[WebSocket Server] Sending execution_complete:', JSON.stringify(completionMessage, null, 2));
              ws.send(JSON.stringify(completionMessage));
            }
          } catch (error: any) {
            if (ws.readyState === 1) {
              const errorMessage = {
                type: 'error',
                message: error.message || 'Execution failed',
              };
              console.log('[WebSocket Server] Sending error:', JSON.stringify(errorMessage, null, 2));
              ws.send(JSON.stringify(errorMessage));
            }
          }
        }
      } catch (error: any) {
        console.error('[WebSocket Server] Error processing message:', error);
        const errorMessage = {
          type: 'error',
          message: error.message,
        };
        console.log('[WebSocket Server] Sending error:', JSON.stringify(errorMessage, null, 2));
        ws.send(JSON.stringify(errorMessage));
      }
    });

    ws.on('close', () => {
      console.log('[WebSocket Server] Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('[WebSocket Server] Error:', error);
    });
  });

  console.log(`WebSocket server running on ws://localhost:${port}`);
  return wss;
}

