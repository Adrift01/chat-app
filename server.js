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
let botReplyCounter = {}; // Track each bot's replies

// 40+ bots, mixed naming style
const botUsers = [
  { id: 'bot1', user: 'Tania Rahman' }, { id: 'bot2', user: 'Ratul' },
  { id: 'bot3', user: 'Priya Sinha' }, { id: 'bot4', user: 'Mehedi Hasan' },
  { id: 'bot5', user: 'Riya' }, { id: 'bot6', user: 'Rohit Sharma' },
  { id: 'bot7', user: 'Sneha' }, { id: 'bot8', user: 'Karan Singh' },
  { id: 'bot9', user: 'Neha Kumari' }, { id: 'bot10', user: 'Amit' },
  { id: 'bot11', user: 'Simran' }, { id: 'bot12', user: 'Sourav Pal' },
  { id: 'bot13', user: 'Ankita Das' }, { id: 'bot14', user: 'Farhan Akhtar' },
  { id: 'bot15', user: 'Nisha' }, { id: 'bot16', user: 'Arjun' },
  { id: 'bot17', user: 'Preeti Sharma' }, { id: 'bot18', user: 'Deepak' },
  { id: 'bot19', user: 'Kriti Sanon' }, { id: 'bot20', user: 'Zaid' },
  { id: 'bot21', user: 'Ananya' }, { id: 'bot22', user: 'Junaid Alam' },
  { id: 'bot23', user: 'Ishita' }, { id: 'bot24', user: 'Nabil' },
  { id: 'bot25', user: 'Rakesh' }, { id: 'bot26', user: 'Trisha' },
  { id: 'bot27', user: 'Madhurima' }, { id: 'bot28', user: 'Ramesh' },
  { id: 'bot29', user: 'Nusrat' }, { id: 'bot30', user: 'Hasib Uddin' },
  { id: 'bot31', user: 'Tanmay' }, { id: 'bot32', user: 'Zoya Khan' },
  { id: 'bot33', user: 'Avni' }, { id: 'bot34', user: 'Rituparna' },
  { id: 'bot35', user: 'Pritam Roy' }, { id: 'bot36', user: 'Alina' },
  { id: 'bot37', user: 'Rajiv' }, { id: 'bot38', user: 'Sapna' },
  { id: 'bot39', user: 'Himel' }, { id: 'bot40', user: 'Rehan Ahmed' },
  { id: 'bot41', user: 'Tithi' }, { id: 'bot42', user: 'Joy' },
  { id: 'bot43', user: 'Sayem Hossain' }
];

const messages = [
  "Hi there!", "Kya haal hai?", "Ki khobor?", "What's going on?",
  "Tumhara naam ki hai?", "Bore lagche tai chat e eshechi",
  "Let's play a game!", "Tomake dekhte bhalo lagche 😅",
  "Arey baap re eto active log!", "Video chat try korle bhalo lage",
  "Ajke toh sobai onek active!", "Tum kahaan se ho?",
  "Tui kon theke chat korchis?", "Ektu coffee kheye ashi ☕",
  "Let's be friends!", "Free signup diye chat korte paro 😄",
  "Emon kono din chat e ashi na 😆", "Nice talking to you!",
  "Cholo ekta joke boli 🤣", "Tumi ki facebook use koro?",
  "Aj office gelo?", "Movie dekhecho recently?",
  "Call korbo naki? 😋", "Ami toh ekdom free ekhon",
  "Sotti, tumi onek bhalo chat partner",
  "Tumi kon class e poro?", "Khubi bhalo lagche kotha bole","wana fun with me ? come to video chat now",
  "Chat korle bhalo lage",
  "Kew ekta joke sunao 😆",
  "Koi movie dekhecho?",
  "Tumi kotheke chat korcho?",
  "Mujhe thoda lonely lag raha hai",
  "Cholo game khela jai 🎮",
  "Tomar sathe kotha bole bhalo laglo",
  "wow so many active users today",
  "video chat pe bohot jyada fun hua",
  "Facebook use korcho?",
  "Aibar call e ashbo naki? 😅",
  "Bujhlam na, ektu bujhao",
  "Free signup karke video call karo",
  "free signup button pe click karo then signup karo free mai video call kar payoge",
  "video call pe ajaw"
];

function getRandomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
  const replies = [
    "Hi",
    "okay lets chat here first 🤖",
    "you can give video call now",
    "i will tell you everything there 😉"
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

// Add bots to onlineUsers and set counter
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
      }, 2000 + Math.random() * 3000);
    }
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socket.id];
    io.emit('onlineUsers', Object.values(onlineUsers));
  });
});

function botRandomMessageLoop() {
  const delay = Math.floor(Math.random() * 8000) + 2000; // 2s to 10s

  setTimeout(() => {
    const botCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 bots will reply
    for (let i = 0; i < botCount; i++) {
      const bot = botUsers[Math.floor(Math.random() * botUsers.length)];
      const message = {
        user: bot.user,
        pic: bot.pic,
        text: getRandomMessage(),
        time: new Date().toLocaleString()
      };
      io.emit('message', message);
    }

    botRandomMessageLoop(); // recursive call for next round
  }, delay);
}

// Start the random bot loop
botRandomMessageLoop();

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
