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
let botReplyCounter = {}; // Track how many replies each bot gave

const botUsers = [
  { id: 'bot1', user: 'Tania', pic: '' },
  { id: 'bot2', user: 'Ratul', pic: '' },
  { id: 'bot3', user: 'Priya', pic: '' },
  { id: 'bot4', user: 'Mehedi', pic: '' },
  { id: 'bot5', user: 'Riya', pic: '' },
  { id: 'bot6', user: 'Rohit', pic: '' },
  { id: 'bot7', user: 'Sneha', pic: '' },
  { id: 'bot8', user: 'Karan', pic: '' },
  { id: 'bot9', user: 'Neha', pic: '' },
  { id: 'bot10', user: 'Amit', pic: '' },
  { id: 'bot11', user: 'Simran', pic: '' },
  { id: 'bot12', user: 'Sourav', pic: '' },
  { id: 'bot13', user: 'Ankita', pic: '' },
  { id: 'bot14', user: 'Farhan', pic: '' },
  { id: 'bot15', user: 'Nisha', pic: '' },
  { id: 'bot16', user: 'Arjun', pic: '' },
  { id: 'bot17', user: 'Preeti', pic: '' },
  { id: 'bot18', user: 'Deepak', pic: '' },
  { id: 'bot19', user: 'Kriti', pic: '' },
  { id: 'bot20', user: 'Zaid', pic: '' }
];

const messages = [
  "Hey, what's up?",
  "Kya haal hai?",
  "Aj kuch interesting hua?",
  "Bore ho raha hoon 😅",
  "Let's chat private 😉",
  "Koi movie suggest karo!",
  "Hello strangers!",
  "Ekdum mast vibes yaha!",
  "Time pass karna hai",
  "Call karo kya?", "Hello everyone!", "Kemon acho sobai?", "Ajke onek boring lagche 😒",
  "Tum sab kahan ho?", "Let's have some fun 😄", "Private e aiso na ektu 😉",
  "Kya haal hai dosto?", "wana fun with me ? come to video chat now", "Chat korle bhalo lage",
  "Kew ekta joke sunao 😆", "Koi movie dekhecho?", "Tumi kotheke chat korcho?",
  "Mujhe thoda lonely lag raha hai", "Cholo game khela jai 🎮", "Tomar sathe kotha bole bhalo laglo",
  "wow so many active users today", "video chat pe bohot jyada fun hua", "Facebook use korcho?",
  "Aibar call e ashbo naki? 😅", "Bujhlam na, ektu bujhao","Free signup karke video call karo", "free signup button pe click karo then signup karo free mai video call kar payoge", "video call pe ajaw"
];

function getRandomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

// Add all 20 bots to online list
botUsers.forEach(bot => {
  onlineUsers[bot.id] = {
    id: bot.id,
    user: bot.user,
    pic: bot.pic
  };
  botReplyCounter[bot.id] = 0;
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

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

    const bot = botUsers.find(b => b.id === data.to);
    if (bot) {
      const replyCount = ++botReplyCounter[bot.id];
      let reply = getRandomMessage();

      if (replyCount % 5 === 0) {
        reply += " (Click video call 👇)";
      }

      setTimeout(() => {
        io.to(socket.id).emit('privateMessage', {
          user: bot.user,
          text: reply,
          time: new Date().toLocaleString()
        });
      }, 3000 + Math.random() * 3000);
    }
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socket.id];
    io.emit('onlineUsers', Object.values(onlineUsers));
  });
});

// Bots send message to public every 25s
setInterval(() => {
  const bot = botUsers[Math.floor(Math.random() * botUsers.length)];
  const message = {
    user: bot.user,
    pic: bot.pic,
    text: getRandomMessage(),
    time: new Date().toLocaleString()
  };
  io.emit('message', message);
}, 15000);

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
