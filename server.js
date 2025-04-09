const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let onlineUsers = {};
let botSocketIds = {};

// ২০টা bot user
const botUsers = [
  { id: 'bot1', user: 'Tania', pic: '' },
  { id: 'bot2', user: 'Ratul', pic: '' },
  { id: 'bot3', user: 'Priya', pic: '' },
  { id: 'bot4', user: 'Mehedi', pic: '' },
  { id: 'bot5', user: 'Riya', pic: '' },
  { id: 'bot6', user: 'Sneha', pic: '' },
  { id: 'bot7', user: 'Arjun', pic: '' },
  { id: 'bot8', user: 'Fatima', pic: '' },
  { id: 'bot9', user: 'Kabir', pic: '' },
  { id: 'bot10', user: 'Zara', pic: '' },
  { id: 'bot11', user: 'Nikhil', pic: '' },
  { id: 'bot12', user: 'Jaya', pic: '' },
  { id: 'bot13', user: 'Rahul', pic: '' },
  { id: 'bot14', user: 'Maya', pic: '' },
  { id: 'bot15', user: 'Rohan', pic: '' },
  { id: 'bot16', user: 'Anu', pic: '' },
  { id: 'bot17', user: 'Tanvir', pic: '' },
  { id: 'bot18', user: 'Sara', pic: '' },
  { id: 'bot19', user: 'Shaan', pic: '' },
  { id: 'bot20', user: 'Lina', pic: '' },
];

const randomMessages = [
  "Hey bro, ki obosta?",
  "Kya tum yaha ho? 🧐",
  "Let's vibe together! 🔥",
  "Mood off... 😩",
  "Private e esho na! 😉",
  "Kuch funny bolo yaar 😂",
  "Tumi kotha theke?",
  "This chat room is lit 🔥",
  "Bhai, boredom maarse 🥴",
  "Toke dekhe bhalo laglo!",
  "Ek cup coffee hoy jabe?",
  "Online ke ache bolo toh!",
  "Ami just dekhtesi, tumi?",
  "Kichu interesting bol!",
  "Let's go for video call 😜",
  "Video call korbo? Just click the button below 👇",
  "Tui na joss manush 😁",
  "Ajke raat e free tor?",
  "Tell me your crush's name 👀",
  "Ami valobashi tomake! ❤️"
];

io.on('connection', (socket) => {
  console.log('🔥 New user connected:', socket.id);

  socket.on('join', (data) => {
    onlineUsers[socket.id] = {
      id: socket.id,
      user: data.user,
      pic: data.pic
    };
    io.emit('onlineUsers', Object.values(onlineUsers));
  });

  socket.on('message', (data) => {
    io.emit('message', data);
  });

  socket.on('privateMessage', (data) => {
    io.to(data.to).emit('privateMessage', data);

    const targetBot = botUsers.find(bot => botSocketIds[bot.id] === data.to);
    if (targetBot) {
      const delay = Math.floor(Math.random() * 3000) + 3000;

      setTimeout(() => {
        const reply = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        const videoMsg = Math.random() < 0.4 ? "Video call e ashbe? Click the button below 👇" : "";
        io.to(socket.id).emit('privateMessage', {
          user: targetBot.user,
          text: reply + (videoMsg ? `\n${videoMsg}` : ""),
          time: new Date().toLocaleString()
        });
      }, delay);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    delete onlineUsers[socket.id];
    io.emit('onlineUsers', Object.values(onlineUsers));
  });
});

// 🔄 Bot auto join, msg, leave system
function botLifeCycle(bot) {
  const botId = `bot_${bot.id}_${Date.now()}`;
  botSocketIds[bot.id] = botId;

  onlineUsers[botId] = {
    id: botId,
    user: bot.user,
    pic: bot.pic
  };

  io.emit('onlineUsers', Object.values(onlineUsers));

  const msgCount = Math.floor(Math.random() * 3) + 2;

  for (let i = 0; i < msgCount; i++) {
    setTimeout(() => {
      const text = randomMessages[Math.floor(Math.random() * randomMessages.length)];
      io.emit('message', {
        user: bot.user,
        pic: bot.pic,
        text: text,
        time: new Date().toLocaleString()
      });
    }, 3000 * i);
  }

  const leaveDelay = 10000 + Math.floor(Math.random() * 20000); // 10-30 sec

  setTimeout(() => {
    delete onlineUsers[botId];
    delete botSocketIds[bot.id];
    io.emit('onlineUsers', Object.values(onlineUsers));
    console.log(`${bot.user} left the chat`);
  }, leaveDelay);
}

// প্রতি ৩০ সেকেন্ড পর random bot ashe, msg dei, chole jai
setInterval(() => {
  const bot = botUsers[Math.floor(Math.random() * botUsers.length)];
  if (!botSocketIds[bot.id]) {
    botLifeCycle(bot);
  }
}, 30000);

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
