const chatForm = document.getElementById("chat-form");
const socket = io();
const roomName = document.getElementById("room-name");
const usersName = document.getElementById("users");
const chatMessages = document.querySelector("chat-messages");
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
console.log(username, room);

socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);
  //chatMessages.scrollTop = chatMessages.scrollHeight;
});
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsersName(users);
});
socket.emit("joinRoom", { username, room });
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  socket.emit("chatMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
            <p class="text">
              ${message.text}
            </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

function outputRoomName(id) {
  roomName.innerText = room;
}
function outputUsersName(users) {
  usersName.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}`;
}
