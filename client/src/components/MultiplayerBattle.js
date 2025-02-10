import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import BattleGrid from "./BattleGrid";
import Card from "./Card";
import "./Battle.css";
import { handleBattleTurn } from "../logic/battleLogic";

const socket = io.connect("https://bricked.onrender.com", {
    transports: ["websocket"],
});

const MultiplayerBattle = ({ playerDeck, onGoHome }) => {
    const [hand, setHand] = useState([...playerDeck.level1]);
    const [grid, setGrid] = useState({
        slot1: null, slot2: null, slot3: null,
        slot4: null, slot5: null, slot6: null,
    });
    const [opponentHand, setOpponentHand] = useState([]);
    const [turn, setTurn] = useState(1);
    const [playerId, setPlayerId] = useState(null);
    const [opponentId, setOpponentId] = useState(null);
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gameResult, setGameResult] = useState("");

    useEffect(() => {
        socket.on("connect", () => {
            setPlayerId(socket.id);
            socket.emit("joinGame");
        });

        socket.on("gameStart", ({ opponent, firstTurn }) => {
            setOpponentId(opponent);
            setIsPlayerTurn(firstTurn === socket.id);
        });

        socket.on("updateState", (newState) => {
            setGrid(newState.grid);
            setOpponentHand(newState.opponentHand);
            setTurn(newState.turn);
            setIsPlayerTurn(newState.currentTurn === socket.id);
        });

        socket.on("gameOver", (result) => {
            setGameOver(true);
            setGameResult(result);
        });

        return () => {
            socket.off("connect");
            socket.off("gameStart");
            socket.off("updateState");
            socket.off("gameOver");
        };
    }, []);

    const handleCardDrop = (slot, card) => {
        if (!isPlayerTurn) return;

        if (grid[slot] === null) {
            const newGrid = { ...grid, [slot]: card };
            setGrid(newGrid);
            setHand((prevHand) => prevHand.filter((c) => c.id !== card.id));
            socket.emit("playCard", { grid: newGrid, playerId: socket.id });
        }
    };

    const handleEndTurn = () => {
        if (!isPlayerTurn) return;

        const { updatedPlayerCards, updatedEnemyCards } = handleBattleTurn(
            [grid.slot1, grid.slot2, grid.slot3],
            [grid.slot4, grid.slot5, grid.slot6]
        );

        const newGrid = {
            slot1: updatedPlayerCards[0]?.health > 0 ? updatedPlayerCards[0] : null,
            slot2: updatedPlayerCards[1]?.health > 0 ? updatedPlayerCards[1] : null,
            slot3: updatedPlayerCards[2]?.health > 0 ? updatedPlayerCards[2] : null,
            slot4: updatedEnemyCards[0]?.health > 0 ? updatedEnemyCards[0] : null,
            slot5: updatedEnemyCards[1]?.health > 0 ? updatedEnemyCards[1] : null,
            slot6: updatedEnemyCards[2]?.health > 0 ? updatedEnemyCards[2] : null,
        };

        socket.emit("endTurn", {
            grid: newGrid,
            turn: turn + 1,
            playerId: socket.id,
        });
    };

    return (
        <div className="battle-container">
            <h2>{isPlayerTurn ? "Your Turn" : "Opponent's Turn"}</h2>
            <BattleGrid grid={grid} onCardDrop={handleCardDrop} />
            <div className="hand">
                {hand.map((card) => (
                    <Card key={card.id} card={card} onCardDrop={handleCardDrop} />
                ))}
            </div>
            <button onClick={handleEndTurn} disabled={!isPlayerTurn}>
                End Turn
            </button>
            {gameOver && <h3>{gameResult}</h3>}
        </div>
    );
};

export default MultiplayerBattle;
