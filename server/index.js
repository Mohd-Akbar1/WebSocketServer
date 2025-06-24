import { WebSocketServer, WebSocket, createWebSocketStream } from 'ws';
import { generateFromUserInput } from './gemini.js';
import http from 'http';

const server = http.createServer();
const wss = new WebSocketServer({ server });
const JobId = new Map();

let server2; // WebSocket connection to server2
let isServer2Connected = false;

function connectToServer2() {
  server2 = new WebSocket('ws://localhost:7000');

  server2.on('open', () => {
    isServer2Connected = true;
    console.log('✅ Connected to Server 2');

    // Start sending heartbeats to server2 to keep the connection alive
    setInterval(() => {
      if (server2.readyState === WebSocket.OPEN) {
        server2.ping(); // Keep connection alive
      }
    }, 30000); // every 30s
  });

  server2.on('close', () => {
    isServer2Connected = false;
    console.warn('⚠️ Server 2 connection closed. Reconnecting in 3s...');
    setTimeout(connectToServer2, 3000); // reconnect
  });

  server2.on('error', (err) => {
    console.error('❌ Error with Server 2 connection:', err.message);
  });

  server2.on('message', (msgBuffer) => {
    const data = JSON.parse(msgBuffer.toString());

    if (data.type === 'job_result') {
      const clientSocket = JobId.get(data.job_id);
      if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(`📨 [Server2] ${data.message}`);
        JobId.delete(data.job_id);
      }
    }
  });
}

// Start initial connection to server2
connectToServer2();

wss.on('connection', (socket) => {
  console.log('🔌 Client connected to Server 1');
  socket.send('👋 Welcome to Gemini chat!');

  setTimeout(() => {
    socket.send('Ask me anything...');
  }, 1300);

  socket.on('message', async (message) => {
    const userMessage = message.toString();

    if (userMessage.startsWith('@email')) {
      if (!isServer2Connected || server2.readyState !== WebSocket.OPEN) {
        socket.send('⚠️ Server 2 is not available at the moment. Try again later.');
        return;
      }

      const parts = userMessage.split(' ');
      const job_id = Date.now().toString();
      JobId.set(job_id, socket);

      const payload = {
        type: 'email',
        toEmail: parts[1],
        message: parts.slice(2).join(' '),
        job_id,
      };

      server2.send(JSON.stringify(payload));
      console.log('📨 Email job sent to Server 2:', payload);
      return;
    }

    console.log(' Received from client:', userMessage);

    if (userMessage.includes('image')) {
      socket.send('Generating image...');
      const response = await generateFromUserInput(userMessage);
      socket.send(response);
      return;
    }

    if (userMessage.includes('bye')) {
      socket.send('Goodbye!');
      socket.close();
      return;
    }

    try {
      const response = await generateFromUserInput(userMessage);
      socket.send(response);
    } catch (err) {
      console.error('Gemini error:', err);
      socket.send('Something went wrong.');
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected from Server 1');
  });
});

server.listen(8000, () => {
  console.log('Server 1 started on ws://localhost:8000');
});
