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
    const [room, setRoom] = useState("");

    const handleSelectionComplete = (selectedCards) => {
        setPlayerDeck(JSON.parse(JSON.stringify(selectedCards)));
        setOpponentDeck(generateOpponentDeck());
        setCurrentScreen("battle");
    };

    const goHome = () => {
        setCurrentScreen("home");
    };

    const startBattle = (selectedCards) => {
        setCurrentScreen("multi-battle");
    };

    return (
        <div className="App">
            {currentScreen === "home" && (
                <HomeScreen
                    onSelectionComplete={handleSelectionComplete}
                    startBattle={startBattle}
                    room={room}
                    setRoom={setRoom} // Pass down setRoom so the HomeScreen can update it
                />
            )}
            {currentScreen === "battle" && (
                <Battle
                    playerDeck={playerDeck}
                    opponentDeck={opponentDeck}
                    onGoHome={goHome}
                />
            )}
            {currentScreen === "multi-battle" && <Lobby />}
        </div>
    );
}

export default App;
