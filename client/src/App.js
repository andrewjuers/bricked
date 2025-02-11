import React, { useState } from "react";
import "./App.css";
import io from "socket.io-client";
import HomeScreen from "./components/HomeScreen";
import Battle from "./components/Battle";
import { generateOpponentDeck } from "./logic/computerOpponentLogic";
import MultiplayerBattle from "./components/MultiplayerBattle";
import Lobby from "./components/Lobby";

const socket = io.connect("https://bricked.onrender.com", {
    transports: ["websocket"],
});

function App() {
    const [currentScreen, setCurrentScreen] = useState("home");
    const [playerDeck, setPlayerDeck] = useState([]);
    const [opponentDeck, setOpponentDeck] = useState(null);
    const [playerNumber, setPlayerNumber] = useState(null);

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
    }

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
            {currentScreen === "lobby" && <Lobby onGoHome={goHome} startMultiBattle={startMultiBattle} playerDeck={playerDeck} setPlayerNumber={setPlayerNumber}/>}
            {currentScreen === "multi-battle" && <MultiplayerBattle onGoHome={goHome} playerDeck={playerDeck} playerNumber={playerNumber}/>}
        </div>
    );
}

export default App;
