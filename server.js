const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

let onlineUsers = {};

// Socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (data) => {
    onlineUsers[socket.id] = { id: socket.id, user: data.user, pic: data.pic };
    io.emit('onlineUsers', Object.values(onlineUsers));
  });

  socket.on('message', (data) => {
    io.emit('message', data);
  });

  socket.on('privateMessage', (data) => {
    io.to(data.to).emit('privateMessage', data);
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socket.id];
    io.emit('onlineUsers', Object.values(onlineUsers));
    console.log('A user disconnected:', socket.id);
  });
});

// Fake bot users
const botUsers = [
  { user: 'Tania💖', pic: '' },
  { user: 'Ratul🔥', pic: '' },
  { user: 'Priya😍', pic: '' },
  { user: 'Mehedi😎', pic: '' },
  { user: 'Riya💫', pic: '' }
];

const randomMessages = [
  "Hey! Kew ekhane?",
  "Chat korte mon chaiche 😘",
  "Private e asho keu 🫣",
  "Kew ekta funny joke bolo toh!",
  "Bore hoye gelam...",
  "Ei chat room ta interesting 🤔",
  "Tomra sobai koi gelo? 🥺"
];

setInterval(() => {
  const bot = botUsers[Math.floor(Math.random() * botUsers.length)];
  const text = randomMessages[Math.floor(Math.random() * randomMessages.length)];

  io.emit('message', {
    user: bot.user,
    pic: bot.pic,
    text,
    time: new Date().toLocaleString()
  });
}, 45000); // ১৫ সেকেন্ড পর পর

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});
