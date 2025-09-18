import React from "react";
import Card from "./Card";
import cardsData from "../data/cards2.json"; // Import JSON data
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

    // Handle card selection (up to 12 total)
    const handleCardClick = (card) => {
        setSelectedCards((prev) => {
            const isAlreadySelected = prev.some((c) => c.id === card.id);

            if (isAlreadySelected) {
                // remove card
                return prev.filter((c) => c.id !== card.id);
            } else if (prev.length < 12) {
                // add card if under 12
                return [...prev, { ...card }];
            }

            return prev; // do nothing if already at 12
        });
    };

    // Require exactly 12 selected
    const handleNext = () => {
        if (selectedCards.length === 12) {
            const freshSelectedCards = JSON.parse(JSON.stringify(selectedCards));
            onSelectionComplete(freshSelectedCards);
        } else {
            alert("Please select exactly 12 cards!");
        }
    };

    // Select 12 random unique cards
    const selectRandomTeam = () => {
        const randomCards = [];
        const availableCards = [...cardsData.cards];

        while (randomCards.length < 12 && availableCards.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCards.length);
            const [card] = availableCards.splice(randomIndex, 1); // remove from pool
            randomCards.push(card);
        }

        setSelectedCards(randomCards);
    };

    console.log("cardsData:", cardsData);

    return (
        <div className="HomeScreen">
            <Chatbox />
            <button onClick={() => goCreateCard()}>Create Card</button>
            <button onClick={selectRandomTeam}>Select Random Deck</button>
            <button onClick={() => setSelectedCards(createDylanDeck)}>
                Select Dylan's Bad Deck
            </button>

            <div>
                <h2>Select 12 Cards</h2>
                <div className="card-grid">
                    {cardsData.cards.map((card) => {
                        const cardWithHealth = {
                            ...card,
                            health: card.maxHealth,
                        };

                        return (
                            <div
                                key={cardWithHealth.id}
                                className={`card-wrapper ${
                                    selectedCards.some(
                                        (c) => c.id === cardWithHealth.id
                                    )
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() => handleCardClick(cardWithHealth)}
                            >
                                <Card card={cardWithHealth} />
                            </div>
                        );
                    })}
                </div>
            </div>

            <button onClick={handleNext}>CPU Battle</button>
            <button
                onClick={() => goLobby(selectedCards)}
                disabled={selectedCards.length !== 12}
            >
                Multi-Player
            </button>
        </div>
    );
}

export default HomeScreen;
