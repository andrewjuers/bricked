import React, { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import HomeScreen from "./components/HomeScreen";
import Battle from "./components/Battle";

const socket = io.connect("http://localhost:3001");

function App() {
    const [currentScreen, setCurrentScreen] = useState("home");
    const [playerDeck, setPlayerDeck] = useState([]);

    // This is the function that HomeScreen expects for the "onSelectionComplete" prop
    const handleSelectionComplete = (selectedCards) => {
        // Handle the selected cards and transition to battle or another action
        setPlayerDeck(selectedCards);  // Example: Set player deck with selected cards
        setCurrentScreen("battle");    // Transition to battle screen
    };

    const goHome = () => {
        setCurrentScreen("home");
    };

    return (
        <div className="App">
            {currentScreen === "home" && <HomeScreen onSelectionComplete={handleSelectionComplete} />}
            {currentScreen === "battle" && (
                <Battle playerDeck={playerDeck} onGoHome={goHome} />
            )}
        </div>
    );
}

export default App;
