import cardsData from "../data/cards.json";

const dylanDeck = {
    level1: ["Deer", "Chicken", "Fish"],
    level2: ["Cat", "Moose", "Bat"],
    level3: ["Worm", "Bull", "Lion"],
    level4: ["Lizard", "Horse", "Whale"],
};

// Function to get a card by name from cardsData
function getCard(name) {
    for (let level in cardsData) {
        let card = cardsData[level].find(
            (card) => card.name.toLowerCase() === name.toLowerCase()
        );
        if (card) return card;
    }
    return null; // Return null if not found
}

// Function to create a custom deck
export function createCustomDeck(cardNames) {
    let deck = { level1: [], level2: [], level3: [], level4: [] };

    cardNames.forEach((name) => {
        let card = getCard(name);
        if (card) {
            let levelKey = `level${card.level}`;
            if (deck[levelKey]) {
                deck[levelKey].push(card);
            }
        }
    });

    return deck;
}

// Function to create Dylan's deck
export function createDylanDeck() {
    let cardNames = Object.values(dylanDeck).flat();
    return createCustomDeck(cardNames);
}
