import React, { useState, useEffect } from "react";
import BattleGrid from "./BattleGrid";
import Card from "./Card";
import "./Battle.css";
import { io } from "socket.io-client";

const socket = io("https://bricked.onrender.com", {
    transports: ["websocket"],
});

const MultiplayerBattle = ({ playerDeck, playerNumber, onGoHome }) => {
    const [hand, setHand] = useState([...playerDeck.level1]);
    const [grid, setGrid] = useState({
        slot1: null,
        slot2: null,
        slot3: null,
        slot4: null,
        slot5: null,
        slot6: null,
    });
    const [turn, setTurn] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [gameResult, setGameResult] = useState(""); 
    const [initialGrid, setInitialGrid] = useState({});
    const [initialHand, setInitialHand] = useState([]);
    const [isEndTurnClicked, setIsEndTurnClicked] = useState(false);  // New state for disabling button

    const sendEndTurn = () => {
        socket.emit("end-turn", {
            playerNumber: playerNumber,
            board: [grid.slot1, grid.slot2, grid.slot3],
        });
        setIsEndTurnClicked(true);  // Disable the button once clicked
    };

    const handleEndTurn = () => {
        setTurn(turn + 1);
        setIsEndTurnClicked(false); // Re-enable button once turn is complete

        if (hand.length === 0) {
            if (currentLevel === 1 && playerDeck.level2) {
                setHand([...playerDeck.level2]);
                setCurrentLevel(2);
            } else if (currentLevel === 2 && playerDeck.level3) {
                setHand([...playerDeck.level3]);
                setCurrentLevel(3);
            }
        }
    };

    const doTurn = (state) => {
        const [updatedPlayerCards, updatedEnemyCards] =
            playerNumber === 1
                ? [state[1].board, state[2].board]
                : [state[2].board, state[1].board];

        setGrid({
            slot1: updatedPlayerCards[0]?.health > 0 ? updatedPlayerCards[0] : null,
            slot2: updatedPlayerCards[1]?.health > 0 ? updatedPlayerCards[1] : null,
            slot3: updatedPlayerCards[2]?.health > 0 ? updatedPlayerCards[2] : null,
            slot4: updatedEnemyCards[0]?.health > 0 ? updatedEnemyCards[0] : null,
            slot5: updatedEnemyCards[1]?.health > 0 ? updatedEnemyCards[1] : null,
            slot6: updatedEnemyCards[2]?.health > 0 ? updatedEnemyCards[2] : null,
        });

        if (turn <= 2) return;

        const playerSlotsEmpty = updatedPlayerCards.every(
            (card) => card === null || card.health === 0
        );
        const opponentSlotsEmpty = updatedEnemyCards.every(
            (card) => card === null || card.health === 0
        );

        if (playerSlotsEmpty || opponentSlotsEmpty) {
            setGameOver(true);
            setGameResult(playerSlotsEmpty ? "Defeat" : "Victory");
            if (playerSlotsEmpty && opponentSlotsEmpty) setGameResult("Tie!!!");
        }

        handleEndTurn();
    };

    useEffect(() => {
        socket.on("do-turn", doTurn);
        return () => {
            socket.off("do-turn", doTurn);
        };
    }, []);

    return (
        <div>
            {gameOver && (
                <div>
                    <h1>Game Over</h1>
                    <h2>{gameResult}</h2>
                </div>
            )}
            <button onClick={onGoHome}>Back to Home</button>
            <h2>Turn {turn}</h2>
            <BattleGrid grid={grid} onCardDrop={handleCardDrop} turn={turn} />

            <div>
                <button
                    onClick={sendEndTurn}
                    disabled={isEndTurnClicked || 
                        (Object.values(grid).slice(0, 3).some((slot) => slot === null) && hand.length > 0) || 
                        gameOver
                    }
                >
                    End Turn
                </button>
                <button onClick={resetTurn} disabled={gameOver}>
                    Reset Turn
                </button>
            </div>
        </div>
    );
};

export default MultiplayerBattle;
