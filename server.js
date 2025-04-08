<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ChatWithStranger</title>
  <style>
    body { font-family: sans-serif; background: #222; color: white; text-align: center; margin: 0; }
    #chat { max-width: 500px; margin: 50px auto; }
    #messages { height: 300px; overflow-y: scroll; background: #333; padding: 10px; border-radius: 10px; }
    input, button { padding: 10px; margin-top: 10px; width: 80%; border-radius: 5px; border: none; }
  </style>
</head>
<body>
  <div id="chat">
    <h2>Talk with Strangers 💬</h2>
    <div id="messages"></div>
    <input id="msg" placeholder="Type your message..." />
    <button onclick="send()">Send</button>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();
    const messages = document.getElementById('messages');

    socket.on('message', data => {
      const div = document.createElement('div');
      div.textContent = data;
      messages.appendChild(div);
    });

    function send() {
      const input = document.getElementById('msg');
      socket.emit('message', input.value);
      input.value = '';
    }
  </script>
</body>
</html>
