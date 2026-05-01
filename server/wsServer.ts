import WebSocket from 'ws';
import http from 'http';
import type { WsEvent } from './types';

export function setupWSServer(server: http.Server): { broadcast: (data: WsEvent) => void } {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress ?? 'unavailable';
    console.log(`WS client connected: ${ip}`);

    ws.on('close', () => console.log(`WS client disconnected: ${ip}`));
    ws.on('error', (err) => console.error(`WS error from ${ip}:`, err));
  });

  function broadcast(payload: WsEvent) {
    const str = JSON.stringify(payload);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(str, (err) => {
          if (err) console.error('WS send error:', err);
        });
      }
    }
  }

  return { broadcast };
}
