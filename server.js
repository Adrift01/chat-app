const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, '/')));

let users = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', (userData) => {
    socket.userData = userData;
    users.push({ id: socket.id, ...userData });
    io.emit('onlineUsers', users);
  });

  socket.on('message', (msg) => {
    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    users = users.filter(u => u.id !== socket.id);
    io.emit('onlineUsers', users);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
