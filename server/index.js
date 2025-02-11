const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { makeid } = require("./utils");
const { handleBattleTurn } = require("../shared/battleLogic");

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
    socket.on("end-turn", handleEndTurn);

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

        state[roomName] = {
            ...state[roomName],
            2: { deck: playerDeck, board: [null, null, null], done: false },
        };

        socket.emit("gameCode", roomName);
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

        state[roomName] = {
            1: { deck: playerDeck, board: [null, null, null], done: false },
        }; // Placeholder for game state

        socket.join(roomName);
        socket.number = 1;
        socket.emit("init", 1);
    }

    // MULTI-PLAYER BATTLE
    function handleEndTurn(playerObj, roomId) {
        const roomName = roomId;
        if (!state[roomName]) return;
        socket.join(roomName);

        state[roomName][playerObj.playerNumber].board = playerObj.board;
        state[roomName][playerObj.playerNumber].done = true;

        const otherPlayerNumber = playerObj.playerNumber === 1 ? 2 : 1;

        setTimeout(() => {
            if (state[roomName][otherPlayerNumber].done) {
                console.log(state[roomName]);
                const { updatedPlayerCards, updatedEnemyCards } =
                    handleBattleTurn(
                        state[roomName][1].board,
                        state[roomName][2].board
                    );
                state[roomName][1].board = updatedPlayerCards;
                state[roomName][2].board = updatedEnemyCards;
                state[roomName][1].done = false;
                state[roomName][2].done = false;
                io.to(roomName).emit("do-turn", state[roomName]);
            }
        }, 50);
    }
});

const PORT = process.env.PORT || 3001; // Never hardcode 3000 for Render

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
