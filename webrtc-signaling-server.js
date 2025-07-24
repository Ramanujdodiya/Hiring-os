// Simple WebRTC signaling server using ws
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });

// roomName -> Set of sockets
const rooms = {};

wss.on('connection', (ws) => {
  let currentRoom = null;

  ws.on('message', (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }
    if (data.type === 'join') {
      currentRoom = data.room;
      if (!rooms[currentRoom]) rooms[currentRoom] = new Set();
      rooms[currentRoom].add(ws);
    } else if (currentRoom && rooms[currentRoom]) {
      // Relay signaling messages to all other peers in the room
      rooms[currentRoom].forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].delete(ws);
      if (rooms[currentRoom].size === 0) delete rooms[currentRoom];
    }
  });
});

console.log('WebRTC signaling server running on ws://localhost:3001'); 