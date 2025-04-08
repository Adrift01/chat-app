// Required modules import
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Static files serve from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// "/" route returns index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Keep track of online users
let onlineUsers = {};

// Fake bot users
const botUsers = [
  { id: 'bot1', user: 'Tania💖', pic: '' },
  { id: 'bot2', user: 'Ratul🔥', pic: '' },
  { id: 'bot3', user: 'Priya😍', pic: '' },
  { id: 'bot4', user: 'Mehedi😎', pic: '' },
  { id: 'bot5', user: 'Riya💫', pic: '' }
];

// Add bot users to the online list at server start
botUsers.forEach(bot => {
  onlineUsers[bot.id] = {
    id: bot.id,
    user: bot.user,
    pic: bot.pic
  };
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('🔥 New user connected:', socket.id);

  // When a real user joins
  socket.on('join', (data) => {
    onlineUsers[socket.id] = {
      id: socket.id,
      user: data.user,
      pic: data.pic
    };
    io.emit('onlineUsers', Object.values(onlineUsers));
  });

  // Public messages
  socket.on('message', (data) => {
    io.emit('message', data);
  });

  // Private messages
  socket.on('privateMessage', (data) => {
    io.to(data.to).emit('privateMessage', data);
  });

  // On disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    delete onlineUsers[socket.id];
    io.emit('onlineUsers', Object.values(onlineUsers));
  });

  // Emit updated list including bots
  io.emit('onlineUsers', Object.values(onlineUsers));
});

// Bot message texts (Banglish style)
const randomMessages = [
  "Hey! keu ekhane?", 
  "Mood off today 😔", 
  "Keu ashbe private e? 😜", 
  "Joke bolo to 😂", 
  "Ami onek bored 😵", 
  "Chat korte mon chaiche 💬", 
  "Tomra koi sobai? 🥺", 
  "New friend chai 🥰", 
  "Ajke onek moja lagche!", 
  "Keu online ase?"
];

// Every 50 seconds, one bot sends a message
setInterval(() => {
  const bot = botUsers[Math.floor(Math.random() * botUsers.length)];
  const text = randomMessages[Math.floor(Math.random() * randomMessages.length)];

  io.emit('message', {
    user: bot.user,
    pic: bot.pic,
    text: text,
    time: new Date().toLocaleString()
  });
}, 50000); // 50 sec

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
