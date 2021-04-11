const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUser,
} = require("./utils/users");

const bot = "ChatCord Bot";

const app = express();
const server = http.createServer(app);
const io = socketio(server);
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    socket.emit("message", formatMessage(bot, "Welcome to ChatCord!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(bot, `A ${user.username} has joined the chat`)
      );
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUser(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(bot, `${user.username} has left the chat.`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUser(user.room),
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;
app.use(express.static(path.join(__dirname, "public")));
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
