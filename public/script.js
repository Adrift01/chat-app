const socket = io();
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const onlineUsersList = document.getElementById("onlineUsers");
const userCount = document.getElementById("userCount");
const currentUserDisplay = document.getElementById("currentUser");

// Get user info from localStorage
const user = JSON.parse(localStorage.getItem("chatUser"));

if (!user) {
  window.location.href = "index.html";
}

socket.emit("join", user);
currentUserDisplay.innerText = `You: ${user.user}`;

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (messageInput.value.trim()) {
    const data = {
      user: user.user,
      pic: user.pic,
      text: messageInput.value,
      time: new Date().toLocaleTimeString()
    };
    socket.emit("message", data);
    messageInput.value = "";
  }
});

socket.on("message", (data) => {
  appendMessage(data, false);
});

socket.on("onlineUsers", (users) => {
  userCount.innerText = "300+";
  renderOnlineUsers(users);
});

socket.on("privateMessage", (data) => {
  showPrivatePopup(data.user, data.text);
});

function appendMessage(data, isPrivate) {
  const div = document.createElement("div");
  div.className = `p-2 rounded-xl max-w-xl ${isPrivate ? "bg-pink-100 ml-auto text-right" : "bg-white"}`;
  div.innerHTML = `
    <div class="text-sm text-gray-500">${data.user} • ${data.time}</div>
    <div class="text-base">${data.text}</div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function renderOnlineUsers(users) {
  onlineUsersList.innerHTML = "";
  users.forEach(u => {
    if (u.id !== socket.id) {
      const li = document.createElement("li");
      li.className = "p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2";
      li.innerHTML = `
        <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
        <span>${u.user}</span>
      `;
      li.addEventListener("click", () => {
        const text = prompt(`Send private message to ${u.user}:`);
        if (text) {
          socket.emit("privateMessage", {
            to: u.id,
            user: user.user,
            text,
            time: new Date().toLocaleTimeString()
          });
          appendMessage({ user: `To ${u.user}`, text, time: new Date().toLocaleTimeString() }, true);
        }
      });
      onlineUsersList.appendChild(li);
    }
  });
}

function showPrivatePopup(fromUser, text) {
  const div = document.createElement("div");
  div.className = "fixed bottom-10 right-10 bg-white shadow-xl border p-4 rounded-xl max-w-sm";
  div.innerHTML = `
    <div class="font-bold text-blue-600">${fromUser}</div>
    <div class="my-2">${text}</div>
    <button class="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" onclick="this.parentElement.remove()">Close</button>
  `;
  document.body.appendChild(div);
}
