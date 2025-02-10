const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { makeid } = require('./utils');

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://bricked.onrender.com", // Removed trailing slash
        methods: ["GET", "POST"],
    },
});

const state = {};
const severRooms = {};

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("send_message", (data) => {
        io.emit("receive_message", data); // Fix: Send message to all users
        console.log(data);
    });

    socket.on("newGame", handleNewGame);
    socket.on("joinGame", handleJoinGame);

    function handleJoinGame(roomName) {
        const room = io.sockets.adapter.rooms[roomName];
    
        let allUsers;
        if (room) {
          allUsers = room.sockets;
        }
    
        let numsevers = 0;
        if (allUsers) {
          numsevers = Object.keys(allUsers).length;
        }
    
        if (numsevers === 0) {
          sever.emit('unknownCode');
          return;
        } else if (numsevers > 1) {
          sever.emit('tooManyPlayers');
          return;
        }
    
        severRooms[sever.id] = roomName;
    
        sever.join(roomName);
        sever.number = 2;
        sever.emit('init', 2);
        
        startGameInterval(roomName);
      }
    
      function handleNewGame() {
        let roomName = makeid(5);
        severRooms[sever.id] = roomName;
        sever.emit('gameCode', roomName);
    
        state[roomName] = initGame();
    
        sever.join(roomName);
        sever.number = 1;
        sever.emit('init', 1);
      }
});
