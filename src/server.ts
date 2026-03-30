import 'dotenv/config';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { runDemo } from './demo/index.js';

const PORT = 8081;
const server = createServer((req, res) => {
  // basic CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/api/start' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Demo started. Subscribe to WebSocket for updates.' }));
    
    // Use real Gemini AI if API key is available
    const useMockAI = !process.env.GEMINI_API_KEY;
    
    runDemo({
      showTUI: false,
      useMockAI: useMockAI, 
      geminiApiKey: process.env.GEMINI_API_KEY,
      onUpdate: (state) => {
        const payload = JSON.stringify(state);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        });
      }
    }).catch(err => {
      console.error('Demo Error:', err);
    });

  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket.');
  ws.send(JSON.stringify({ message: 'Connected to Midnight System...' }));
});

server.listen(PORT, () => {
  console.log(`Backend API Server running at http://localhost:${PORT}`);
  console.log(`WebSocket Server attached to ws://localhost:${PORT}`);
});
