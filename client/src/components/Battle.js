import React, { useState, useEffect } from "react";
import BattleGrid from "./BattleGrid";
import Card from "./Card";
import cardsData from "../data/cards.json"; // Import card data for random opponent cards
import "./Battle.css";
import { handleBattleTurn } from "../logic/battleLogic";

const Battle = ({ playerDeck, onGoHome }) => {
    const [hand, setHand] = useState([...playerDeck.level1]); // Player's current hand
    const [grid, setGrid] = useState({
        slot1: null,
        slot2: null,
        slot3: null,
        slot4: null,
        slot5: null,
        slot6: null,
    });
    const [opponentCards, setOpponentCards] = useState([]); // Opponent's cards
    const [turn, setTurn] = useState(1);
    const [currentLevel, setCurrentLevel] = useState(1); // Track player's deck level
    const [gameOver, setGameOver] = useState(false);
    const [gameResult, setGameResult] = useState(""); // "Victory" or "Defeat"

    // To store the initial state of grid and hand
    const [initialGrid, setInitialGrid] = useState({});
    const [initialHand, setInitialHand] = useState([]);

    useEffect(() => {
        // Function to shuffle an array (Fisher-Yates algorithm)
        const shuffleArray = (array) => {
            let shuffled = [...array]; // Copy array to avoid mutation
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
            }
            return shuffled;
        };

        const getRandomUniqueCards = (level, count) => {
            const levelCards = cardsData[level];
            if (levelCards.length < count) {
                console.warn(`Not enough cards available for level: ${level}`);
                return levelCards; // Return all available if not enough
            }
            return shuffleArray(levelCards).slice(0, count); // Take the first 'count' shuffled cards
        };

        // Generate unique opponent cards
        const generatedOpponentCards = [
            ...getRandomUniqueCards("level1", 3),
            ...getRandomUniqueCards("level2", 3),
            ...getRandomUniqueCards("level3", 3),
        ];

        setOpponentCards(generatedOpponentCards);
    }, []);

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

    const handleEndTurn = () => {
        // Combine opponent's cards with existing cards in their slots
        setGrid((prevGrid) => {
            let newGrid = { ...prevGrid };
            // Sanity check
            if (opponentCards.length > 0) {
                // Combine cards in opponent's slots if they already exist
                for (let i = 0; i < 3; i++) {
                    const slot = `slot${4 + i}`; // slot4, slot5, slot6
                    const opponentCard = opponentCards[i];
                    const existingCard = newGrid[slot];

                    if (existingCard) {
                        // If there's an existing card in the slot, combine it with the new opponent card
                        newGrid[slot] = combineCards(
                            existingCard,
                            opponentCard
                        );
                    } else {
                        // If no card exists, just add the new opponent card
                        newGrid[slot] = opponentCard;
                    }
                }
            }
            return newGrid;
        });

        // Update for the next turn
        setOpponentCards((prev) => prev.slice(3)); // Remove used opponent cards
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

    const doTurn = () => {
        const { updatedPlayerCards, updatedEnemyCards } = handleBattleTurn(
            [grid.slot1, grid.slot2, grid.slot3],
            [grid.slot4, grid.slot5, grid.slot6]
        );

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
    }, [turn]);

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
                    disabled={gameOver}
                >
                    Swap Slots 1 & 2
                </button>
                <button
                    onClick={() => swapCards("slot2", "slot3")}
                    disabled={gameOver}
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
                    onClick={handleEndTurn}
                    disabled={
                        (Object.values(grid)
                            .slice(0, 3)
                            .some((slot) => slot === null) &&
                            hand.length > 0) ||
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

export default Battle;
