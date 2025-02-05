// src/logic/battleLogic.js

const handleCardAbilitiesBefore = (cards, opponentCards) => {
    return cards.map((card, i) => {
        if (!card) return card; // Skip empty slots

        // Heal Team
        if (card.ability?.["Heal Team"]) {
            cards = cards.map((c) => {
                if (!c || c.health === undefined || c.maxHealth === undefined) {
                    console.warn("Card missing health or maxHealth:", c);
                    return c; // Skip cards with missing health properties
                }
                const newHealth = Math.min(
                    c.health + card.ability["Heal Team"] / 3,
                    c.maxHealth
                );
                return {
                    ...c,
                    health: newHealth,
                };
            });
        }

        // Heal Self
        if (card.ability?.["Heal Self"]) {
            card.health = Math.min(
                card.health + card.ability["Heal Self"] / 2,
                card.maxHealth
            );
        }

        // Attack Abilities
        if (opponentCards) {
            // Right Attack
            if (
                i < 2 &&
                card.ability?.["Right Attack"] &&
                opponentCards[i + 1]
            ) {
                opponentCards[i + 1].health -= card.ability["Right Attack"];
            }

            // Left Attack
            if (
                i > 0 &&
                card.ability?.["Left Attack"] &&
                opponentCards[i - 1]
            ) {
                opponentCards[i - 1].health -= card.ability["Left Attack"];
            }

            // Adjacent Attack
            if (card.ability?.["Adjacent Attack"]) {
                if (i < 2 && opponentCards[i + 1]) {
                    opponentCards[i + 1].health -=
                        card.ability["Adjacent Attack"] / 2;
                }
                if (i > 0 && opponentCards[i - 1]) {
                    opponentCards[i - 1].health -=
                        card.ability["Adjacent Attack"] / 2;
                }
            }

            // Sweep Attack
            if (card.ability?.["Sweep Attack"]) {
                opponentCards.forEach((opponentCard) => {
                    if (opponentCard) {
                        opponentCard.health -= card.ability["Sweep Attack"] / 3;
                    }
                });
            }
        }

        return card;
    });
};

const handleCardAbilitiesAfter = (cards) => {
    return cards.map((card) => {
        if (!card) return card; // Skip empty slots

        // Power-Up (Increase attack after the battle phase)
        if (card.ability?.["Power-Up"]) {
            card.attack += card.ability["Power-Up"]; // Increase attack after battle
        }

        // Apply other "after battle" abilities here if needed

        return card;
    });
};

// Apply Armor to incoming damage
const applyArmor = (card, incomingDamage) => {
    if (card.ability?.["Armor"]) {
        const damageReduction = card.ability["Armor"] / 2;
        return Math.max(incomingDamage - damageReduction, 0); // Armor can't make damage negative
    }
    return incomingDamage; // No armor, return original damage
};

// Apply Thorns damage back to attacker
const applyThorns = (card) => {
    if (card.ability?.["Thorns"]) {
        const thornsDamage = card.ability["Thorns"];
        return thornsDamage; // Return thorns damage
    }
    return 0; // No thorns, return 0 damage
};

export const handleBattleTurn = (playerCards, enemyCards) => {
    // Assumes playerCards and enemyCards are arrays of cards in each lane
    let updatedPlayerCards = [...playerCards];
    let updatedEnemyCards = [...enemyCards];

    // Ability Phase
    updatedPlayerCards = handleCardAbilitiesBefore(
        updatedPlayerCards,
        updatedEnemyCards
    );
    updatedEnemyCards = handleCardAbilitiesBefore(
        updatedEnemyCards,
        updatedPlayerCards
    );

    // Battle Phase
    for (let i = 0; i < 3; i++) {
        let playerCard = updatedPlayerCards[i];
        let enemyCard = updatedEnemyCards[i];

        if (playerCard && enemyCard) {
            // Player attacks enemy card
            let incomingDamage = playerCard.attack;
            incomingDamage = applyArmor(enemyCard, incomingDamage); // Apply Armor to enemy card
            enemyCard.health -= incomingDamage;

            // Enemy attacks player card
            let enemyDamage = enemyCard.attack;
            enemyDamage = applyArmor(playerCard, enemyDamage); // Apply Armor to player card
            playerCard.health -= enemyDamage;

            // If a card's health goes below 0, it's considered "defeated"
            if (enemyCard.health <= 0) {
                enemyCard.health = 0; // Enemy card defeated
            }
            if (playerCard.health <= 0) {
                playerCard.health = 0; // Player card defeated
            }

            // Apply Thorns damage to the attacker after damage is dealt
            if (enemyDamage > 0) {
                const thornsDamage = applyThorns(enemyCard);
                if (thornsDamage > 0) {
                    playerCard.health -= thornsDamage; // Thorns damage to player card
                }
            }

            if (incomingDamage > 0) {
                const thornsDamage = applyThorns(playerCard);
                if (thornsDamage > 0) {
                    enemyCard.health -= thornsDamage; // Thorns damage to enemy card
                }
            }
        }
    }

    // AFTER TURN ABILITIES (like Power-Up, which should increase attack after battle)
    updatedPlayerCards = handleCardAbilitiesAfter(updatedPlayerCards);
    updatedEnemyCards = handleCardAbilitiesAfter(updatedEnemyCards);

    return {
        updatedPlayerCards,
        updatedEnemyCards,
    };
};
