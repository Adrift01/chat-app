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
  { id: 'bot3', user: 'Priya khan' }, { id: 'bot4', user: 'Mehedi Hasan' },
  { id: 'bot5', user: 'Riya' }, { id: 'bot6', user: 'Rohit' },
  { id: 'bot7', user: 'Sneha' }, { id: 'bot8', user: 'Karan Singh' },
  { id: 'bot9', user: 'Neha Kumari' }, { id: 'bot10', user: 'daisy' },
  { id: 'bot11', user: 'Simran' }, { id: 'bot12', user: 'Sumi' },
  { id: 'bot13', user: 'Ankita Das' }, { id: 'bot14', user: 'Faria' },
  { id: 'bot15', user: 'Nisha' }, { id: 'bot16', user: 'Arjun' },
  { id: 'bot17', user: 'Preeti Sharma' }, { id: 'bot18', user: 'Deepak' },
  { id: 'bot19', user: 'Kriti' }, { id: 'bot20', user: 'Shammi' }
];

const messages = [
  "Hi there!", "Kya haal hai?", "i wana fun with you baby come to video call now i am alone", "amn kaw acho club a jaba amr sathe?",
  "Koi hya jo video call pe ayega abhi?", "Bore lagche tai chat e eshechi",
  "uff amar ta vije ache thela dilei dhuke jabe baby", "Tomake dekhte bhalo lagche 😅",
  "Arey baap re eto active log!", "Video chat try korle bhalo lage",
  "Ajke toh sobai onek active!", "Tum kahaan se ho?",
  "Kaw acho j amak thanda kore dite parba", "Hi Tumi ki korba amar sathe tmr id ta daw", "Free signup diye chat korte paro 😄",
  "Emon kono din chat e ashi na 😆", "Nice talking to you!",
  "Cholo ekta joke boli 🤣", "Tumi ki facebook use koro?",
  "khel ba ?", "Tumi ki bangladeshi?",
  "Call korbo naki? 😋", "Ami toh ekdom free ekhon",
  "Sotti, tumi onek bhalo chat partner", "Dhaka te thako amn kaw acho?",
  "i am very naughty baby", "wana fun with me ? come to video chat now",
  "Chat korle bhalo lage", "hey",
  "mujhe xxx movie dekhaoge koi?", "free hoile inbox koro",
  "Mujhe thoda lonely lag raha hai",
  "Tomar sathe kotha bole bhalo laglo", "wow so many active users today",
  "video chat pe bohot jyada fun hua", "Facebook use korcho?",
  "Aibar call e ashbo naki? 😅", "Bujhlam na, ektu bujhao",
  "Free signup karke video call karo",
  "video call pe ajaw", "hi", "kaha se ho?", "how old are you ?"
];

function getRandomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

function getRandomVisibleBots(count = 3) {
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

    // Select 2 bots to send public messages after user join
    const visibleBots = getRandomVisibleBots(Math.floor(Math.random() * 2) + 3);
    const botsToChat = [...visibleBots];
    for (let i = 0; i < 2 && botsToChat.length > 0; i++) {
      const index = Math.floor(Math.random() * botsToChat.length);
      const bot = botsToChat.splice(index, 1)[0];

      setTimeout(() => {
        io.emit('message', {
          user: bot.user,
          text: getRandomMessage(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }, 1000 + Math.random() * 2000);
    }
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
        reply += " (start video chat ?)";
      }

      setTimeout(() => {
        io.to(socket.id).emit('privateMessage', {
          user: bot.user,
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }, 2000 + Math.random() * 3000);
    }
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socket.id];
    updateOnlineUsers();
  });

  function updateOnlineUsers() {
    const realUsers = Object.values(onlineUsers).filter(u => !u.id.startsWith('bot'));
    const visibleBots = getRandomVisibleBots(Math.floor(Math.random() * 2) + 3);
    io.emit('onlineUsers', [...realUsers, ...visibleBots]);
  }
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
