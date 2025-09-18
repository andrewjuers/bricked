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
                applyHeal(c, Math.floor(card.ability["Heal Team"] / 3));
                return c;
            });
        }

        // Heal Self
        if (card.ability?.["Heal Self"]) {
            applyHeal(card, Math.floor(card.ability["Heal Self"] / 2));
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
                    Math.floor(card.ability["Right Attack"])
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
                    Math.floor(card.ability["Left Attack"])
                );
            }

            // Adjacent Attack
            if (card.ability?.["Adjacent Attack"]) {
                if (i < 2 && opponentCards[i + 1]) {
                    applyDamage(
                        card,
                        opponentCards[i + 1],
                        Math.floor(card.ability["Adjacent Attack"] / 2)
                    );
                }
                if (i > 0 && opponentCards[i - 1]) {
                    applyDamage(
                        card,
                        opponentCards[i - 1],
                        Math.floor(card.ability["Adjacent Attack"] / 2)
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
                            Math.floor(card.ability["Sweep Attack"] / 3)
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
                playerCard.attack += Math.floor(playerCard.ability["Power-Up"]);
            }

            // Check interaction with the enemy card in the same position
            if (enemyCard) {
                if (
                    playerCard.ability?.["Immunity"] &&
                    enemyCard.ability?.["Immunity"]
                ) {
                    console.log(`Both cards at position ${i} have Immunity.`);
                }
            }

            // Remove one-time use abilities
            if (playerCard.ability?.["Shield"]) {
                delete playerCard.ability["Shield"];
            }

            checkCardHealth(playerCard);
        }

        if (enemyCard) {
            if (enemyCard.ability?.["Power-Up"]) {
                enemyCard.attack += Math.floor(enemyCard.ability["Power-Up"]);
            }

            if (enemyCard.ability?.["Shield"]) {
                delete enemyCard.ability["Shield"];
            }

            checkCardHealth(enemyCard);
        }
    }

    return { updatedPlayerCards, updatedEnemyCards };
};

// Apply Armor to incoming damage
const applyArmor = (card, incomingDamage) => {
    if (card.ability?.["Armor"]) {
        const damageReduction = Math.floor(card.ability["Armor"] / 2);
        return Math.max(incomingDamage - damageReduction, 0);
    }
    return incomingDamage;
};

// Apply Thorns damage back to attacker
const applyThorns = (card) => {
    if (card.ability?.["Thorns"]) {
        return Math.floor(card.ability["Thorns"]);
    }
    return 0;
};

// Apply Life Steal ability
const applyLifeSteal = (offender, defender) => {
    if (offender.ability?.["Life Steal"]) {
        const healthGained = Math.min(
            Math.floor(offender.ability["Life Steal"]),
            defender.health
        );
        applyHeal(offender, healthGained);
    }
};

const applyRivalry = (offender, defender) => {
    if (offender.ability?.["Rivalry (Attack)"]) {
        if (offender.attack > defender.attack) {
            defender.health -= Math.floor(offender.ability["Rivalry (Attack)"]);
        }
    }
    if (offender.ability?.["Rivalry (Health)"]) {
        if (offender.health > defender.health) {
            defender.health -= Math.floor(offender.ability["Rivalry (Health)"]);
        }
    }
};

// Apply Recoil
const applyRecoil = (offender, defender) => {
    if (offender.ability?.["Recoil"]) {
        const recoilDamage = Math.min(
            Math.floor(offender.ability["Recoil"] / 2),
            defender.health
        );
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
    card.health = Math.min(card.health + Math.floor(health), card.maxHealth);
};

// Apply any damage from any source
const applyDamage = (offender, defender, damage) => {
    const newDamage = applyArmor(defender, Math.floor(damage));
    if (newDamage === 0 || defender.ability?.["Shield"]) return;
    defender.health -= newDamage;

    let thornsDamage = applyThorns(defender);
    thornsDamage = applyArmor(offender, Math.floor(thornsDamage));
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
    let incomingDamage = Math.floor(playerCard.attack);
    applyLifeSteal(playerCard, enemyCard);
    applyRecoil(playerCard, enemyCard);
    applyRivalry(playerCard, enemyCard);
    applyDamage(playerCard, enemyCard, incomingDamage);
};

const handleBattleTurn = (playerCards, enemyCards) => {
    let updatedPlayerCards = [...playerCards];
    let updatedEnemyCards = [...enemyCards];

    updatedPlayerCards = handleCardAbilitiesBefore(
        updatedPlayerCards,
        updatedEnemyCards
    );
    updatedEnemyCards = handleCardAbilitiesBefore(
        updatedEnemyCards,
        updatedPlayerCards
    );

    for (let i = 0; i < 3; i++) {
        let playerCard = updatedPlayerCards[i];
        let enemyCard = updatedEnemyCards[i];

        if (playerCard && enemyCard) {
            doAttack(playerCard, enemyCard);
            applyDoubleAttack(playerCard, enemyCard);

            doAttack(enemyCard, playerCard);
            applyDoubleAttack(enemyCard, playerCard);
        }
    }

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
