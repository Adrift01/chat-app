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
let botReplyCounter = {}; // Track replies per bot

const botUsers = [
  { id: 'bot1', user: 'Tania Khan', pic: '' },
  { id: 'bot2', user: 'Ratul', pic: '' },
  { id: 'bot3', user: 'Priya Sharma', pic: '' },
  { id: 'bot4', user: 'Mehedi Hasan', pic: '' },
  { id: 'bot5', user: 'Riya', pic: '' },
  { id: 'bot6', user: 'Rohit Verma', pic: '' },
  { id: 'bot7', user: 'Sneha Das', pic: '' },
  { id: 'bot8', user: 'Karan', pic: '' },
  { id: 'bot9', user: 'Neha Singh', pic: '' },
  { id: 'bot10', user: 'Amit', pic: '' },
  { id: 'bot11', user: 'Simran Kaur', pic: '' },
  { id: 'bot12', user: 'Sourav', pic: '' },
  { id: 'bot13', user: 'Ankita Roy', pic: '' },
  { id: 'bot14', user: 'Farhan Ali', pic: '' },
  { id: 'bot15', user: 'Nisha', pic: '' },
  { id: 'bot16', user: 'Arjun', pic: '' },
  { id: 'bot17', user: 'Preeti Yadav', pic: '' },
  { id: 'bot18', user: 'Deepak', pic: '' },
  { id: 'bot19', user: 'Kriti Joshi', pic: '' },
  { id: 'bot20', user: 'Zaid', pic: '' },
  { id: 'bot21', user: 'Moni Akter', pic: '' },
  { id: 'bot22', user: 'Nayeem Hossain', pic: '' },
  { id: 'bot23', user: 'Puja', pic: '' },
  { id: 'bot24', user: 'Arif Chowdhury', pic: '' },
  { id: 'bot25', user: 'Tumpa', pic: '' },
  { id: 'bot26', user: 'Rahul Gupta', pic: '' },
  { id: 'bot27', user: 'Sadia', pic: '' },
  { id: 'bot28', user: 'Anik', pic: '' },
  { id: 'bot29', user: 'Payel', pic: '' },
  { id: 'bot30', user: 'Junaid Alam', pic: '' },
  { id: 'bot31', user: 'Rimi', pic: '' },
  { id: 'bot32', user: 'Tanvir', pic: '' },
  { id: 'bot33', user: 'Shuvo Das', pic: '' },
  { id: 'bot34', user: 'Nandita', pic: '' },
  { id: 'bot35', user: 'Imran Khan', pic: '' },
  { id: 'bot36', user: 'Lina', pic: '' },
  { id: 'bot37', user: 'Wasif', pic: '' },
  { id: 'bot38', user: 'Moumita', pic: '' },
  { id: 'bot39', user: 'Ayon', pic: '' },
  { id: 'bot40', user: 'Ishita', pic: '' },
];

const messages = [
  "Hey bro, ki obosta?",
  "What's going on?",
  "Kya kar rahe ho aap?",
  "Free ho? ekta call hoy?",
  "Ektu private e ashbo? 😅",
  "Movie dekhteso?",
  "Hello stranger 😁",
  "Onno keu active nai?",
  "Tui kothai thakis?",
  "Video call e ashle fun hobe 😌",
  "Game khelbi?",
  "Facebook use korish?",
  "Tor pic ta bhalo laglo",
  "Ami bored feel kortesi",
  "Ki dekhchis YouTube e?",
  "Khub interesting lagche ajke",
  "Ekhane anek user active",
  "Wow onek onek valo lagse",
  "Private e ektu aiso",
  "Tor sathe kotha bolte bhalo lagche"
];

function getRandomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

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

      if (replyCount % 6 === 0) {
        reply += " (click here for video call👇)";
      }

      setTimeout(() => {
        io.to(socket.id).emit('privateMessage', {
          user: bot.user,
          text: reply,
          time: new Date().toLocaleString()
        });
      }, 2500 + Math.random() * 2500);
    }
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socket.id];
    io.emit('onlineUsers', Object.values(onlineUsers));
  });
});

setInterval(() => {
  const bot = botUsers[Math.floor(Math.random() * botUsers.length)];
  const message = {
    user: bot.user,
    pic: bot.pic,
    text: getRandomMessage(),
    time: new Date().toLocaleString()
  };
  io.emit('message', message);
}, 20000);

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
