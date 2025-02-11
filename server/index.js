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

    function handleJoinGame(roomName, playerDeck) {
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

        state[roomName] = {...state[roomName], 2: {deck: playerDeck, board: [null, null, null]}}; 

        socket.join(roomName);
        socket.number = 2;
        socket.emit("init", 2);
        // **Delay emitting start signal to ensure the room is updated**
        setTimeout(() => {
            io.to(roomName).emit("start-battle");
        }, 50); // 50ms should be enough, but you can tweak it
    }

    function handleNewGame(playerDeck) {
        let roomName = makeid(3);
        serverRooms[socket.id] = roomName;
        socket.emit("gameCode", roomName);

        state[roomName] = {1: {deck: playerDeck, board: [null, null, null]}}; // Placeholder for game state

        socket.join(roomName);
        socket.number = 1;
        socket.emit("init", 1);
    }
});

const PORT = process.env.PORT || 3001; // Never hardcode 3000 for Render

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

