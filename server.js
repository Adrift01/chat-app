// --- SERVER CODE ---
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

const botUsers = Array.from({ length: 45 }, (_, i) => {
  const names = [
    'Tania Khan', 'Ratul', 'Priya Sharma', 'Mehedi Hasan', 'Riya',
    'Rohit Kumar', 'Sneha', 'Karan Mehta', 'Neha', 'Amit',
    'Simran Kaur', 'Sourav', 'Ankita', 'Farhan', 'Nisha',
    'Arjun Kapoor', 'Preeti', 'Deepak', 'Kriti', 'Zaid',
    'Tanisha Das', 'Shivam', 'Nikita Jain', 'Fahim', 'Ruksar',
    'Yash', 'Puja Roy', 'Arif', 'Sana Khan', 'Imran',
    'Tushar', 'Meera', 'Ravi', 'Reena', 'Kabir',
    'Monika', 'Ajay', 'Tina', 'Zoya', 'Parth',
    'Ayesha', 'Jay', 'Rina', 'Dev', 'Isha'
  ];
  const id = `bot${i + 1}`;
  const user = names[i];
  botReplyCounter[id] = 0;
  return { id, user, pic: '' };
});

const messages = [
  "Hey, what's up?", "Kya haal hai?", "Aj kuch interesting hua?", "Bore ho raha hoon 😅",
  "Chalo gossip karein!", "Call karo kya?", "Tumi kemon acho?", "Kya dekh rahe ho abhi?",
  "Let's play a game!", "Koi active hai kya?", "Kotha bolbo?", "Bhalo lagche tomar sathe",
  "Free signup diye video call koro", "Just click and join call", "Kemon vibes yaha",
  "Mujhe tumse baat karni thi", "Nice talking to you!", "Public chat to full on hai 😄",
  "Join me in private?", "Khub moja lagche", "Koi joke sunao!", "Zyada time nai mere paas",
  "Let's chill for a bit", "So many active users omg!", "Tumhara naam kya hai?",
  "Koi movie suggest karo", "Video call join koro", "Ekbar call try koro na",
  "Privacy maintained rahega 😏", "Bangladesh ke ho?", "Bengali na Hindi?",
  "Hasi ashche message gulo poray", "Private chat valo lagche", "Tumi ki student?"
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
        reply += " (Click here for video chat 👇)";
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

setInterval(() => {
  const bot = botUsers[Math.floor(Math.random() * botUsers.length)];
  const message = {
    user: bot.user,
    pic: bot.pic,
    text: getRandomMessage(),
    time: new Date().toLocaleString()
  };
  io.emit('message', message);
}, 18000);

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
