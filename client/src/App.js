import React from "react";
import "./App.css";
import HomeScreen from "./components/HomeScreen";
import Battle from "./components/Battle";
import MultiplayerBattle from "./components/MultiplayerBattle";
import Lobby from "./components/Lobby";
import { useGame } from "./context/GameContext";
import CreateCard from "./components/CreateCard";

function App() {
    const { currentScreen } = useGame();

    return (
        <div className="App">
            {currentScreen === "home" && <HomeScreen />}
            {currentScreen === "battle" && <Battle />}
            {currentScreen === "lobby" && <Lobby />}
            {currentScreen === "multi-battle" && <MultiplayerBattle />}
            {currentScreen === "create-card" && <CreateCard />}
        </div>
    );
}

export default App;
