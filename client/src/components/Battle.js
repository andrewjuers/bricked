import React, { useState, useEffect } from "react";
import BattleGrid from "./BattleGrid";
import Card from "./Card";
import "./Battle.css";
import { handleBattleTurn } from "../logic/battleLogic";
import { useGame } from "../context/GameContext";
import Chatbox from "./ChatBox";

const Battle = () => {
    const { playerDeck, opponentDeck, goHome: onGoHome } = useGame();

    // Shuffle helper (Fisher-Yates)
    const shuffle = (array) => {
        const arr = Array.isArray(array) ? [...array] : [];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    // Shuffle both decks on mount
    const [playerDeckShuffled] = useState(() => shuffle(playerDeck));
    const [opponentDeckShuffled] = useState(() => shuffle(opponentDeck));

    // Draw first 3 and keep remaining as draw pile
    const [hand, setHand] = useState(playerDeckShuffled.slice(0, 3));
    const [remainingDeck, setRemainingDeck] = useState(playerDeckShuffled.slice(3));

    const [opponentHand, setOpponentHand] = useState(opponentDeckShuffled.slice(0, 3));
    const [opponentRemainingDeck, setOpponentRemainingDeck] = useState(opponentDeckShuffled.slice(3));

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

    // pendingMerge holds data when player dropped a card onto occupied slot (turn >= 2)
    // shape: { slot, existingCard, newCard } or null
    const [pendingMerge, setPendingMerge] = useState(null);

    useEffect(() => {
        startTurn();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [turn]);

    const normalizeAbilities = (abilities) => {
        if (!abilities || typeof abilities !== "object") {
            return {};
        }
        return abilities;
    };

    // combineCards now accepts chosenStat: 'health' | 'attack' | 'ability'
    const combineCards = (existingCard, newCard, chosenStat) => {
        const existingAbilities = normalizeAbilities(existingCard.ability);
        const newAbilities = normalizeAbilities(newCard.ability);

        const combinedId = [
            ...(Array.isArray(existingCard.id) ? existingCard.id : [existingCard.id]),
            newCard.id,
        ];

        // default values: take most from newCard
        const result = {
            id: combinedId,
            name: `${existingCard.name} + ${newCard.name}`,
            // default: adopt new card's base stats
            health: Number(newCard.health),
            attack: Number(newCard.attack),
            ability: { ...newAbilities },
            maxHealth: Number(newCard.maxHealth || newCard.health || 0),
            level: Math.max(existingCard.level || 1, newCard.level || 1),
        };

        if (chosenStat === "health") {
            // combine health & maxHealth, keep new card's attack & ability
            result.health = Number(existingCard.health || 0) + Number(newCard.health || 0);
            result.maxHealth = Number(existingCard.maxHealth || 0) + Number(newCard.maxHealth || 0);
            // attack & ability already set to newCard's
        } else if (chosenStat === "attack") {
            // combine attack, keep new health & ability
            result.attack = Number(existingCard.attack || 0) + Number(newCard.attack || 0);
            // health/maxHealth/ability remain from newCard
        } else if (chosenStat === "ability") {
            // merge ability objects by summing values
            const mergedAbilities = Object.entries({
                ...existingAbilities,
                ...newAbilities,
            }).reduce((acc, [key, value]) => {
                acc[key] = (existingAbilities[key] || 0) + (newAbilities[key] || 0);
                return acc;
            }, {});
            result.ability = mergedAbilities;
            // health/attack remain from newCard
        }

        return result;
    };

    // When dropping a card into a slot
    const handleCardDrop = (slot, card) => {
        // protect against invalid input
        if (!card) return;

        const isCardAlreadyInSlot = Object.values(grid).some(
            (existingCard) =>
                existingCard &&
                (existingCard.id === card.id || existingCard.name === card.name)
        );

        if (isCardAlreadyInSlot) {
            alert("This card is already placed in a slot!");
            return;
        }

        // empty player slots: slot1-slot3
        if (grid[slot] === null && ["slot1", "slot2", "slot3"].includes(slot)) {
            // place directly and remove from hand
            setGrid((prevGrid) => ({
                ...prevGrid,
                [slot]: card,
            }));
            setHand((prevHand) => prevHand.filter((item) => item.id !== card.id));
            return;
        }

        // If slot occupied and turn >= 2, prompt for stat choice (set pendingMerge)
        if (turn > 1 && grid[slot] !== null && ["slot1", "slot2", "slot3"].includes(slot)) {
            const existingCard = grid[slot];
            // set pending merge; we do NOT remove new card from hand yet
            setPendingMerge({ slot, existingCard, newCard: card });
            return;
        }

        // fallback (should not usually hit)
        alert("Can't place card here.");
    };

    // finish merge after player chooses a stat
    const finishMerge = (chosenStat) => {
        if (!pendingMerge) return;
        const { slot, existingCard, newCard } = pendingMerge;

        const combinedCard = combineCards(existingCard, newCard, chosenStat);

        setGrid((prevGrid) => ({
            ...prevGrid,
            [slot]: combinedCard,
        }));

        // remove newCard from hand now that merge confirmed
        setHand((prevHand) => prevHand.filter((c) => c.id !== newCard.id));

        setPendingMerge(null);
    };

    const cancelMerge = () => {
        setPendingMerge(null);
    };

    // End turn logic: opponent places their hand onto slots 4-6 (combine automatically using old rule)
    const handleEndTurn = () => {
        setGrid((prevGrid) => {
            let newGrid = { ...prevGrid };

            if (opponentHand.length > 0) {
                for (let i = 0; i < opponentHand.length; i++) {
                    const slot = `slot${4 + i}`;
                    const opponentCard = opponentHand[i];
                    const existingCard = newGrid[slot];

                    if (existingCard) {
                        // opponent combining uses previous combined logic (sum everything)
                        const combined = combineCards(existingCard, opponentCard, "health"); 
                        // NOTE: we choose "health" combine here as a fast approach to add HP (you can change).
                        // If you want opponents to use different combine rules, modify as needed.
                        newGrid[slot] = combined;
                    } else {
                        newGrid[slot] = opponentCard;
                    }
                }
            }

            return newGrid;
        });

        setTurn((t) => t + 1);

        // draw new hands if possible
        setHand(remainingDeck.slice(0, 3));
        setRemainingDeck((prev) => prev.slice(3));

        setOpponentHand(opponentRemainingDeck.slice(0, 3));
        setOpponentRemainingDeck((prev) => prev.slice(3));
    };

    // battle resolution using your handleBattleTurn
    const doTurn = () => {
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

        setGrid(newGrid);

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

    // Reset turn logic (preserve dead removal)
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

    // Start Turn: capture initial grid/hand for reset, then run auto-battle if turn > 1
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

                <BattleGrid grid={grid} onCardDrop={handleCardDrop} turn={turn} />

                <div>
                    <button onClick={() => swapCards("slot1", "slot2")}>Swap Slots 1 & 2</button>
                    <button onClick={() => swapCards("slot2", "slot3")}>Swap Slots 2 & 3</button>
                </div>

                <div className="player-cards">
                    {hand.map((card) => (
                        <Card key={Array.isArray(card.id) ? card.id.join("-") : card.id} card={card} />
                    ))}
                </div>

                <div className="action-buttons">
                    <button
                        onClick={handleEndTurn}
                        disabled={
                            (Object.values(grid).slice(0, 3).some((slot) => slot === null) &&
                                hand.length > 0) ||
                            gameOver ||
                            !!pendingMerge // don't allow end-turn when waiting for merge choice
                        }
                    >
                        End Turn
                    </button>
                    <button onClick={resetTurn} disabled={gameOver || !!pendingMerge}>Reset Turn</button>
                </div>

                {/* Pending merge UI */}
                {pendingMerge && (
                    <div className="merge-choice-overlay">
                        <div className="merge-choice">
                            <h3>Combine "{pendingMerge.newCard.name}" with "{pendingMerge.existingCard.name}"</h3>
                            <p>Choose one stat to combine (others will be from the new card):</p>
                            <div className="merge-buttons">
                                <button onClick={() => finishMerge("health")}>Combine Health</button>
                                <button onClick={() => finishMerge("attack")}>Combine Attack</button>
                                <button onClick={() => finishMerge("ability")}>Combine Ability</button>
                                <button onClick={cancelMerge}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Battle;
