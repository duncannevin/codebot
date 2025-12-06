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

    // Store executor for validation requests
    let currentExecutor: CodeExecutor | null = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('[WebSocket Server] Received message:', JSON.stringify(data, null, 2));
        
        if (data.type === 'execute_code') {
          const { code, gameState, speed, requirements } = data;
          
          // Create executor (this will reset the robot)
          currentExecutor = new CodeExecutor(gameState as GameState, requirements);
          
          // Send updates via WebSocket in real-time
          currentExecutor.onMove((eventData) => {
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
            // Execute code - this will keep sending robot_move frames until complete
            // The execute() method will only return after ALL movements are done
            // Note: execution_complete message removed - client will request validate_requirements instead
            await currentExecutor.execute(code, executionSpeed);
            
            // Execution complete - all robot_move frames have been sent
            console.log('[WebSocket Server] Execution complete - all frames sent');
          } catch (error: any) {
            if (ws.readyState === 1) {
              const errorMessage = {
                type: 'error',
                message: error.message || 'Execution failed',
              };
              console.log('[WebSocket Server] Sending error:', JSON.stringify(errorMessage, null, 2));
              ws.send(JSON.stringify(errorMessage));
            }
            currentExecutor = null;
          }
        } else if (data.type === 'validate_requirements') {
          // UI requests validation after animations complete
          // This validates both code requirements AND verifies robot reached goal
          if (currentExecutor && ws.readyState === 1) {
            const validation = currentExecutor.validateRequirements();
            const validationMessage = {
              type: 'requirements_validation',
              validation,
            };
            console.log('[WebSocket Server] Sending requirements_validation:', JSON.stringify(validationMessage, null, 2));
            ws.send(JSON.stringify(validationMessage));
            currentExecutor = null; // Clear executor after validation
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

