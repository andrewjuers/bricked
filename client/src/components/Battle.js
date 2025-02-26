import React, { useState, useEffect } from "react";
import BattleGrid from "./BattleGrid";
import Card from "./Card";
import "./Battle.css";
import { handleBattleTurn } from "../logic/battleLogic";
import { useGame } from "../context/GameContext";
import Chatbox from "./ChatBox";

const Battle = () => {
    const {
        playerDeck,
        opponentDeck,
        goHome: onGoHome,
    } = useGame();

    const [hand, setHand] = useState([...playerDeck.level1]); // Player's current hand
    const [grid, setGrid] = useState({
        slot1: null,
        slot2: null,
        slot3: null,
        slot4: null,
        slot5: null,
        slot6: null,
    });
    const [opponentCards, setOpponentCards] = useState([
        ...opponentDeck.level1,
    ]);
    const [turn, setTurn] = useState(1);
    const [currentLevel, setCurrentLevel] = useState(1); // Track player's deck level
    const [gameOver, setGameOver] = useState(false);
    const [gameResult, setGameResult] = useState(""); // "Victory" or "Defeat"

    const [initialGrid, setInitialGrid] = useState({});
    const [initialHand, setInitialHand] = useState([]);

    const normalizeAbilities = (abilities) => {
        if (!abilities || typeof abilities !== "object") {
            return {};
        }
        return abilities;
    };

    const combineCards = (existingCard, newCard) => {
        // Normalize abilities to ensure they are objects
        const existingAbilities = normalizeAbilities(existingCard.ability);
        const newAbilities = normalizeAbilities(newCard.ability);
    
        // Merge abilities by adding values together
        let combinedAbilities = Object.entries({
            ...existingAbilities,
            ...newAbilities,
        }).reduce((acc, [key, value]) => {
            acc[key] = (existingAbilities[key] || 0) + (newAbilities[key] || 0);
            return acc;
        }, {});
    
        // Check if either card has "Double Basic" and apply effect
        const hasDoubleBasic = existingCard.id === 32 || newCard.id === 32;
        if (hasDoubleBasic) {
            const abilityKeys = Object.keys(combinedAbilities);
            if (abilityKeys.length > 0) {
                const firstAbility = abilityKeys[0]; // Get the first ability key
                combinedAbilities[firstAbility] *= 2; // Double its value
            }
        }
    
        return {
            id: [
                ...(Array.isArray(existingCard.id) ? existingCard.id : [existingCard.id]),
                newCard.id,
            ],
            name: `${existingCard.name} + ${newCard.name}`,
            health: Number(existingCard.health) + Number(newCard.health),
            attack: existingCard.attack + newCard.attack,
            ability: combinedAbilities,
            level: Math.max(existingCard.level, newCard.level),
            maxHealth: existingCard.maxHealth + newCard.maxHealth,
        };
    };    

    const handleCardDrop = (slot, card) => {
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
        setGrid((prevGrid) => {
            let newGrid = { ...prevGrid };

            if (opponentCards.length > 0) {
                for (let i = 0; i < 3; i++) {
                    const slot = `slot${4 + i}`;
                    const opponentCard = opponentCards[i];
                    const existingCard = newGrid[slot];

                    if (existingCard) {
                        newGrid[slot] = combineCards(
                            existingCard,
                            opponentCard
                        );
                    } else {
                        newGrid[slot] = opponentCard;
                    }
                }
            }
            return newGrid;
        });

        setTurn(turn + 1);

        setOpponentCards([]);
        if (currentLevel === 1 && opponentDeck.level2) {
            setOpponentCards([...opponentDeck.level2]);
        } else if (currentLevel === 2 && opponentDeck.level3) {
            setOpponentCards([...opponentDeck.level3]);
        } else if (currentLevel === 3 && opponentDeck.level4) {
            setOpponentCards([...opponentDeck.level4]);
        }

        if (hand.length === 0) {
            if (currentLevel === 1 && playerDeck.level2) {
                setHand([...playerDeck.level2]);
                setCurrentLevel(2);
            } else if (currentLevel === 2 && playerDeck.level3) {
                setHand([...playerDeck.level3]);
                setCurrentLevel(3);
            } else if (currentLevel === 3 && playerDeck.level4) {
                setHand([...playerDeck.level4]);
                setCurrentLevel(4);
            }
        }
    };

    const doTurn = () => {
        const { updatedPlayerCards, updatedEnemyCards } = handleBattleTurn(
            [grid.slot1, grid.slot2, grid.slot3],
            [grid.slot4, grid.slot5, grid.slot6]
        );

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
            setGrid((prevGrid) => {
                let newGrid = { ...initialGrid };
                Object.keys(newGrid).forEach((slot) => {
                    if (prevGrid[slot]?.health <= 0) {
                        newGrid[slot] = null;
                    }
                });

                return newGrid;
            });
        }

        setHand(initialHand);
    };

    const startTurn = () => {
        setInitialGrid(() => {
            let newGrid = { ...grid };
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
        // eslint-disable-next-line
    }, [turn]);

    return (
        <div className="battle-container">
            <div className="battle-chat">
                <Chatbox />
            </div>
            <div className="battle-area">
                {gameOver && (
                    <div>
                        <h1>Game Over</h1>
                        <h2>{gameResult}</h2>
                    </div>
                )}
                <button onClick={onGoHome}>Back to Home</button>
                <h2>Turn {turn}</h2>
                <BattleGrid
                    grid={grid}
                    onCardDrop={handleCardDrop}
                    turn={turn}
                />
                <div>
                    <button onClick={() => swapCards("slot1", "slot2")}>
                        Swap Slots 1 & 2
                    </button>
                    <button onClick={() => swapCards("slot2", "slot3")}>
                        Swap Slots 2 & 3
                    </button>
                </div>
                <div className="player-cards">
                    {hand.map((card) => (
                        <Card key={card.id} card={card} />
                    ))}
                </div>
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
        </div>
    );
};

export default Battle;
