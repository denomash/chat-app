import express from "express";
import socketio from "socket.io";
import http from "http";
import router from "./router";
import { addUser, removeUser, getUser, getUserInRoom } from "./users";

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  // Functionality when user joins a room
  socket.on("join", ({ name, room }, callBack) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callBack(error);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name}, has joined!` });

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });

    callBack();
  });

  // Functionality when user sends a message
  socket.on("sendMessage", (message, callBack) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callBack();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    io.to(user.room).emit("message", {
      user: "admin",
      test: `${user.name} has left.`,
    });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });
  });
});

app.use(router);

// Listen to server
server.listen(PORT, () => console.log(`Server running on locolhost:${PORT}`));
