const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://bricked.onrender.com", // Removed trailing slash
        methods: ["GET", "POST"],
    },
});

const players = {}; // Fix: Added players object

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("send_message", (data) => {
        io.emit("receive_message", data); // Fix: Send message to all users
        console.log(data);
    });

    // Handle new player joining
    socket.on("joinGame", (playerData) => {
        players[socket.id] = playerData;
        io.emit("updatePlayers", players);
    });

    // Handle card selection updates
    socket.on("updateSelection", (selection) => {
        if (players[socket.id]) {
            players[socket.id].selectedCards = selection;
            io.emit("updatePlayers", players);
        }
    });

    // Handle player disconnection
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});

server.listen(3001, () => {
    console.log("SERVER IS RUNNING");
});
