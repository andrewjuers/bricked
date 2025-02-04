import React, { useState, useEffect } from "react";
import Card from "./Card";
import cardsData from "../data/cards.json"; // Import JSON data
import "./HomeScreen.css";

function HomeScreen({ onSelectionComplete }) {
    const [selectedCards, setSelectedCards] = useState({
        level1: [],
        level2: [],
        level3: [],
    });

    const handleCardClick = (card, level) => {
        setSelectedCards((prev) => {
            const updatedLevel = prev[level].some((c) => c.id === card.id)
                ? prev[level].filter((c) => c.id !== card.id) // Remove card
                : [...prev[level], { ...card }]; // Clone card before adding

            return {
                ...prev,
                [level]: updatedLevel,
            };
        });
    };

    const handleNext = () => {
        if (
            selectedCards.level1.length === 3 &&
            selectedCards.level2.length === 3 &&
            selectedCards.level3.length === 3
        ) {
            // Deep copy selected cards to prevent external modifications
            const freshSelectedCards = JSON.parse(
                JSON.stringify(selectedCards)
            );

            onSelectionComplete(freshSelectedCards);
        } else {
            alert("Please select 3 cards from each level!");
        }
    };

    return (
        <div className="HomeScreen">
            {["level1", "level2", "level3"].map((level) => (
                <div key={level}>
                    <h2>Select 3 Cards from {level.toUpperCase()}</h2>
                    <div className="card-grid">
                        {cardsData[level].map((card) => {
                            const cardWithHealth = {
                                ...card,
                                health: card.maxHealth,
                            }; // Ensure health is set to maxHealth

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
            <button onClick={handleNext}>Next</button>
        </div>
    );
}

export default HomeScreen;
