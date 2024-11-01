function rollDice(numOfSides) {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return (randomBuffer[0] % numOfSides) + 1;
}

module.exports = { rollDice };