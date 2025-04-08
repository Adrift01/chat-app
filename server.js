const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname)));

// Handle socket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // When a user sends a message
  socket.on('message', (data) => {
    io.emit('message', data); // Broadcast message to all users
  });

  // When a user disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
