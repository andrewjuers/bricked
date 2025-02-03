import React from "react";
import Card from "./Card"; // Import the Card component
import "./BattleGrid.css";

const BattleGrid = ({ grid, onCardDrop, turn }) => {
    const handleDrop = (slot, event) => {
        event.preventDefault();
        const cardData = event.dataTransfer.getData("card");
        const card = JSON.parse(cardData);
        onCardDrop(slot, card); // Handle the card drop
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    return (
        <div className="battle-grid">
            {/* Opponent Row */}
            <div className="player-row">
                <div className={`card-slot ${grid.slot4 ? "occupied" : ""}`}>
                    {grid.slot4 ? (
                        <Card card={grid.slot4} /> // Pass the combined card data
                    ) : (
                        "Opponent Slot 1"
                    )}
                </div>
                <div className={`card-slot ${grid.slot5 ? "occupied" : ""}`}>
                    {grid.slot5 ? (
                        <Card card={grid.slot5} /> // Pass the combined card data
                    ) : (
                        "Opponent Slot 2"
                    )}
                </div>
                <div className={`card-slot ${grid.slot6 ? "occupied" : ""}`}>
                    {grid.slot6 ? (
                        <Card card={grid.slot6} /> // Pass the combined card data
                    ) : (
                        "Opponent Slot 3"
                    )}
                </div>
            </div>

            {/* Player Row */}
            <div className="player-row">
                <div
                    className={`card-slot ${grid.slot1 ? "occupied" : ""}`}
                    onDrop={(event) => handleDrop("slot1", event)}
                    onDragOver={handleDragOver}
                >
                    {grid.slot1 ? <Card card={grid.slot1} /> : "Player Slot 1"}
                </div>
                <div
                    className={`card-slot ${grid.slot2 ? "occupied" : ""}`}
                    onDrop={(event) => handleDrop("slot2", event)}
                    onDragOver={handleDragOver}
                >
                    {grid.slot2 ? <Card card={grid.slot2} /> : "Player Slot 2"}
                </div>
                <div
                    className={`card-slot ${grid.slot3 ? "occupied" : ""}`}
                    onDrop={(event) => handleDrop("slot3", event)}
                    onDragOver={handleDragOver}
                >
                    {grid.slot3 ? <Card card={grid.slot3} /> : "Player Slot 3"}
                </div>
            </div>
        </div>
    );
};

export default BattleGrid;
