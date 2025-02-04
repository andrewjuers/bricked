import React, { useState } from "react";
import "./App.css";
import io from "socket.io-client";
import HomeScreen from "./components/HomeScreen";
import Battle from "./components/Battle";
import { generateOpponentDeck } from "./logic/computerOpponentLogic";

const socket = io.connect("http://localhost:3001");

function App() {
    const [currentScreen, setCurrentScreen] = useState("home");
    const [playerDeck, setPlayerDeck] = useState([]);
    const [opponentDeck, setOpponentDeck] = useState(null);

    const handleSelectionComplete = (selectedCards) => {
        setPlayerDeck(JSON.parse(JSON.stringify(selectedCards)));  
        setOpponentDeck(generateOpponentDeck());
        setCurrentScreen("battle");
    };

    const goHome = () => {
        setCurrentScreen("home");
    };

    return (
        <div className="App">
            {currentScreen === "home" && <HomeScreen onSelectionComplete={handleSelectionComplete} />}
            {currentScreen === "battle" && (
                <Battle playerDeck={playerDeck} opponentDeck={opponentDeck} onGoHome={goHome} />
            )}
        </div>
    );
}

export default App;
