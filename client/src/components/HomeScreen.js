import React from "react";
import Card from "./Card";
import cardsData from "../data/cards.json"; // Import JSON data
import "./HomeScreen.css";
import Chatbox from "./ChatBox";
import { useGame } from "../context/GameContext";
import { createDylanDeck } from "../logic/customDecks";

function HomeScreen() {
    const {
        playerDeck: selectedCards,
        setPlayerDeck: setSelectedCards,
        handleSelectionComplete: onSelectionComplete,
        goLobby,
        goCreateCard,
    } = useGame();

    const handleCardClick = (card, level) => {
        setSelectedCards((prev) => {
            const isAlreadySelected = prev[level].some((c) => c.id === card.id);

            if (isAlreadySelected) {
                // If the card is already selected, remove it
                return {
                    ...prev,
                    [level]: prev[level].filter((c) => c.id !== card.id),
                };
            } else if (prev[level].length < 3) {
                // Only add the card if there are fewer than 3 selected
                return {
                    ...prev,
                    [level]: [...prev[level], { ...card }],
                };
            }

            return prev; // Do nothing if already at max selection
        });
    };

    const handleNext = () => {
        // Check if all levels (1, 2, 3, and 4) have 3 selected cards
        if (
            selectedCards.level1.length === 3 &&
            selectedCards.level2.length === 3 &&
            selectedCards.level3.length === 3 &&
            selectedCards.level4.length === 3 // Check for level4
        ) {
            const freshSelectedCards = JSON.parse(
                JSON.stringify(selectedCards)
            );
            onSelectionComplete(freshSelectedCards);
        } else {
            alert("Please select 3 cards from each level!");
        }
    };

    // Function to select 3 random cards from each level
    const selectRandomTeam = () => {
        const randomSelection = {};

        ["level1", "level2", "level3", "level4"].forEach((level) => {
            const randomCards = [];
            const availableCards = cardsData[level];

            // Randomly shuffle the cards
            while (randomCards.length < 3) {
                const randomIndex = Math.floor(
                    Math.random() * availableCards.length
                );
                const card = availableCards[randomIndex];
                if (!randomCards.some((c) => c.id === card.id)) {
                    randomCards.push(card);
                }
            }

            randomSelection[level] = randomCards;
        });

        // Update selectedCards with the random selection
        setSelectedCards(randomSelection);
    };

    return (
        <div className="HomeScreen">
            <Chatbox />
            <button onClick={() => goCreateCard()}>Create Card</button>
            {/* Button to select random team */}
            <button onClick={selectRandomTeam}>Select Random Deck</button>
            <button onClick={() => setSelectedCards(createDylanDeck)}>
                Select Dylan's Bad Deck
            </button>
            {/* Include level4 in the mapping */}
            {["level1", "level2", "level3", "level4"].map((level) => (
                <div key={level}>
                    <h2>Select 3 Cards from {level.toUpperCase()}</h2>
                    <div className="card-grid">
                        {cardsData[level].map((card) => {
                            const cardWithHealth = {
                                ...card,
                                health: card.maxHealth, // Ensure health is set to maxHealth
                            };

                            return (
                                <div
                                    key={cardWithHealth.id}
                                    className={`card-wrapper ${
                                        selectedCards[level].some(
                                            (c) => c.id === cardWithHealth.id
                                        )
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleCardClick(cardWithHealth, level)
                                    }
                                >
                                    <Card card={cardWithHealth} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            <button onClick={handleNext}>CPU Battle</button>
            <button
                onClick={() => goLobby(selectedCards)}
                disabled={
                    !(
                        (
                            selectedCards.level1.length === 3 &&
                            selectedCards.level2.length === 3 &&
                            selectedCards.level3.length === 3 &&
                            selectedCards.level4.length === 3
                        ) // Check for level4
                    )
                }
            >
                Multi-Player
            </button>
        </div>
    );
}

export default HomeScreen;
