import React, { useState } from "react";
import Card from "./Card";
import cardsData from "../data/cards.json"; // Import the card data
import "./HomeScreen.css";

function HomeScreen({ onSelectionComplete }) {
  const [selectedCards, setSelectedCards] = useState({
    level1: [],
    level2: [],
    level3: [],
  });

  const handleCardClick = (card, level) => {
    // Allow selecting up to 3 cards per level
    if (selectedCards[level].includes(card)) {
      // If card is already selected, remove it
      setSelectedCards((prev) => ({
        ...prev,
        [level]: prev[level].filter((c) => c.id !== card.id),
      }));
    } else if (selectedCards[level].length < 3) {
      // If less than 3 selected, add the card
      setSelectedCards((prev) => ({
        ...prev,
        [level]: [...prev[level], card],
      }));
    }
  };

  const handleNext = () => {
    if (
      selectedCards.level1.length === 3 &&
      selectedCards.level2.length === 3 &&
      selectedCards.level3.length === 3
    ) {
      onSelectionComplete(selectedCards); // Pass selected cards to the next screen
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
            {cardsData[level].map((card) => (
              <div
                key={card.id}
                className={`card-wrapper ${
                  selectedCards[level].includes(card) ? "selected" : ""
                }`}
                onClick={() => handleCardClick(card, level)}
              >
                <Card card={card} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleNext}>Next</button>
    </div>
  );
}

export default HomeScreen;
