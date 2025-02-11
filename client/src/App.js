import React, { useState } from "react";
import "./App.css";
import HomeScreen from "./components/HomeScreen";
import Battle from "./components/Battle";
import { generateOpponentDeck } from "./logic/computerOpponentLogic";
import MultiplayerBattle from "./components/MultiplayerBattle";
import Lobby from "./components/Lobby";

function App() {
    const [currentScreen, setCurrentScreen] = useState("home");
    const [playerDeck, setPlayerDeck] = useState([]);
    const [opponentDeck, setOpponentDeck] = useState(null);
    const [playerNumber, setPlayerNumber] = useState(null);
    const [roomId, setRoomId] = useState("NOT IN GAME");

    const handleSelectionComplete = (selectedCards) => {
        setPlayerDeck(JSON.parse(JSON.stringify(selectedCards)));
        setOpponentDeck(generateOpponentDeck());
        setCurrentScreen("battle");
    };

    const goHome = () => {
        setCurrentScreen("home");
    };

    const goLobby = (selectedCards) => {
        setPlayerDeck(JSON.parse(JSON.stringify(selectedCards)));
        setCurrentScreen("lobby");
    };

    const startMultiBattle = () => {
        setCurrentScreen("multi-battle");
    };

    return (
        <div className="App">
            {currentScreen === "home" && (
                <HomeScreen
                    onSelectionComplete={handleSelectionComplete}
                    goLobby={goLobby}
                />
            )}
            {currentScreen === "battle" && (
                <Battle
                    playerDeck={playerDeck}
                    opponentDeck={opponentDeck}
                    onGoHome={goHome}
                />
            )}
            {currentScreen === "lobby" && (
                <Lobby
                    onGoHome={goHome}
                    startMultiBattle={startMultiBattle}
                    playerDeck={playerDeck}
                    setPlayerNumber={setPlayerNumber}
                    roomId={roomId}
                    setRoomId={setRoomId}
                />
            )}
            {currentScreen === "multi-battle" && (
                <MultiplayerBattle
                    onGoHome={goHome}
                    playerDeck={playerDeck}
                    playerNumber={playerNumber}
                    roomId={roomId}
                />
            )}
        </div>
    );
}

export default App;
