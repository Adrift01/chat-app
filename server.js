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

// Bot গুলার আলাদা socket ID গুলা রাখার জন্য
let botSocketIds = {};

// Fake bot user list
const botUsers = [
  { id: 'bot1', user: 'Tania💖', pic: '' },
  { id: 'bot2', user: 'Ratul🔥', pic: '' },
  { id: 'bot3', user: 'Priya😍', pic: '' },
  { id: 'bot4', user: 'Mehedi😎', pic: '' },
  { id: 'bot5', user: 'Riya💫', pic: '' }
];

// র‍্যান্ডম ম্যাসেজ লিস্ট যা bot রা পাঠাবে
const randomMessages = [
  "Hey! Kew ekhane?",
  "Mood off today 😔",
  "Private e asho keu 😉",
  "Kichu moja korte chai 😅",
  "Ami onek lonely feel kortesi...",
  "Keu ekta joke bolbe? 😂",
  "Tumi kothay thako?",
  "Ei chat room ta onek mojaar!",
  "Tomar sathe kotha bolte bhalo lagse 💬",
  "Ektu break nei, pore ashi!"
];

// Socket.IO দিয়ে connection listen করছি
io.on('connection', (socket) => {
  console.log('🔥 New user connected:', socket.id);

  // Join event handle
  socket.on('join', (data) => {
    onlineUsers[socket.id] = {
      id: socket.id,
      user: data.user,
      pic: data.pic
    };

    io.emit('onlineUsers', Object.values(onlineUsers));
  });

  // Public message handle
  socket.on('message', (data) => {
    io.emit('message', data);
  });

  // Private message handle
  socket.on('privateMessage', (data) => {
    // Regular private message delivery
    io.to(data.to).emit('privateMessage', data);

    // যদি কেউ bot কে private এ message দেয়, তাহলেই reply
    const targetBot = botUsers.find(bot => botSocketIds[bot.id] === data.to);
    if (targetBot) {
      // 3-6 সেকেন্ডের মধ্যে reply দিবে
      const delay = Math.floor(Math.random() * 3000) + 3000;

      setTimeout(() => {
        const replyText = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        io.to(socket.id).emit('privateMessage', {
          user: targetBot.user,
          text: replyText,
          time: new Date().toLocaleString()
        });
      }, delay);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    delete onlineUsers[socket.id];
    io.emit('onlineUsers', Object.values(onlineUsers));
  });
});

// ======== BOT SYSTEM ========

// Bot user গুলাকে manually connect করা
botUsers.forEach((bot, index) => {
  const botId = `bot_${index}_${Date.now()}`;
  botSocketIds[bot.id] = botId;

  // Online user list এ bot দেরও যোগ করলাম
  onlineUsers[botId] = {
    id: botId,
    user: bot.user,
    pic: bot.pic
  };
});

// প্রতি ৫০ সেকেন্ড পরপর bot random message পাঠাবে public এ
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
