import WebSocket from 'ws';
import http from 'http';

export function setupWSServer(server: http.Server) {
  const wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    console.log('WS client connected');
    ws.on('close', () => console.log('WS client disconnected'));
  });

  function broadcast(payload: any) {
    const str = JSON.stringify(payload);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(str);
    });
  }

  return { broadcast };
}
