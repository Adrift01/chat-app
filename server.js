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

// Real user connection
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

// Fake bot users (without pictures)
const botUsers = ['Tania💖', 'Ratul🔥', 'Priya😍', 'Mehedi😎', 'Riya💫'];

const randomMessages = [
  "ভাই আমি একা বোর ফিল করতেসি!",
  "কে আছো, একটু গল্প করি?",
  "কারো সাথে চ্যাট করতে ইচ্ছা করছে 🤭",
  "বৃষ্টি হচ্ছে বাইরে, আর আমি একা...",
  "এইটা কি প্রেমের জায়গা নাকি? 😉",
  "তোমার নামটা শুনতে চাই 😅",
  "আজকে সবাই কেমন আছো?",
  "কে আছো যে আমার সাথে প্রাইভেটে চ্যাট করবে? 😘",
  "একটু হেসে নাও, লাইফ একটাই! 😊",
  "এই রুমে কেউ ভালোবাসা খুঁজতেসে?"
];

// Send fake bot messages every 50 seconds
setInterval(() => {
  const botName = botUsers[Math.floor(Math.random() * botUsers.length)];
  const message = randomMessages[Math.floor(Math.random() * randomMessages.length)];

  io.emit('message', {
    user: botName,
    pic: '', // No profile picture
    text: message,
    time: new Date().toLocaleString()
  });
}, 50000); // প্রতি ৫০ সেকেন্ডে

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
