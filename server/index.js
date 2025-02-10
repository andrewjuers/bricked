const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { makeid } = require("./utils");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://bricked.onrender.com",
        methods: ["GET", "POST"],
    },
});

const state = {};
const serverRooms = {};

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("send_message", (data) => {
        io.emit("receive_message", data); // Broadcast message to all users
    });

    socket.on("newGame", handleNewGame);
    socket.on("joinGame", handleJoinGame);

    function handleJoinGame(roomName) {
        const room = io.sockets.adapter.rooms.get(roomName); // Updated room retrieval

        let numClients = room ? room.size : 0; // Get number of players in the room

        if (numClients === 0) {
            socket.emit("unknownCode");
            return;
        } else if (numClients > 1) {
            socket.emit("tooManyPlayers");
            return;
        }

        serverRooms[socket.id] = roomName;

        socket.join(roomName);
        socket.number = 2;
        socket.emit("init", 2);

        startGameInterval(roomName);
    }

    function handleNewGame() {
        let roomName = makeid(5);
        serverRooms[socket.id] = roomName;
        socket.emit("gameCode", roomName);

        state[roomName] = {}; // Placeholder for game state

        socket.join(roomName);
        socket.number = 1;
        socket.emit("init", 1);
    }
});
