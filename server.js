const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const path = require('path');
const users = {}; // Store user info with socket.id

app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When a user joins
  socket.on('join', (data) => {
    users[socket.id] = { id: socket.id, user: data.user, pic: data.pic };
    io.emit('onlineUsers', Object.values(users));
  });

  // Public message
  socket.on('message', (msg) => {
    const timestamp = new Date().toLocaleString();
    io.emit('message', { ...msg, timestamp });
  });

  // Private message
  socket.on('privateMessage', (msg) => {
    const timestamp = new Date().toLocaleString();
    io.to(msg.to).emit('privateMessage', {
      user: msg.user,
      text: msg.text,
      timestamp
    });

    // Also show it to the sender
    socket.emit('privateMessage', {
      user: msg.user + ' (You)',
      text: msg.text,
      timestamp
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('onlineUsers', Object.values(users));
    console.log('A user disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
