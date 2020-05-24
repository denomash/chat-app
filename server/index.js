import express from "express";
import socketio from "socket.io";
import http from "http";
import router from "./router";

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  console.log("We have a new connection!!!");

  socket.on("join", ({ name, room}, callBack) => {
    console.log(name, room);
  });

  socket.on("disconnect", () => {
    console.log("User has left!!!");
  });
});

app.use(router);

// Listen to server
server.listen(PORT, () => console.log(`Server running on locolhost:${PORT}`));
