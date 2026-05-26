const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'websocket-service' });
});

// Endpoint for other microservices to push updates to the WebSocket server
app.post('/api/v1/ws/push', (req, res) => {
  const { room, event, data } = req.body;
  if (!room || !event || !data) {
    return res.status(400).json({ error: 'Missing room, event, or data' });
  }

  // Broadcast to all clients in the specified room
  io.to(room).emit(event, data);
  res.status(200).json({ message: `Event ${event} pushed to room ${room}` });
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Client requests to join a specific flight's room to receive real-time seat updates
  socket.on('join_flight', (flightId) => {
    socket.join(`flight_${flightId}`);
    console.log(`Socket ${socket.id} joined room flight_${flightId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket Service running on port ${PORT}`);
});
