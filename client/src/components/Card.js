import React from "react";
import "./Card.css";
import cards from "../data/cards.json";

// Utility function to calculate max health
const calculateMaxHealth = (idOrIds) => {
    let totalMaxHealth = 0;
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

    for (const id of ids) {
        let foundCard = null;
        for (const level in cards) {
            foundCard = cards[level].find((card) => card.id === id);
            if (foundCard) {
                totalMaxHealth += foundCard.maxHealth || foundCard.health || 0;
                break;
            }
        }
        if (!foundCard) {
            console.warn(`Card with id ${id} not found.`);
        }
    }

    return totalMaxHealth;
};

const Card = ({ card }) => {
    const { name, health, attack, ability, id } = card;

    const handleDragStart = (event) => {
        event.dataTransfer.setData("card", JSON.stringify(card));
    };

    const abilities =
        ability && Object.keys(ability).length > 0
            ? Object.entries(ability)
                  .map(([key, value]) => `${key} (${value})`)
                  .join(", ")
            : "";

    return (
        <div className="card" draggable="true" onDragStart={handleDragStart}>
            {/* Top section with health and attack */}
            <div className="card-top">
                <div className="card-health">
                    {health}/{calculateMaxHealth(id)}
                </div>
                <div className="card-attack">{attack}</div>
            </div>
            {/* Main content */}
            <div className="card-body">
                <div className="card-name">{name}</div>
                {abilities && <div className="card-abilities">{abilities}</div>}
            </div>
        </div>
    );
};

export default Card;
