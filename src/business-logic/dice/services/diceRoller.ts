/**
 * Rolls a dice with the given number of sides
 */
export function rollDice(numOfSides: number): number {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    return (randomBuffer[0] % numOfSides) + 1;
}