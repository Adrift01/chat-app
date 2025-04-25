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
let publicMessages = [];  // Store public messages

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
  { id: 'bot19', user: 'Kriti Sanon' }, { id: 'bot20', user: 'Zaid' }
];

const messages = [
  "Hi there", "Kya haal hai?", "i wana fun with you baby come to video call now i am alone", "What's going on?",
  "Koi hya jo video call pe ayega abhi?", "Bore lagche tai chat e eshechi",
  "Let's play a game!", "Tomake dekhte bhalo lagche 😅",
  "Arey baap re eto active log!", "Video chat try korle bhalo lage",
  "Ajke toh sobai onek active!", "Tum kahaan se ho?",
  "Tui kon theke chat korchis?", "Vije ase amar ta thela dilei dhuke jabe",
  "Let's be friends!", "Free signup diye chat korte paro 😄",
  "Emon kono din chat e ashi na 😆", "Nice talking to you!",
  "Cholo ekta joke boli 🤣", "Tumi ki facebook use koro?",
  "khel ba ?", "Any one from dhaka?",
  "Call korbo naki? 😋", "Ami toh ekdom free ekhon",
  "Sotti, tumi onek bhalo chat partner", "Tumi kon class e poro?",
  "i am very naughty baby", "wana fun with me ? come to video chat now",
  "Chat korle bhalo lage", "Kew ekta joke sunao 😆",
  "mujhe xxx movie dekhaoge koi?", "Tumi kotheke chat korcho?",
  "Mujhe thoda lonely lag raha hai", "Bangladeshi kaw acho naki?",
  "Tomar sathe kotha bole bhalo laglo", "wow so many active users today",
  "video chat pe bohot jyada fun hua", "Akhane video chat korte parchi na tmr whatsapp number daw",
  "Aibar call e ashbo naki? 😅", "Bujhlam na, ektu bujhao",
  "Tmr telegram id ki bolo ami call dissi", "koi hai kya jo masti k mood mai ho?",
  "video call pe ajaw", "hi", "kaha se ho?", "how old are you ?"
];

function getRandomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

// Initialize bots and users
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

    // Send previous public messages to the user joining
    socket.emit('publicMessages', publicMessages); // Send public message history

    // When a real user joins, trigger 5-7 bots to send one public message each
    const activeBots = [...botUsers]; // Clone array
    const numberOfBots = Math.floor(Math.random() * 3) + 5; // 5 to 7 bots
    const selectedBots = [];

    for (let i = 0; i < numberOfBots; i++) {
      if (activeBots.length === 0) break;
      const index = Math.floor(Math.random() * activeBots.length);
      selectedBots.push(activeBots.splice(index, 1)[0]);
    }

    selectedBots.forEach((bot, i) => {
      setTimeout(() => {
        const message = {
          user: bot.user,
          text: getRandomMessage(),
          time: new Date().toLocaleString()
        };
        publicMessages.push(message);  // Store the message in history
        io.emit('message', message);  // Emit message to all clients
      }, 1000 * (i + 1));
    });
  });

  // Handle incoming public messages
  socket.on('message', (data) => {
    const message = {
      user: data.user,
      text: data.text,
      time: new Date().toLocaleString()
    };
    publicMessages.push(message);  // Add message to public history
    io.emit('message', message);  // Broadcast message to all clients
  });

  // Handle private messages
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

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
