import cardsData from "../data/cards2.json"; // the new JSON

function getRandomCards(deck, count) {
  const shuffled = [...deck].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function generateOpponentDeck() {
  // Since we no longer have levels, just pick 12 cards total
  const fullDeck = cardsData.cards; // your array of all cards
  return getRandomCards(fullDeck, 12);
}
