// Modules import
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Static file serve from public folder
app.use(express.static(path.join(__dirname, 'public')));

// index.html serve
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Online user list
let onlineUsers = {};
let botSocketIds = {};

// Bot list (20 জন)
const botUsers = [
  { id: 'bot1', user: 'Tania', pic: '' },
  { id: 'bot2', user: 'Ratul', pic: '' },
  { id: 'bot3', user: 'Priya', pic: '' },
  { id: 'bot4', user: 'Mehedi', pic: '' },
  { id: 'bot5', user: 'Riya', pic: '' },
  { id: 'bot6', user: 'Nihal', pic: '' },
  { id: 'bot7', user: 'Sneha', pic: '' },
  { id: 'bot8', user: 'Ayaan', pic: '' },
  { id: 'bot9', user: 'Kriti', pic: '' },
  { id: 'bot10', user: 'Kabir', pic: '' },
  { id: 'bot11', user: 'Neha', pic: '' },
  { id: 'bot12', user: 'Zayed', pic: '' },
  { id: 'bot13', user: 'Mira', pic: '' },
  { id: 'bot14', user: 'Farhan', pic: '' },
  { id: 'bot15', user: 'Alia', pic: '' },
  { id: 'bot16', user: 'Samir', pic: '' },
  { id: 'bot17', user: 'Rina', pic: '' },
  { id: 'bot18', user: 'Rohit', pic: '' },
  { id: 'bot19', user: 'Sadia', pic: '' },
  { id: 'bot20', user: 'Adil', pic: '' }
];

// Public message list (Banglish + English + Hindi-English)
const randomMessages = [
  "Hello everyone!", "Kemon acho sobai?", "Ajke onek boring lagche 😒",
  "Tum sab kahan ho?", "Let's have some fun 😄", "Private e aiso na ektu 😉",
  "Kya haal hai dosto?", "Ami coffee khete jacchi ☕", "Chat korle bhalo lage",
  "Kew ekta joke sunao 😆", "Koi movie dekhecho?", "Tumi kotheke chat korcho?",
  "Mujhe thoda lonely lag raha hai", "Cholo game khela jai 🎮", "Tomar sathe kotha bole bhalo laglo",
  "Kaun hai yahan active?", "Aj school gelo?", "Facebook use korcho?",
  "Aibar call e ashbo naki? 😅", "Bujhlam na, ektu bujhao","Free signup karke video call karo", "uper green button pe click karo then signup karo free mai video call kar payoge", "video call pe ajaw"
];

// Server connection
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

    // Bot ke jodi PM kora hoy
    const targetBot = botUsers.find(bot => botSocketIds[bot.id] === data.to);
    if (targetBot) {
      const delay = Math.floor(Math.random() * 3000) + 3000;
      setTimeout(() => {
        const replies = [
          "Hi, tum bhalo lagcho ❤️",
          "Amake call korbe? 🤭",
          "Video call e dekha hobe? 😍",
          "Private e kotha bhalo lagche!",
          "Ami tomake call dite chai 😉",
          "Just tap the video call button! 💬"
        ];
        const replyText = replies[Math.floor(Math.random() * replies.length)];
        io.to(socket.id).emit('privateMessage', {
          user: targetBot.user,
          pic: targetBot.pic,
          text: replyText,
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

// Bots ke onlineUser list e add kore dichi
botUsers.forEach((bot, index) => {
  const botId = `bot_${index}_${Date.now()}`;
  botSocketIds[bot.id] = botId;
  onlineUsers[botId] = {
    id: botId,
    user: bot.user,
    pic: bot.pic
  };
});

// Bots will send random public message every 50s
setInterval(() => {
  const bot = botUsers[Math.floor(Math.random() * botUsers.length)];
  const text = randomMessages[Math.floor(Math.random() * randomMessages.length)];
  io.emit('message', {
    user: bot.user,
    pic: bot.pic,
    text: text,
    time: new Date().toLocaleString()
  });
}, 25000);

// Server run
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
