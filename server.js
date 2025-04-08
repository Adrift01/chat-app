const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

let users = [];

io.on('connection', socket => {
  users.push(socket.id);
  io.emit('userList', users);

  socket.on('disconnect', () => {
    users = users.filter(id => id !== socket.id);
    io.emit('userList', users);
  });

  socket.on('privateMessage', ({ to, text }) => {
    io.to(to).emit('message', { from: socket.id, text });
  });
});

http.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
