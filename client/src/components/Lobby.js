import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io.connect("https://bricked.onrender.com", {
    transports: ["websocket"],
});

const Lobby = () => {
    const [playerNumber, setPlayerNumber] = useState("NOT IN GAME");
    const [roomId, setRoomId] = useState("NOT IN GAME");

    useEffect(() => {
        socket.on("gameCode", (code) => {
            setRoomId(code);
        });

        socket.on("init", (number) => {
            setPlayerNumber(number);
        });
    }, []);

    const newGame = () => {
        socket.emit("newGame");
    }

    return (
        <div>
            <h1>Player {playerNumber}</h1>
            <h1>Game Code: {roomId}</h1>
            <button onClick={newGame}>New Game</button>
        </div>
    );
};

export default Lobby;