// প্রয়োজনীয় modules import করছি
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Static ফাইল সার্ভ করার জন্য public folder use করা
app.use(express.static(path.join(__dirname, 'public')));

// "/" route এ index.html পাঠানো
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// অনলাইনে থাকা ইউজারদের লিস্ট রাখার জন্য object
let onlineUsers = {};

// Socket.IO দিয়ে connection listen করছি
io.on('connection', (socket) => {
  console.log('🔥 New user connected:', socket.id);

  // কেউ join করলে তার info স্টোর করা
  socket.on('join', (data) => {
    onlineUsers[socket.id] = {
      id: socket.id,
      user: data.user,
      pic: data.pic
    };
    io.emit('onlineUsers', Object.values(onlineUsers));
  });

  // পাবলিক ম্যাসেজ পাঠানো হলে broadcast করা
  socket.on('message', (data) => {
    io.emit('message', data);
  });

  // প্রাইভেট ম্যাসেজ পাঠানো হলে নির্দিষ্ট user কে পাঠানো
  socket.on('privateMessage', (data) => {
    io.to(data.to).emit('privateMessage', data);
  });

  // কেউ disconnect করলে list থেকে remove
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    delete onlineUsers[socket.id];
    io.emit('onlineUsers', Object.values(onlineUsers));
  });
});


// ========== FAKE BOT USERS SETUP ==========

// Bot user list (profile pic লাগলে link বসাও, না লাগলে খালি রেখো)
const botUsers = [
  { user: 'Tania💖', pic: '' },
  { user: 'Ratul🔥', pic: '' },
  { user: 'Priya😍', pic: '' },
  { user: 'Mehedi😎', pic: '' },
  { user: 'Riya💫', pic: '' }
];

// র‍্যান্ডম ম্যাসেজ লিস্ট যা bot রা পাঠাবে
const randomMessages = [
  "Hey! কেউ এখানে আছো?",
  "আজকে মুড অফ 😔",
  "Private e আসো কেউ 🥵",
  "একটা জোক বলো তো কেউ 😂",
  "চলো আড্ডা দেই 🥰",
  "সবার সাথে কথা বলতে ইচ্ছা করছে 😚",
  "তোমরা কোথায়? 😢",
  "আমি bored... 😩",
  "নতুন কেউ আছো এখানে? 👀",
  "মন খারাপ... কেউ কথা বলো 🥹"
];

// প্রতি ৫০ সেকেন্ড পরপর একেকটা bot র‍্যান্ডম মেসেজ দিবে
setInterval(() => {
  const bot = botUsers[Math.floor(Math.random() * botUsers.length)];
  const text = randomMessages[Math.floor(Math.random() * randomMessages.length)];

  io.emit('message', {
    user: bot.user,
    pic: bot.pic,
    text: text,
    time: new Date().toLocaleString()
  });
}, 50000); // প্রতি ৫০ সেকেন্ড

// Server port সেট করা
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
