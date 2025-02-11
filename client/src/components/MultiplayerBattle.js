import React, { useState, useEffect } from "react";
import BattleGrid from "./BattleGrid";
import Card from "./Card";
import "./Battle.css";
import { io } from "socket.io-client";

const socket = io("https://bricked.onrender.com", {
    transports: ["websocket"],
});

const MultiplayerBattle = ({ playerDeck, playerNumber, onGoHome }) => {
    const [hand, setHand] = useState([...playerDeck.level1]); // Player's current hand
    const [grid, setGrid] = useState({
        slot1: null,
        slot2: null,
        slot3: null,
        slot4: null,
        slot5: null,
        slot6: null,
    });
    const [turn, setTurn] = useState(1);
    const [currentLevel, setCurrentLevel] = useState(1); // Track player's deck level
    const [gameOver, setGameOver] = useState(false);
    const [gameResult, setGameResult] = useState(""); // "Victory" or "Defeat"
    const [isEndTurnDisabled, setIsEndTurnDisabled] = useState(false); // Disable end turn button

    // To store the initial state of grid and hand
    const [initialGrid, setInitialGrid] = useState({});
    const [initialHand, setInitialHand] = useState([]);

    const normalizeAbilities = (abilities) => {
        if (!abilities || typeof abilities !== "object") {
            return {}; // Return an empty object if no abilities
        }
        return abilities; // Already normalized as an object
    };

    // Function to combine two cards
    const combineCards = (existingCard, newCard) => {
        return {
            id: [
                ...(Array.isArray(existingCard.id)
                    ? existingCard.id
                    : [existingCard.id]),
                newCard.id,
            ], // Combine IDs
            name: `${existingCard.name} + ${newCard.name}`, // Combine names
            health: Number(existingCard.health) + Number(newCard.health), // Add health
            attack: existingCard.attack + newCard.attack, // Add attack
            ability: Object.entries({
                ...normalizeAbilities(existingCard.ability),
                ...normalizeAbilities(newCard.ability),
            }).reduce((acc, [key, value]) => {
                acc[key] =
                    (existingCard.ability[key] || 0) +
                    (newCard.ability[key] || 0);
                return acc;
            }, {}), // Merge abilities, adding values for duplicate abilities
            level: Math.max(existingCard.level, newCard.level), // Max level
            maxHealth: existingCard.maxHealth + newCard.maxHealth,
        };
    };

    const handleCardDrop = (slot, card) => {
        // Check if the card is already in a slot
        const isCardAlreadyInSlot = Object.values(grid).some(
            (existingCard) =>
                existingCard &&
                (existingCard.id === card.id || existingCard.name === card.name)
        );

        if (isCardAlreadyInSlot) {
            alert("This card is already placed in a slot!");
            return;
        }

        if (grid[slot] === null && ["slot1", "slot2", "slot3"].includes(slot)) {
            setGrid((prevGrid) => ({
                ...prevGrid,
                [slot]: card,
            }));
            setHand((prevHand) =>
                prevHand.filter((item) => item.id !== card.id)
            );
        } else if (
            turn > 1 &&
            grid[slot] !== null &&
            ["slot1", "slot2", "slot3"].includes(slot)
        ) {
            const existingCard = grid[slot];

            if (existingCard.level !== card.level) {
                // Combine cards using the reusable combineCards function
                const combinedCard = combineCards(existingCard, card);

                setGrid((prevGrid) => ({
                    ...prevGrid,
                    [slot]: combinedCard,
                }));
                setHand((prevHand) =>
                    prevHand.filter((item) => item.id !== card.id)
                );
            } else {
                alert("Can't do!");
            }
        }
    };

    const sendEndTurn = () => {
        socket.emit("end-turn", {
            playerNumber: playerNumber,
            board: [grid.slot1, grid.slot2, grid.slot3],
        });
    };

    const handleEndTurn = () => {
        setTurn(turn + 1);

        // Load the next level of cards if the hand is empty
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
        // Update the grid slots with the new card states
        setGrid({
            slot1:
                updatedPlayerCards[0] && updatedPlayerCards[0].health > 0
                    ? updatedPlayerCards[0]
                    : null,
            slot2:
                updatedPlayerCards[1] && updatedPlayerCards[1].health > 0
                    ? updatedPlayerCards[1]
                    : null,
            slot3:
                updatedPlayerCards[2] && updatedPlayerCards[2].health > 0
                    ? updatedPlayerCards[2]
                    : null,
            slot4:
                updatedEnemyCards[0] && updatedEnemyCards[0].health > 0
                    ? updatedEnemyCards[0]
                    : null,
            slot5:
                updatedEnemyCards[1] && updatedEnemyCards[1].health > 0
                    ? updatedEnemyCards[1]
                    : null,
            slot6:
                updatedEnemyCards[2] && updatedEnemyCards[2].health > 0
                    ? updatedEnemyCards[2]
                    : null,
        });
        handleEndTurn();
        if (turn <= 2) return;
        // Check end condition
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
    };

    const resetTurn = () => {
        // On turn 1, reset the grid to null slots
        if (turn === 1) {
            setGrid({
                slot1: null,
                slot2: null,
                slot3: null,
                slot4: null,
                slot5: null,
                slot6: null,
            });
        } else {
            // On turn 2 and beyond, reset to the initial state of the grid
            setGrid((prevGrid) => {
                let newGrid = { ...initialGrid }; // Start with the initial grid
                // Loop through each slot and nullify dead cards
                Object.keys(newGrid).forEach((slot) => {
                    if (prevGrid[slot]?.health <= 0) {
                        newGrid[slot] = null;
                    }
                });

                return newGrid;
            });
        }
        // Reset the hand to the original hand for this turn
        setHand(initialHand);
    };

    const startTurn = () => {
        // Save the initial state of grid and hand at the start of the turn
        setInitialGrid(() => {
            let newGrid = { ...grid }; // Start with the initial grid
            // Loop through each slot and nullify dead cards
            Object.keys(grid).forEach((slot) => {
                if (grid[slot]?.health === 0) {
                    newGrid[slot] = null;
                }
            });
            return newGrid;
        });
        setInitialHand(hand);
        if (turn > 1) doTurn();
    };

    const swapCards = (slotA, slotB) => {
        setGrid((prevGrid) => {
            const newGrid = { ...prevGrid };
            const temp = newGrid[slotA];
            newGrid[slotA] = newGrid[slotB];
            newGrid[slotB] = temp;
            return newGrid;
        });
    };

    useEffect(() => {
        startTurn();
        setIsEndTurnDisabled(false);
    }, [turn]);

    useEffect(() => {
        const handleDoTurn = (state) => {
            console.log("working");
            doTurn(state);
        }

        socket.on("do-turn", handleDoTurn);

        return () => {
            socket.off("do-turn", doTurn);
        };
    }, []);

    const handleEndTurnButtonClick = () => {
        setIsEndTurnDisabled(true); // Disable button on click
        sendEndTurn();
    };

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
            {/* Combined Player and Opponent Grid */}
            <BattleGrid grid={grid} onCardDrop={handleCardDrop} turn={turn} />

            {/* Swap Position Buttons */}
            <div>
                <button
                    onClick={() => swapCards("slot1", "slot2")}
                    disabled={gameOver || isEndTurnDisabled}
                >
                    Swap Slots 1 & 2
                </button>
                <button
                    onClick={() => swapCards("slot2", "slot3")}
                    disabled={gameOver || isEndTurnDisabled}
                >
                    Swap Slots 2 & 3
                </button>
            </div>

            {/* Render Player's Cards Below the Grid */}
            <div className="player-cards">
                {hand.map((card) => (
                    <Card key={card.id} card={card} />
                ))}
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <button
                    onClick={handleEndTurnButtonClick}
                    disabled={isEndTurnDisabled || 
                        (Object.values(grid)
                            .slice(0, 3)
                            .some((slot) => slot === null) && hand.length > 0) || 
                        gameOver}
                >
                    End Turn
                </button>
                <button onClick={resetTurn} disabled={gameOver || isEndTurnDisabled}>
                    Reset Turn
                </button>
            </div>
        </div>
    );
};

export default MultiplayerBattle;
