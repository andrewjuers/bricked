import React, { createContext, useContext, useState } from "react";
import { generateOpponentDeck } from "../logic/computerOpponentLogic";

const GameContext = createContext();

export function GameProvider({ children }) {
    const [currentScreen, setCurrentScreen] = useState("home");
    const [playerDeck, setPlayerDeck] = useState({
        level1: [],
        level2: [],
        level3: [],
    });
    const [opponentDeck, setOpponentDeck] = useState(null);
    const [playerNumber, setPlayerNumber] = useState(null);
    const [roomId, setRoomId] = useState("NOT IN GAME");

    const handleSelectionComplete = (selectedCards) => {
        setPlayerDeck(selectedCards);
        setOpponentDeck(generateOpponentDeck());
        setCurrentScreen("battle");
    };

    const goHome = () => setCurrentScreen("home");
    const goLobby = (selectedCards) => {
        setPlayerDeck(selectedCards);
        setCurrentScreen("lobby");
    };
    const startMultiBattle = () => setCurrentScreen("multi-battle");

    return (
        <GameContext.Provider
            value={{
                currentScreen,
                setCurrentScreen,
                playerDeck,
                setPlayerDeck,
                opponentDeck,
                playerNumber,
                setPlayerNumber,
                roomId,
                setRoomId,
                handleSelectionComplete,
                goHome,
                goLobby,
                startMultiBattle,
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    return useContext(GameContext);
}
