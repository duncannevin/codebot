// Standalone WebSocket server for development
// Run with: npm run dev:ws

import { createWebSocketServer } from '../lib/game/websocket-server';

const PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001;

const server = createWebSocketServer(PORT);

// Keep process alive
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  server.close();
  process.exit(0);
});

