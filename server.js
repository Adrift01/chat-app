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
let botReplyCounter = {};

const botUsers = [
  { id: 'bot1', user: 'Tania Rahman' }, { id: 'bot2', user: 'Ratul' },
  { id: 'bot3', user: 'Priya Khan' }, { id: 'bot4', user: 'Mehedi Hasan' },
  { id: 'bot5', user: 'Riya' }, { id: 'bot6', user: 'Rohit' },
  { id: 'bot7', user: 'Sneha' }, { id: 'bot8', user: 'Karan Singh' },
  { id: 'bot9', user: 'Neha Kumari' }, { id: 'bot10', user: 'Daisy' },
  { id: 'bot11', user: 'Simran' }, { id: 'bot12', user: 'Sumi' },
  { id: 'bot13', user: 'Ankita Das' }, { id: 'bot14', user: 'Faria' },
  { id: 'bot15', user: 'Nisha' }, { id: 'bot16', user: 'Arjun' },
  { id: 'bot17', user: 'Preeti Sharma' }, { id: 'bot18', user: 'Deepak' },
  { id: 'bot19', user: 'Kriti' }, { id: 'bot20', user: 'Shammi' }
];

const messages = [
  "Hi there", "Kya haal hai?", "I wanna fun with you baby, come to video call now I am alone",
  "Ami club e jabo, tumi ashbe?", "Koi hai jo video call pe ayega?", "Bore lagche tai chat e eshechi",
  "Uff amar ta vije ache, thela dile dhuke jabe baby", "Aapna number do phir 😅",
  "Arey baap re eto active log", "Video chat korle moja lage",
  "ntelegram id bata do", "Tum kahaan se ho?", "Kaw acho? Amake thanda kore dite parbe?",
  "Hi! Tumi ki korba amar sathe?", "Free signup diye chat korte paro 😄",
  "Chat e ashle moja lage", "Nice talking to you!", "wana see something? video chat join karo aabhi",
  "Tumi ki facebook use koro?", "Khelba?", "Tumi ki Bangladeshi?", "Call korbo naki? 😋",
  "Ami ekdom free ekhon", "telegram id bata do aap", "Dhaka te thako?", "I am very naughty baby",
  "Wanna fun with me? Come to video chat now", "Hey", "Mujhe lonely lag raha hai",
  "Tomar sathe kotha bole bhalo laglo", "thik hai ajaao",
  "Video chat e moja lage", "Aibar call e ashbo naki? 😅", "Free signup karke video call karo",
  "Video call pe ajao", "Kaha se ho?", "How old are you?"
];

function getRandomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

function getRandomVisibleBots(count) {
  const botsCopy = [...botUsers];
  const selected = [];
  while (selected.length < count && botsCopy.length > 0) {
    const i = Math.floor(Math.random() * botsCopy.length);
    selected.push({
      id: botsCopy[i].id,
      user: botsCopy[i].user,
      pic: ''
    });
    botsCopy.splice(i, 1);
  }
  return selected;
}

// Always-online bot setup
botUsers.forEach(bot => {
  onlineUsers[bot.id] = {
    id: bot.id,
    user: bot.user,
    pic: ''
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
    updateOnlineUsers();

    // When new user joins, 2-3 bots send messages
    const visibleBots = getRandomVisibleBots(Math.floor(Math.random() * 2) + 2); // 2-3 bots
    visibleBots.forEach((bot, index) => {
      setTimeout(() => {
        io.emit('message', {
          user: bot.user,
          text: getRandomMessage(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }, (index + 1) * 1500); // Delay between bot messages
    });
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
        reply += " (Start video chat?)";
      }

      setTimeout(() => {
        io.to(socket.id).emit('privateMessage', {
          user: bot.user,
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }, 3000 + Math.random() * 3000); // 3-6 sec later bot reply
    }
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socket.id];
    updateOnlineUsers();
  });

  function updateOnlineUsers() {
    const realUsers = Object.values(onlineUsers).filter(u => !u.id.startsWith('bot'));
    const visibleBots = getRandomVisibleBots(Math.floor(Math.random() * 4) + 10); // 10-13 bots
    io.emit('onlineUsers', [...realUsers, ...visibleBots]);
  }
});

// Removed randomBotMessage function to prevent bots from sending messages at intervals

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
