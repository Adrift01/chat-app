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
  { user: 'Tania💖', pic: 'https://www.facebook.com/photo/?fbid=607443165623407&set=pb.100090731875932.-2207520000' },
  { user: 'Ratul🔥', pic: 'https://www.facebook.com/photo/?fbid=122117928830800326&set=a.122117065244800326' },
  { user: 'Priya😍', pic: 'https://www.facebook.com/photo/?fbid=384360151265044&set=pb.100090731875932.-2207520000' },
  { user: 'Mehedi😎', pic: 'https://www.facebook.com/photo/?fbid=122133869666368720&set=pb.61561061609977.-2207520000' },
  { user: 'Riya💫', pic: 'https://www.facebook.com/photo/?fbid=623483557107089&set=pcb.623483737107071' }
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
}, 15000); // ১৫ সেকেন্ড পর পর

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});
