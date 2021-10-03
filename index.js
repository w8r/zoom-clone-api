const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const port = 3002;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const users = [];
const rooms = {};
function addUser(name, room) {
  rooms[room] = rooms[room] || [];
  rooms[room].push(name);
  users.push({ name, room });
}

function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

function userLeave(userId) {
  const user = users.find((user) => user.id === userId);
  if (user) {
    const room = user.room;
    const index = rooms[room].indexOf(user.name);
    if (index !== -1) {
      rooms[room].splice(index, 1);
    }
    users.splice(users.indexOf(user), 1);
  }
}

app.get("/", (req, res) => {
  res.send({ ok: true });
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("join-room", (roomId, userName) => {
    console.log("user joined room", roomId, userName);
    addUser(userName, roomId);
    socket.join(roomId);
    socket.emit("room-users", getRoomUsers(roomId));
    socket.to(roomId).emit("user-joined", userName);
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
