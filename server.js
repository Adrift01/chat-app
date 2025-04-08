const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Static folder serve
app.use(express.static(path.join(__dirname, 'public')));

// Main route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Online user list
let onlineUsers = {};

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Ekjon user connect korse:', socket.id);

  // Jokhon user join kore
  socket.on('join', (data) => {
    onlineUsers[socket.id] = {
      id: socket.id,
      user: data.user,
      pic: data.pic
    };
    io.emit('onlineUsers', Object.values(onlineUsers));
  });

  // Public message pathale
  socket.on('message', (data) => {
    io.emit('message', data);
  });

  // Private message
  socket.on('privateMessage', (data) => {
    io.to(data.to).emit('privateMessage', data);
  });

  // Disconnect handle
  socket.on('disconnect', () => {
    console.log('User disconnect korse:', socket.id);
    delete onlineUsers[socket.id];
    io.emit('onlineUsers', Object.values(onlineUsers));
  });
});

// Fake bot user list
const botUsers = [
  { user: 'Tania💖', pic: '' },
  { user: 'Ratul🔥', pic: '' },
  { user: 'Priya😍', pic: '' },
  { user: 'Mehedi😎', pic: '' },
  { user: 'Riya💫', pic: '' }
];

// Random message list
const randomMessages = [
  "Hey! Kew ekhane?",
  "Chat korte mon chaiche 😘",
  "Private e asho keu 🫣",
  "Kew ekta funny joke bolo toh!",
  "Bore hoye gelam...",
  "Ei chat room ta interesting 🤔",
  "Tomra sobai koi gelo? 🥺",
  "Kaw kotha bolbe?",
  "Mon kharap... kichu bolo 🥹",
  "Ami notun ekhane 👋"
];

// Bot message every 50 seconds
setInterval(() => {
  const bot = botUsers[Math.floor(Math.random() * botUsers.length)];
  const text = randomMessages[Math.floor(Math.random() * randomMessages.length)];

  io.emit('message', {
    user: bot.user,
    pic: bot.pic, // Pic chaile link boshai dite paro
    text: text,
    time: new Date().toLocaleString()
  });
}, 50000); // 50 second por por

// Server start
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Server cholse on port', PORT);
});
