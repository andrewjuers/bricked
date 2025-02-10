import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://bricked.onrender.com", {
    transports: ["websocket"],
});

const Lobby = ({onGoHome, startMultiBattle, playerDeck}) => {
    const [playerNumber, setPlayerNumber] = useState("NOT IN GAME");
    const [roomId, setRoomId] = useState("NOT IN GAME");
    const [joinCode, setJoinCode] = useState("");

    useEffect(() => {
        const handleGameCode = (code) => {
            setRoomId(code);
        };

        const handleInit = (number) => {
            setPlayerNumber(number);
            if (number === 2) startMultiBattle();
        };

        

        socket.on("gameCode", handleGameCode);
        socket.on("init", handleInit);

        return () => {
            socket.off("gameCode", handleGameCode);
            socket.off("init", handleInit);
        };
    }, []);

    const newGame = () => {
        socket.emit("newGame", playerDeck);
    };

    const joinGame = () => {
        if (joinCode.trim() !== "") {
            socket.emit("joinGame", joinCode, playerDeck);
        }
    };

    return (
        <div>
            <button onClick={onGoHome}>Back to Home</button>
            <h1>Player Number: {playerNumber}</h1>
            <h1>Game Code: {roomId}</h1>
            <button onClick={newGame}>New Game</button>

            <div>
                <input
                    type="text"
                    placeholder="Enter game code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                />
                <button onClick={joinGame}>Join Game</button>
            </div>
        </div>
    );
};

export default Lobby;
