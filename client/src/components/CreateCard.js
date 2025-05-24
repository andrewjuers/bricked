import React, { useState } from "react";
import Card from "./Card";
import { useGame } from "../context/GameContext";
import "./CreateCard.css"; // Import the CSS file

const CreateCard = () => {
    const { goHome } = useGame();

    const [level, setLevel] = useState(1);
    const [name, setName] = useState("Name");
    const [health, setHealth] = useState(7); // Initial health based on level
    const [attack, setAttack] = useState(3); // Initial attack based on level
    const [abilityName, setAbilityName] = useState("");
    const [abilityValue, setAbilityValue] = useState(0);
    const [cardDataJson, setCardDataJson] = useState(""); // New state for JSON data

    const levelMod = level - 1;

    const totalPoints = (level == 1) ? 10 : level * 2 + 10;
    const minHealth = level * 7 - 2 + levelMod;
    const maxHealth = level * 7 + 2 + levelMod;
    const minAttack = level * 3 - 2 + levelMod;
    const maxAttack = level * 3 + 2 + levelMod;
    const remainingPoints = totalPoints - (health + attack + abilityValue);

    const handleLevelChange = (e) => {
        const newLevel = parseInt(e.target.value);
        setLevel(newLevel);
        setHealth(newLevel * 7);
        setAttack(newLevel * 3);
        setAbilityValue(0);
    };

    const handleStatChange = (setter, currentValue, value, min, max) => {
        const newValue = parseInt(value) || 0;
        if (newValue >= min && newValue <= max && newValue - currentValue <= remainingPoints) {
            setter(newValue);
        }
    };

    const handleAbilityChange = (e) => {
        const newValue = parseInt(e.target.value) || 0;

        // If there are remaining points, we can increase the ability value
        if (newValue > abilityValue && newValue <= remainingPoints + abilityValue) {
            setAbilityValue(newValue);
        }
        // If there is a value in the ability and we want to decrease, we can do so
        else if (newValue < abilityValue && newValue >= 0) {
            setAbilityValue(newValue);
        }
    };

    const handleExport = () => {
        const cardData = JSON.stringify({
            id: -1,
            name,
            level,
            health,
            maxHealth: health, // Adding maxHealth with the same value as health
            attack,
            ability: abilityName ? { [abilityName]: abilityValue } : {},
        }, null, 2); // Pretty-printing with indentation
        setCardDataJson(cardData); // Store the JSON in the state        
    };

    const card = {
        id: -1, // You can update this dynamically if needed
        name,
        health,
        attack,
        ability: abilityName ? { [abilityName]: abilityValue } : {}, // Only add ability if a name is provided
    };

    return (
        <div className="create-card-container">
            <button className="go-home-button" onClick={goHome}>Go Home</button>
            <h2>Create a Card</h2>

            <label>
                Level:
                <select value={level} onChange={handleLevelChange}>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                </select>
            </label>
            <br />

            <label>
                Name:
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <br />

            <label>
                Health:
                <input
                    type="number"
                    value={health}
                    onChange={(e) => handleStatChange(setHealth, health, e.target.value, minHealth, maxHealth)}
                />
            </label>
            <br />

            <label>
                Attack:
                <input
                    type="number"
                    value={attack}
                    onChange={(e) => handleStatChange(setAttack, attack, e.target.value, minAttack, maxAttack)}
                />
            </label>
            <br />

            <label>
                Ability:
                <input
                    type="text"
                    placeholder="Ability Name"
                    value={abilityName}
                    onChange={(e) => setAbilityName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Value"
                    value={abilityValue}
                    onChange={handleAbilityChange}
                />
            </label>
            <br />

            <p>Remaining Points: {remainingPoints}</p>

            {/* Center the Card Component */}
            <div className="card-preview">
                <Card card={card} />
            </div>

            <button className="export-button" onClick={handleExport}>Export</button>

            {cardDataJson && (
                <div>
                    <h3>Card Data JSON:</h3>
                    <textarea
                        value={cardDataJson}
                        readOnly
                        rows={10} // You can adjust the rows to suit your needs
                        style={{ width: "100%", fontFamily: "monospace", padding: "10px" }}
                    />
                </div>
            )}
        </div>
    );
};

export default CreateCard;
