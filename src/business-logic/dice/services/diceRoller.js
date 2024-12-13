/**
 * Rolls a dice with the given number of sides
 * @param {number} numOfSides Upper limit of the dice roll range
 * @returns {number} The result of the dice roll
 */
function rollDice(numOfSides) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    return (randomBuffer[0] % numOfSides) + 1;
}

module.exports = { rollDice };