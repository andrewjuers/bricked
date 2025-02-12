import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useGame } from "../context/GameContext";

const socket = io("https://bricked.onrender.com", {
    transports: ["websocket"],
});

const Lobby = () => {
    const {
        goHome: onGoHome,
        startMultiBattle,
        playerDeck,
        setPlayerNumber,
        roomId,
        setRoomId,
    } = useGame();

    const [joinCode, setJoinCode] = useState("");

    useEffect(() => {
        const handleGameCode = (code) => {
            setRoomId(code);
        };

        const handleInit = (number) => {
            setPlayerNumber(number);
        };

        const startBattle = () => {
            startMultiBattle();
        };

        socket.on("gameCode", handleGameCode);
        socket.on("init", handleInit);
        socket.on("start-battle", startBattle);

        return () => {
            socket.off("gameCode", handleGameCode);
            socket.off("init", handleInit);
            socket.off("start-battle", startBattle);
        };
        // eslint-disable-next-line
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
