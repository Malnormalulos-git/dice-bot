function rollDice(numOfSides) {
  return Math.floor(Math.random() * numOfSides) + 1;
}

module.exports = { rollDice };