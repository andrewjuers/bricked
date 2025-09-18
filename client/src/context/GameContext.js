import React, { createContext, useContext, useState } from "react";
import { generateOpponentDeck } from "../logic/computerOpponentLogic";

const GameContext = createContext();

export function GameProvider({ children }) {
    const [currentScreen, setCurrentScreen] = useState("home");

    // ✅ single deck array instead of level1, level2, level3, level4
    const [playerDeck, setPlayerDeck] = useState([]);
    const [opponentDeck, setOpponentDeck] = useState(null);
    const [playerNumber, setPlayerNumber] = useState(null);
    const [roomId, setRoomId] = useState("NOT IN GAME");

    // New state for battle log
    const [battleLog, setBattleLog] = useState([]);

    const handleSelectionComplete = (selectedCards) => {
        setPlayerDeck(selectedCards); // selectedCards is now just an array
        setOpponentDeck(generateOpponentDeck());
        setCurrentScreen("battle");
    };

    const goHome = () => setCurrentScreen("home");
    const goCreateCard = () => setCurrentScreen("create-card");

    const goLobby = (selectedCards) => {
        setPlayerDeck(selectedCards); // array of 12 cards
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
                goCreateCard,
                battleLog,
                setBattleLog,
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    return useContext(GameContext);
}
