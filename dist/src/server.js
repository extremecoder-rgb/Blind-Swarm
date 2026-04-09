import 'dotenv/config';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { runPipeline } from './demo/index.js';
const PORT = 5001;
const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    if (req.url === '/api/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ready',
            chain: 'midnight',
            network: 'local'
        }));
    }
    else if (req.url === '/api/start' && req.method === 'POST') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Pipeline started. Connect to WebSocket for real-time updates.' }));
        runPipeline({
            showTUI: false,
            geminiApiKey: process.env.GEMINI_API_KEY,
            groqApiKey: process.env.GROQ_API_KEY,
            onUpdate: (state) => {
                const payload = JSON.stringify(state);
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(payload);
                    }
                });
            }
        }).catch(err => {
            console.error('Pipeline Error:', err);
        });
    }
    else {
        res.writeHead(404);
        res.end('Not Found');
    }
});
const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket.');
    ws.send(JSON.stringify({ message: '🔗 Connected to Midnight DeFi Pipeline...' }));
});
server.listen(PORT, () => {
    console.log(`🔧 Backend API: http://localhost:${PORT}`);
    console.log(`📡 WebSocket: ws://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map