import cardsData from "../data/cards.json";

function getRandomCards(levelCards, count) {
  const shuffled = [...levelCards].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function generateOpponentDeck() {
  return {
    level1: getRandomCards(cardsData.level1, 3),
    level2: getRandomCards(cardsData.level2, 3),
    level3: getRandomCards(cardsData.level3, 3),
  };
}
