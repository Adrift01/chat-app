const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, '/')));

let onlineUsers = {};

io.on('connection', socket => {
  socket.on('join', data => {
    onlineUsers[socket.id] = { id: socket.id, user: data.user, pic: data.pic };
    io.emit('onlineUsers', Object.values(onlineUsers));
  });

  socket.on('message', msg => {
    io.emit('message', msg);
  });

  socket.on('privateMessage', data => {
    io.to(data.to).emit('privateMessage', {
      user: data.user,
      text: data.text
    });
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socket.id];
    io.emit('onlineUsers', Object.values(onlineUsers));
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
