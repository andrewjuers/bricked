import cardsData from "../data/cards2.json";

const dylanDeck = ["Deer", "Chicken", "Fish", "Cat", "Moose", "Bat", "Worm", "Bull", "Lion", "Lizard", "Horse", "Whale"];

// Function to get a card by name from cardsData
function getCard(name) {
    return cardsData.find(
        (card) => card.name.toLowerCase() === name.toLowerCase()
    ) || null; // Return null if not found
}

// Function to create a custom deck (flat array of cards)
export function createCustomDeck(cardNames) {
    let deck = [];

    cardNames.forEach((name) => {
        let card = getCard(name);
        if (card) {
            deck.push(card);
        }
    });

    return deck;
}

// Function to create Dylan's deck
export function createDylanDeck() {
    return createCustomDeck(dylanDeck);
}
