// Duplicate file because I'm lazy and can't find a better solution

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
                applyHeal(c, card.ability["Heal Team"] / 3);
                return c;
            });
        }

        // Heal Self
        if (card.ability?.["Heal Self"]) {
            applyHeal(card, card.ability["Heal Self"] / 2);
        }

        // Attack Abilities
        if (opponentCards) {
            // Right Attack
            if (
                i < 2 &&
                card.ability?.["Right Attack"] &&
                opponentCards[i + 1]
            ) {
                applyDamage(
                    card,
                    opponentCards[i + 1],
                    card.ability["Right Attack"]
                );
            }

            // Left Attack
            if (
                i > 0 &&
                card.ability?.["Left Attack"] &&
                opponentCards[i - 1]
            ) {
                applyDamage(
                    card,
                    opponentCards[i - 1],
                    card.ability["Left Attack"]
                );
            }

            // Adjacent Attack
            if (card.ability?.["Adjacent Attack"]) {
                if (i < 2 && opponentCards[i + 1]) {
                    applyDamage(
                        card,
                        opponentCards[i + 1],
                        card.ability["Adjacent Attack"] / 2
                    );
                }
                if (i > 0 && opponentCards[i - 1]) {
                    applyDamage(
                        card,
                        opponentCards[i - 1],
                        card.ability["Adjacent Attack"] / 2
                    );
                }
            }

            // Sweep Attack
            if (card.ability?.["Sweep Attack"]) {
                opponentCards.forEach((opponentCard) => {
                    if (opponentCard) {
                        applyDamage(
                            card,
                            opponentCard,
                            card.ability["Sweep Attack"] / 3
                        );
                    }
                });
            }
        }

        return card;
    });
};

const handleCardAbilitiesAfter = (playerCards, enemyCards) => {
    const updatedPlayerCards = [...playerCards]; // Copy arrays to avoid modifying the originals
    const updatedEnemyCards = [...enemyCards];

    for (let i = 0; i < Math.max(playerCards.length, enemyCards.length); i++) {
        const playerCard = updatedPlayerCards[i];
        const enemyCard = updatedEnemyCards[i];

        if (playerCard) {
            // Power-Up ability (Increase attack after the battle phase)
            if (playerCard.ability?.["Power-Up"]) {
                playerCard.attack += playerCard.ability["Power-Up"];
            }

            // Check interaction with the enemy card in the same position
            if (enemyCard) {
                if (
                    playerCard.ability?.["Immunity"] &&
                    enemyCard.ability?.["Immunity"]
                ) {
                    // Example: If both have immunity, do something special
                    console.log(`Both cards at position ${i} have Immunity.`);
                }
            }

            // Remove one-time use abilities
            if (playerCard.ability?.["Shield"]) {
                delete playerCard.ability["Shield"];
            }

            // Check health after battle
            checkCardHealth(playerCard);
        }

        if (enemyCard) {
            // Power-Up ability
            if (enemyCard.ability?.["Power-Up"]) {
                enemyCard.attack += enemyCard.ability["Power-Up"];
            }

            // Remove one-time use abilities
            if (enemyCard.ability?.["Shield"]) {
                delete enemyCard.ability["Shield"];
            }

            // Check health after battle
            checkCardHealth(enemyCard);
        }
    }

    return { updatedPlayerCards, updatedEnemyCards };
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

// Apply Life Steal ability
const applyLifeSteal = (offender, defender) => {
    if (offender.ability?.["Life Steal"]) {
        const healthGained = Math.min(
            offender.ability["Life Steal"],
            defender.health
        );
        applyHeal(offender, healthGained);
    }
};

const applyRivalry = (offender, defender) => {
    if (offender.ability?.["Rivalry (Attack)"]) {
        if (offender.attack > defender.attack) {
            defender.health -= offender.ability["Rivalry (Attack)"];
        }
    }
    if (offender.ability?.["Rivalry (Health)"]) {
        if (offender.health > defender.health) {
            defender.health -= offender.ability["Rivalry (Health)"];
        }
    }
};

// Apply Recoil
const applyRecoil = (offender, defender) => {
    if (offender.ability?.["Recoil"]) {
        const recoilDamage = Math.min(
            offender.ability["Recoil"] / 2,
            defender.health
        );
        // Deal damage directly
        offender.health -= recoilDamage;
    }
};

const applyDoubleAttack = (offender, defender) => {
    if (offender.ability?.["Double Attack"]) {
        doAttack(offender, defender);
    }
};

// Apply any heal
const applyHeal = (card, health) => {
    card.health = Math.min(card.health + health, card.maxHealth);
};

// Apply any damage from any source
const applyDamage = (offender, defender, damage) => {
    const newDamage = applyArmor(defender, damage);
    if (newDamage === 0 || defender.ability?.["Shield"]) return;
    defender.health -= newDamage;
    // Apply Thorns damage to the attacker after damage is dealt
    let thornsDamage = applyThorns(defender);
    thornsDamage = applyArmor(offender, thornsDamage); // Armor the thorns damage
    offender.health -= thornsDamage;
};

// Check health <= 0
const checkCardHealth = (card) => {
    card.health = Math.max(0, card.health);
    if (card.health === 0 && card.ability?.["Endurance"]) {
        card.health = 1;
        delete card.ability["Endurance"];
    }
};

const doAttack = (playerCard, enemyCard) => {
    let incomingDamage = playerCard.attack;
    applyLifeSteal(playerCard, enemyCard);
    applyRecoil(playerCard, enemyCard);
    applyRivalry(playerCard, enemyCard);
    applyDamage(playerCard, enemyCard, incomingDamage);
};

const handleBattleTurn = (playerCards, enemyCards) => {
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
            doAttack(playerCard, enemyCard);
            applyDoubleAttack(playerCard, enemyCard);

            // Enemy attacks player card
            doAttack(enemyCard, playerCard);
            applyDoubleAttack(enemyCard, playerCard);
        }
    }

    // AFTER TURN ABILITIES (like Power-Up, which should increase attack after battle)
    ({ updatedPlayerCards, updatedEnemyCards } = handleCardAbilitiesAfter(
        updatedPlayerCards,
        updatedEnemyCards
    ));

    return {
        updatedPlayerCards,
        updatedEnemyCards,
    };
};

export { handleBattleTurn };
